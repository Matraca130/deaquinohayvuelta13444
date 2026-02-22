// ============================================================
// AIMarkdown — Simple markdown renderer for Axon AI responses
// Extracted from AxonAIAssistant.tsx
// ============================================================
import React from 'react';

function processInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    const codeParts = part.split(/(`[^`]+`)/g);
    if (codeParts.length > 1) {
      return codeParts.map((cp, ci) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return <code key={`${i}-${ci}`} className="bg-gray-100 text-violet-600 px-1 py-0.5 rounded text-xs font-mono">{cp.slice(1, -1)}</code>;
        }
        return cp;
      });
    }
    return part;
  });
}

export function AIMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="font-bold text-gray-800 mt-3 mb-1 text-sm">
          {processInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="font-bold text-gray-800 mt-4 mb-1.5">
          {processInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-3 border-violet-400 pl-3 my-2 text-violet-700 bg-violet-50 py-2 pr-3 rounded-r-lg text-xs italic">
          {processInline(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-violet-400 mt-1 shrink-0">&#8226;</span>
          <span>{processInline(trimmed.slice(2))}</span>
        </div>
      );
    } else if (trimmed === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="my-1">{processInline(trimmed)}</p>);
    }
  });

  return <>{elements}</>;
}
