const fs = require('fs');
let content = fs.readFileSync('src/components/GeminiSidePanel.tsx', 'utf8');

const target = `                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none max-w-[85%] leading-relaxed">
                  {streamingText}
                  <span className="inline-block w-1 h-3 bg-slate-400 ml-1 animate-pulse align-middle" />
                </div>`;

const replacement = `                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none max-w-[85%] leading-relaxed">
                  <Markdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0 inline-block w-full" {...props} />,
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
                      code: ({node, className, children, ...props}) => {
                        const match = /language-(\\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\\n');
                        if (isInline) {
                          return <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-[12px] font-mono text-slate-300" {...props}>{children}</code>;
                        }
                        return <code className="block bg-slate-800/80 p-3 rounded-lg text-[12px] font-mono text-slate-300 mb-2 overflow-x-auto whitespace-pre-wrap" {...props}>{children}</code>;
                      },
                    }}
                  >
                    {streamingText + (streamingText.endsWith('\\n') ? '' : ' ▍')}
                  </Markdown>
                </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/GeminiSidePanel.tsx', content);
