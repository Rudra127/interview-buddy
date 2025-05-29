import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { CodeState } from '../types';
import { Play, RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  codeState: CodeState;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ codeState, onChange, readOnly = false }: CodeEditorProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...\n');

    try {
      if (codeState.language === 'javascript') {
        // Create a safe evaluation environment
        const safeEval = new Function(
          'console',
          `
          try {
            ${codeState.content}
          } catch (error) {
            console.error(error);
          }
        `
        );

        let output = '';
        const mockConsole = {
          log: (...args: any[]) => {
            output += args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ') + '\n';
          },
          error: (...args: any[]) => {
            output += 'Error: ' + args.map(arg => 
              arg instanceof Error ? arg.message : String(arg)
            ).join(' ') + '\n';
          }
        };

        safeEval(mockConsole);
        setOutput(output || 'No output');
      } else if (codeState.language === 'python') {
        setOutput('Python execution is coming soon!\n');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }

    setIsRunning(false);
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] rounded-xl overflow-hidden border border-dark-lighter">
        <Editor
          height="100%"
          language={codeState.language}
          value={codeState.content}
          theme="vs-dark"
          onChange={(value) => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly,
            automaticLayout: true,
          }}
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          Run Code
        </button>
        <button
          onClick={() => setOutput('')}
          className="flex items-center gap-2 px-4 py-2 bg-dark-light hover:bg-dark-lighter rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Output
        </button>
      </div>
      {output && (
        <div className="h-[200px] bg-dark-lighter rounded-xl p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
          {output}
        </div>
      )}
    </div>
  );
}