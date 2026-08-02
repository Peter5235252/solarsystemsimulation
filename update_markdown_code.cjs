const fs = require('fs');
let content = fs.readFileSync('src/components/AIResearcher.tsx', 'utf8');

const target = `                               blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-3 my-2 text-slate-400 italic" {...props} />,
                             }}`;

const replacement = `                               blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-3 my-2 text-slate-400 italic" {...props} />,
                               code: ({node, className, children, ...props}) => {
                                 const match = /language-(\\w+)/.exec(className || '');
                                 const isInline = !match && !String(children).includes('\\n');
                                 if (isInline) {
                                   return <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-[12px] font-mono text-slate-300" {...props}>{children}</code>;
                                 }
                                 return <code className="block bg-slate-800/80 p-3 rounded-lg text-[12px] font-mono text-slate-300 mb-2 overflow-x-auto whitespace-pre-wrap" {...props}>{children}</code>;
                               },
                             }}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/AIResearcher.tsx', content);
