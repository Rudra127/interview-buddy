import { useState } from 'react';
import { Send, Code, Share2 } from 'lucide-react';
import { Message, CodingQuestion, TestCase } from '../types';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string, type: 'chat' | 'question') => void;
  isInterviewer: boolean;
  onShareRoom: () => void;
}

export function Chat({ messages, onSendMessage, isInterviewer, onShareRoom }: ChatProps) {
  const [message, setMessage] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [question, setQuestion] = useState<CodingQuestion>({
    title: '',
    description: '',
    starterCode: '',
    language: 'javascript',
    examples: [''],
    constraints: [''],
    testCases: [{ input: '', expectedOutput: '' }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message, 'chat');
    setMessage('');
  };

  const addExample = () => {
    setQuestion(prev => ({
      ...prev,
      examples: [...prev.examples, '']
    }));
  };

  const addConstraint = () => {
    setQuestion(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  const addTestCase = () => {
    setQuestion(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '' }]
    }));
  };

  const updateExample = (index: number, value: string) => {
    setQuestion(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex)
    }));
  };

  const updateConstraint = (index: number, value: string) => {
    setQuestion(prev => ({
      ...prev,
      constraints: prev.constraints.map((con, i) => i === index ? value : con)
    }));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    setQuestion(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const questionText = `
# ${question.title}

${question.description}

## Examples
${question.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

## Constraints
${question.constraints.map((con, i) => `${i + 1}. ${con}`).join('\n')}

## Test Cases
${question.testCases.map((tc, i) => `
Test Case ${i + 1}:
Input: ${tc.input}
Expected Output: ${tc.expectedOutput}
`).join('\n')}

Starter code:
\`\`\`${question.language}
${question.starterCode}
\`\`\`
`;
    onSendMessage(questionText, 'question');
    setShowQuestionModal(false);
    setQuestion({
      title: '',
      description: '',
      starterCode: '',
      language: 'javascript',
      examples: [''],
      constraints: [''],
      testCases: [{ input: '', expectedOutput: '' }]
    });
  };

  return (
    <div className="flex flex-col h-full bg-dark-lighter rounded-xl p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <span className="text-sm text-gray-400">{msg.sender}</span>
            <div className={`bg-dark-light p-3 rounded-lg text-white max-w-[80%] ${msg.type === 'question' ? 'whitespace-pre-wrap font-mono' : ''}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex gap-2 mb-4">
          {isInterviewer && (
            <button
              onClick={() => setShowQuestionModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              <Code className="w-5 h-5" />
              Send Problem
            </button>
          )}
          <button
            onClick={onShareRoom}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-dark-light hover:bg-dark-lighter rounded-lg transition-colors"
            title="Share room link"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-dark-light text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="p-2 bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-lighter rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Send Coding Problem</h2>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Problem Title</label>
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) => setQuestion({ ...question, title: e.target.value })}
                  className="w-full bg-dark-light rounded-lg px-4 py-2"
                  placeholder="e.g., Two Sum Problem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Problem Description</label>
                <textarea
                  value={question.description}
                  onChange={(e) => setQuestion({ ...question, description: e.target.value })}
                  className="w-full bg-dark-light rounded-lg px-4 py-2 h-32"
                  placeholder="Describe the problem requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Examples</label>
                {question.examples.map((example, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={example}
                      onChange={(e) => updateExample(index, e.target.value)}
                      className="w-full bg-dark-light rounded-lg px-4 py-2"
                      placeholder={`Example ${index + 1}`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExample}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  + Add Example
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Constraints</label>
                {question.constraints.map((constraint, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={constraint}
                      onChange={(e) => updateConstraint(index, e.target.value)}
                      className="w-full bg-dark-light rounded-lg px-4 py-2"
                      placeholder={`Constraint ${index + 1}`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addConstraint}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  + Add Constraint
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Test Cases</label>
                {question.testCases.map((testCase, index) => (
                  <div key={index} className="mb-4 p-3 bg-dark rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Test Case {index + 1}</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={testCase.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        className="w-full bg-dark-light rounded-lg px-4 py-2"
                        placeholder="Input"
                      />
                      <input
                        type="text"
                        value={testCase.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        className="w-full bg-dark-light rounded-lg px-4 py-2"
                        placeholder="Expected Output"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTestCase}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  + Add Test Case
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Starter Code</label>
                <textarea
                  value={question.starterCode}
                  onChange={(e) => setQuestion({ ...question, starterCode: e.target.value })}
                  className="w-full bg-dark-light rounded-lg px-4 py-2 h-32 font-mono"
                  placeholder="Provide starter code..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={question.language}
                  onChange={(e) => setQuestion({ ...question, language: e.target.value as 'javascript' | 'python' })}
                  className="w-full bg-dark-light rounded-lg px-4 py-2"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-dark-light rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg"
                >
                  Send Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}