const fs = require('fs');
let content = fs.readFileSync('src/components/AIResearcher.tsx', 'utf8');

// Add import
if (!content.includes('import Markdown')) {
  content = content.replace(
    "import { X, Send, Sparkles, User, Bot, Loader2, RefreshCcw, History, Library } from 'lucide-react';",
    "import { X, Send, Sparkles, User, Bot, Loader2, RefreshCcw, History, Library } from 'lucide-react';\nimport Markdown from 'react-markdown';"
  );
}

// Replace the mapping logic
const target = `                           {msg.text.split('\\n').map((line, i) => (
                             <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                           ))}
`;
const replacement = `                           <Markdown
                             components={{
                               p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                               strong: ({node, ...props}) => <strong className="font-bold text-slate-100" {...props} />,
                               em: ({node, ...props}) => <em className="italic text-slate-300" {...props} />,
                               h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-slate-100" {...props} />,
                               h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-slate-100" {...props} />,
                               h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-2 text-slate-100" {...props} />,
                               ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                               ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                               li: ({node, ...props}) => <li className="pl-1" {...props} />,
                               a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                               blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-3 my-2 text-slate-400 italic" {...props} />,
                             }}
                           >
                             {msg.text}
                           </Markdown>\n`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/AIResearcher.tsx', content);
