export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  emoji: string;
  estimatedTime: string;
  content: TopicContent;
  quiz: QuizQuestion[];
  exercise: Exercise;
}

export interface TopicContent {
  kidExplanation: string;
  professionalExplanation: string;
  keyPoints: string[];
  realWorldExamples: string[];
  proExample: string;
  imageUrl?: string;
  imageAlt?: string;
  analogyTitle: string;
  analogy: string;
  deepDive?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Exercise {
  title: string;
  description: string;
  steps: ExerciseStep[];
  hint: string;
  solution: string;
}

export interface ExerciseStep {
  step: number;
  instruction: string;
  hint: string;
  codeSnippet?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  color: string;
  topics: Topic[];
}

export interface UserProgress {
  userId: string;
  completedTopics: string[];
  quizScores: Record<string, number>;
  unlockedModules: string[];
}
