export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'question';
}

export interface CodeState {
  content: string;
  language: 'javascript' | 'python';
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface ProblemStatement {
  title: string;
  description: string;
  examples: string[];
  constraints: string[];
  testCases: TestCase[];
}

export interface Room {
  id: string;
  participants: string[];
  messages: Message[];
  codeState: CodeState;
  expiresAt: number;
  problemStatement?: ProblemStatement;
}

export interface CodingQuestion {
  title: string;
  description: string;
  starterCode: string;
  language: 'javascript' | 'python';
  examples: string[];
  constraints: string[];
  testCases: TestCase[];
}