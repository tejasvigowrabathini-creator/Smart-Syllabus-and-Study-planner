export const mockStudyPlan = {
  success: true,
  // High-level metadata
  courseCode: "CS301",
  courseTitle: "Advanced Data Structures & Algorithms",
  instructor: "Dr. Elizabeth Vance",
  duration: "8 Weeks",
  length: 8, // Populated in case it checks total weeks length directly
  
  // Backwards compatibility for raw string markdown display
  plan: "8-Week Study Plan: Advanced Data Structures & Algorithms\n\n- Week 1-2: Foundations & Linear Structures\n- Week 3-4: Trees & Hierarchical Data\n- Week 5-6: Graphs & Advanced Traversal\n- Week 7-8: Dynamic Programming & Final Review",

  // In case your UI extracts information from a dedicated courseInfo object
  courseInfo: {
    code: "CS301",
    title: "Advanced Data Structures & Algorithms",
    instructor: "Dr. Elizabeth Vance",
    duration: "8 Weeks"
  },

  // Main modules list (Array 1)
  modules: [
    {
      id: "mod-1",
      title: "Week 1-2: Foundations & Linear Structures",
      duration: "2 weeks",
      focus: "Review Time/Space Complexity (Big O) and Master Arrays/Linked Lists.",
      dailyGoal: "2 hours of conceptual review, 1 hour of practice problems.",
      milestone: "Implement a doubly linked list from scratch.",
      length: 2,
      tasks: ["Review Big O Notation", "Implement Doubly Linked List", "Practice 3 Array Problems"]
    },
    {
      id: "mod-2",
      title: "Week 3-4: Trees & Hierarchical Data",
      duration: "2 weeks",
      focus: "Binary Trees, BSTs, and AVL Trees. Understanding balancing mechanisms.",
      dailyGoal: "Practice tree traversals recursively and iteratively.",
      milestone: "Solve 5 classic tree-based problems on LeetCode.",
      length: 2,
      tasks: ["Binary Tree Traversals", "AVL Tree Rotations", "Solve 5 LeetCode Tree Problems"]
    },
    {
      id: "mod-3",
      title: "Week 5-6: Graphs & Advanced Traversal",
      duration: "2 weeks",
      focus: "Graph representations (Adjacency Matrix/List) and BFS/DFS.",
      dailyGoal: "Implement Dijkstra's Shortest Path algorithm.",
      milestone: "Map out a real-world routing problem using graph concepts.",
      length: 2,
      tasks: ["Graph BFS/DFS Implementation", "Dijkstra's Algorithm", "Shortest Path Mini-Project"]
    },
    {
      id: "mod-4",
      title: "Week 7-8: Dynamic Programming & Final Review",
      duration: "2 weeks",
      focus: "Memoization vs. Tabulation techniques.",
      dailyGoal: "Break down complex multi-stage decision problems.",
      milestone: "Complete the comprehensive course mock exam.",
      length: 2,
      tasks: ["Memoization vs Tabulation", "Knapsack Problem Practice", "Final Course Mock Exam"]
    }
  ],

  // In case your UI uses a schedule array layout instead of modules (Array 2)
  schedule: [
    { week: 1, topic: "Big O & Arrays", length: 1 },
    { week: 2, topic: "Linked Lists", length: 1 },
    { week: 3, topic: "Binary Search Trees", length: 1 },
    { week: 4, topic: "AVL Trees & Balancing", length: 1 },
    { week: 5, topic: "Graph Traversals (BFS/DFS)", length: 1 },
    { week: 6, topic: "Shortest Path Algorithms", length: 1 },
    { week: 7, topic: "Dynamic Programming Foundations", length: 1 },
    { week: 8, topic: "Comprehensive Review & Final Exam", length: 1 }
  ],

  // In case your UI has a standalone checklist items list (Array 3)
  weeks: [
    { title: "Week 1-2", length: 2 },
    { title: "Week 3-4", length: 2 },
    { title: "Week 5-6", length: 2 },
    { title: "Week 7-8", length: 2 }
  ],
  
  tasks: ["Task 1", "Task 2", "Task 3", "Task 4"]
};
