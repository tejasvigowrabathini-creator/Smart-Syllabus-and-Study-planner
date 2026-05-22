import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Configure simple logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. API calls will fail.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health checks
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", model: "gemini-3.5-flash", initialized: !!apiKey });
});

// POST /api/process-syllabus endpoint
app.post("/api/process-syllabus", async (req, res) => {
  try {
    const { syllabus_text } = req.body;
    if (!syllabus_text || typeof syllabus_text !== "string" || syllabus_text.trim().length < 10) {
      return res.status(422).json({ detail: "Syllabus text must be at least 10 characters long." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ detail: "Gemini API key is missing on the server. Please add it to your environment." });
    }

    console.log(`Processing syllabus of length: ${syllabus_text.length}`);
    const full_prompt = `SYLLABUS TEXT:\n\n${syllabus_text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: full_prompt }]
        }
      ],
      config: {
        systemInstruction: `You are an expert academic curriculum designer and study coach. 
Analyze the provided syllabus and generate a comprehensive, realistic study plan.

RULES:
- Extract real course name, code, and instructor from the text if present.
- Create logically sequenced modules that build on each other.
- Assign difficulty honestly: Easy (foundational), Medium (requires prior modules), Hard (synthesis/advanced application).
- Estimate study hours realistically: 1 credit hour ≈ 2-3 study hours/week.
- Ensure every module_title in timeline.assigned_modules exactly matches a module_title in the modules array.
- timeline length must equal course_info.overall_weeks.
- Distribute workload evenly; flag exam weeks / project deliverables as milestones.
- Ensure overall_weeks is between 1 and 52.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            course_info: {
              type: Type.OBJECT,
              properties: {
                course_name: { type: Type.STRING, description: "Full official name of the course." },
                overall_weeks: { type: Type.INTEGER, description: "Total number of weeks in the study plan (1-52)." },
                course_code: { type: Type.STRING, description: "Optional course code (e.g., 'CS301'). Null if not present." },
                instructor: { type: Type.STRING, description: "Instructor name if mentioned in the syllabus. Null otherwise." }
              },
              required: ["course_name", "overall_weeks"]
            },
            modules: {
              type: Type.ARRAY,
              description: "Ordered list of all study modules for the course.",
              items: {
                type: Type.OBJECT,
                properties: {
                  module_title: { type: Type.STRING, description: "Concise title for this study module." },
                  difficulty: { type: Type.STRING, description: "Assessed difficulty: Easy, Medium, or Hard.", enum: ["Easy", "Medium", "Hard"] },
                  estimated_hours: { type: Type.NUMBER, description: "Estimated total study hours for this module." },
                  topics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Specific sub-topics or concepts covered in this module."
                  },
                  learning_outcomes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "What the student will be able to do after completing this module."
                  }
                },
                required: ["module_title", "difficulty", "estimated_hours", "topics", "learning_outcomes"]
              }
            },
            timeline: {
              type: Type.ARRAY,
              description: "Week-by-week sequential study plan. Length should equal course_info.overall_weeks.",
              items: {
                type: Type.OBJECT,
                properties: {
                  week_number: { type: Type.INTEGER, description: "Sequential week number, starting from 1." },
                  weekly_objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Concrete, measurable goals to achieve this week."
                  },
                  assigned_modules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of module_title strings (must exactly match titles in 'modules' array) assigned to this week."
                  },
                  estimated_weekly_hours: { type: Type.NUMBER, description: "Sum of estimated_hours for all assigned modules this week." },
                  milestone: { type: Type.STRING, description: "Optional major milestone this week (e.g., 'Midterm Exam', 'Project Submission'). Null if none." }
                },
                required: ["week_number", "weekly_objectives", "assigned_modules", "estimated_weekly_hours"]
              }
            },
            generation_notes: { type: Type.STRING, description: "Any caveats or assumptions made during plan generation." }
          },
          required: ["course_info", "modules", "timeline"]
        },
        temperature: 0.2,
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Error processing syllabus:", error);
    res.status(500).json({ detail: error.message || "An unexpected error occurred during syllabus processing." });
  }
});

// iCalendar export endpoint
app.post("/api/export-ical", (req, res) => {
  try {
    const studyPlan = req.body;
    if (!studyPlan || !studyPlan.course_info || !studyPlan.timeline) {
      return res.status(400).json({ detail: "Invalid study plan payload for iCalendar generation." });
    }

    const { course_info, timeline } = studyPlan;
    const courseName = course_info.course_name || "Study Plan";
    const courseCode = course_info.course_code ? ` (${course_info.course_code})` : "";

    let ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Smart Syllabus Planner//NONSGML v1.0//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    const today = new Date();

    timeline.forEach((week: any) => {
      // Start of week = today + (week_number - 1) * 7 days
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + (week.week_number - 1) * 7);

      // End of week = startDate + 7 days
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);

      const formatDate = (date: Date) => {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, "0");
        const d = String(date.getUTCDate()).padStart(2, "0");
        return `${y}${m}${d}`;
      };

      const startStr = formatDate(startDate);
      const endStr = formatDate(endDate);
      const stampStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const uid = `week-${week.week_number}-${Date.now()}@smartsyllabus.com`;

      const summary = `Study Plan: Week ${week.week_number} - ${courseName}${courseCode}`;
      const description = [
        `Weekly Objectives:`,
        ...(week.weekly_objectives || []).map((obj: string) => `- ${obj}`),
        ``,
        `Assigned Modules: ${(week.assigned_modules || []).join(", ")}`,
        `Estimated study time: ${week.estimated_weekly_hours} hours`,
        week.milestone ? `Milestone: ${week.milestone}` : ""
      ].filter(Boolean).join("\\n");

      ics.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${stampStr}`,
        `DTSTART;VALUE=DATE:${startStr}`,
        `DTEND;VALUE=DATE:${endStr}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT"
      );
    });

    ics.push("END:VCALENDAR");

    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", `attachment; filename="${courseName.replace(/[^a-zA-Z0-9]/g, "_")}_Study_Plan.ics"`);
    res.send(ics.join("\r\n"));
  } catch (error: any) {
    console.error("Error generating iCalendar:", error);
    res.status(500).json({ detail: "Failed to generate iCalendar file." });
  }
});

// Vite HTML setup & Production Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
