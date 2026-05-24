export interface Module {
  id: string;
  title: string;
  duration: string;
  focus: string;
  dailyGoal: string;
  milestone: string;
}

export interface StudyPlanResponse {
  success: boolean;
  plan: string; // Left here in case other components read the raw string
  courseInfo?: {
    code: string;
    title: string;
    instructor: string;
    duration: string;
  };
  modules?: Module[];
}

export const mockStudyPlan: StudyPlanResponse = {
  success: true,
  plan: "8-Week Study Plan: Advanced Data Structures & Algorithms",
  courseInfo: {
    code: "CS301",
    title: "Advanced Data Structures & Algorithms",
    instructor: "Dr. Elizabeth Vance",
    duration: "8 Weeks"
  },
  modules: [
    {
      id: "mod-1",
      title: "Week 1-2: Foundations & Linear Structures",
      duration: "2 weeks",
      focus: "Review Time/Space Complexity (Big O) and Master Arrays/Linked Lists.",
      dailyGoal: "2 hours of conceptual review, 1 hour of practice problems.",
      milestone: "Implement a doubly linked list from scratch."
    },
    {
      id: "mod-2",
      title: "Week 3-4: Trees & Hierarchical Data",
      duration: "2 weeks",
      focus: "Binary Trees, BSTs, and AVL Trees. Understanding balancing mechanisms.",
      dailyGoal: "Practice tree traversals recursively and iteratively.",
      milestone: "Solve 5 classic tree-based problems on LeetCode."
    },
    {
      id: "mod-3",
      title: "Week 5-6: Graphs & Advanced Traversal",
      duration: "2 weeks",
      focus: "Graph representations (Adjacency Matrix/List) and BFS/DFS.",
      dailyGoal: "Implement Dijkstra's Shortest Path algorithm.",
      milestone: "Map out a real-world routing problem using graph concepts."
    },
    {
      id: "mod-4",
      title: "Week 7-8: Dynamic Programming & Final Review",
      duration: "2 weeks",
      focus: "Memoization vs. Tabulation techniques.",
      dailyGoal: "Break down complex multi-stage decision problems.",
      milestone: "Complete the comprehensive course mock exam."
    }
  ]
};
