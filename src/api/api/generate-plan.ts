import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { syllabus } = req.body;

  if (!syllabus || typeof syllabus !== 'string') {
    return res.status(400).json({ error: 'Missing syllabus text' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: `You are a study plan generator. Given a syllabus, return ONLY valid JSON with no markdown, no backticks, no explanation. Use this exact structure:
{
  "courseInfo": { "code": "string", "title": "string", "instructor": "string", "duration": "string" },
  "modules": [
    { "id": "mod-1", "title": "string", "duration": "string", "focus": "string", "dailyGoal": "string", "milestone": "string", "tasks": ["string"], "difficulty": "Easy|Medium|Hard", "estimated_hours": 6 }
  ],
  "timeline": [
    { "week_number": 1, "topic": "string", "milestone": "string" }
  ]
}
Generate 4 modules and matching timeline rows based on the actual syllabus content.`,
        messages: [{ role: "user", content: `Generate a study plan for this syllabus:\n\n${syllabus}` }]
      })
    });

    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? "";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not parse AI response.");
      parsed = JSON.parse(match[0]);
    }

    return res.status(200).json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown server error";
    return res.status(500).json({ error: msg });
  }
}
