import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BarChart2,
  User,
  FileText
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  duration: string;
  focus: string;
  dailyGoal: string;
  milestone: string;
  tasks: string[];
  difficulty: string;
  estimated_hours: number;
}

interface TimelineRow {
  week_number: number;
  topic: string;
  milestone: string;
}

interface StudyPlan {
  courseInfo: {
    code: string;
    title: string;
    instructor: string;
    duration: string;
  };
  modules: Module[];
  timeline: TimelineRow[];
}

export default function App() {
  const [syllabusText, setSyllabusText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const handleSubmitSyllabus = async () => {
    if (syllabusText.trim().length < 10) {
      setError("Please paste a valid syllabus with at least 10 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStudyPlan(null);
    setCompletedModules([]);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a study plan generator. Given a syllabus, return ONLY valid JSON with no markdown, no backticks, no explanation. The JSON must follow this exact structure:
{
  "courseInfo": {
    "code": "string",
    "title": "string",
    "instructor": "string",
    "duration": "string"
  },
  "modules": [
    {
      "id": "mod-1",
      "title": "string",
      "duration": "string",
      "focus": "string",
      "dailyGoal": "string",
      "milestone": "string",
      "tasks": ["string", "string", "string"],
      "difficulty": "Easy|Medium|Hard",
      "estimated_hours": 6
    }
  ],
  "timeline": [
    {
      "week_number": 1,
      "topic": "string",
      "milestone": "string"
    }
  ]
}
Generate 4 modules and matching timeline rows. Base everything on the actual syllabus content provided.`,
          messages: [
            {
              role: "user",
              content: `Generate a study plan for this syllabus:\n\n${syllabusText}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text ?? "";

      let parsed: StudyPlan;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse response from AI.");
        parsed = JSON.parse(match[0]);
      }

      if (!parsed.modules || !Array.isArray(parsed.modules)) {
        throw new Error("Invalid plan structure received.");
      }

      setStudyPlan(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModuleCompleted = (id: string) => {
    setCompletedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleLoadSample = () => {
    setSyllabusText(`COURSE SYLLABUS: CS301 Advanced Data Structures & Algorithms
Instructor: Dr. Elizabeth Vance
Term: Fall Academic Session

COURSE DESCRIPTION:
This course delivers an intensive deep-dive into complex architectural paradigms and algorithmic optimizations. Students will investigate asymptotic running times, master nonlinear data structures, explore advanced graph optimizations, and complete foundational sequences in multi-stage dynamic programming.

REQUIRED EXPECTATIONS:
- Midterm Assessment covering Tree balancing algorithms
- Comprehensive multi-graph routing system deployment
- Final Mock Benchmark examination`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-amber-300" />
            <div>
              <h1 className="text-2xl font-black tracking-tight">Smart Syllabus</h1>
              <p className="text-xs text-indigo-100 font-medium">AI-Powered Study Planner</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>Input Syllabus Text</span>
            </h2>

            <textarea
              className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-slate-50 placeholder-slate-400"
              placeholder="Paste your syllabus here..."
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
            />

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 text-rose-700 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleLoadSample}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold bg-white hover:bg-slate-50 transition-all"
              >
                Load Sample
              </button>
              <button
                onClick={handleSubmitSyllabus}
                disabled={isLoading}
                className="flex-[2] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Plan...</span>
                  </>
                ) : (
                  <span>Assemble Study Plan</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!studyPlan ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Study Plan Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Paste a syllabus on the left and click Assemble Study Plan.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 mb-2 border border-indigo-100">
                    {studyPlan.courseInfo?.code || "COURSE"}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 leading-tight break-words">
                    {studyPlan.courseInfo?.title || "Study Plan"}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center space-x-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{studyPlan.courseInfo?.instructor || "Self-Paced"}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{studyPlan.courseInfo?.duration || "Flexible"}</span>
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center space-x-4 flex-shrink-0">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Progress</div>
                    <div className="text-lg font-black text-slate-800">
                      {completedModules.length} / {studyPlan.modules.length} Done
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 pl-1">Study Modules</h3>
                {studyPlan.modules.map((mod) => {
                  const isDone = completedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className={`bg-white rounded-2xl border transition-all shadow-sm ${isDone ? 'border-emerald-200 opacity-80' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base font-bold break-words ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {mod.title}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1 break-words">
                              {mod.focus}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleModuleCompleted(mod.id)}
                            className={`p-2 rounded-xl border transition-all flex items-center space-x-1.5 font-bold text-xs flex-shrink-0 ${isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">{isDone ? 'Done' : 'Mark Done'}</span>
                          </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Daily Goal</span>
                            <span className="text-slate-700 font-semibold break-words">{mod.dailyGoal}</span>
                          </div>
                          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                            <span className="text-indigo-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Milestone</span>
                            <span className="text-indigo-900 font-bold break-words">{mod.milestone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {studyPlan.timeline && studyPlan.timeline.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span>Weekly Timeline</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs min-w-[400px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3 w-16">Week</th>
                          <th className="p-3">Topic</th>
                          <th className="p-3">Milestone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700">
                        {studyPlan.timeline.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-all">
                            <td className="p-3 text-indigo-600 font-bold">W{row.week_number}</td>
                            <td className="p-3 font-semibold text-slate-800 break-words">{row.topic}</td>
                            <td className="p-3 text-slate-500 break-words">{row.milestone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
