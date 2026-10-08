import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  Send, 
  X, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Minimize2,
  Sparkles
} from 'lucide-react';
import { assistantAPI } from '../api/client';

const SUGGESTED_PROMPTS = [
  "Explain SATARK risk classification criteria",
  "Most frequent cybercrime categories in NCRB data",
  "Preventive measures for banking and OTP fraud",
  "Key penalties under Section 66 of IT Act"
];

export default function AIAssistant({ activeContext = null, isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Hello! I am **CyberGuard**, your threat intelligence assistant.\n\nI can help evaluate district-level crime trends, CatBoost risk classifications, NCRB data profiles, and Indian cyber laws (IT Act 2000).\n\nHow can I assist your investigation today?',
      model: 'qwen/qwen3.8-27b'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState('qwen/qwen3.8-27b');
  const [copiedId, setCopiedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsgId = 'user-' + Date.now();
    const newMessages = [...messages, { id: userMsgId, role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Scroll once when user submits so the prompt & loader are visible
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const payloadMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await assistantAPI.sendMessage(payloadMessages, activeContext);
      
      setMessages([
        ...newMessages,
        {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: res.reply,
          model: res.model_used
        }
      ]);
      if (res.model_used && res.model_used !== 'none') {
        setModelUsed(res.model_used);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'Unable to connect to the CyberGuard service. Please check backend status.',
          model: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = () => {
    const chatText = messages
      .map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`)
      .join('\n---\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satark_cyberguard_analysis_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'init-cleared',
        role: 'assistant',
        content: 'Conversation cleared. How can I assist with your cybercrime and risk assessment queries?',
        model: modelUsed
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Button removed - triggered exclusively from left toolbar */}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-white rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded 
              ? 'bottom-4 right-4 left-4 sm:left-auto sm:w-[680px] h-[88vh]' 
              : 'bottom-6 right-6 w-[92vw] sm:w-[460px] h-[600px] max-h-[86vh]'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">CyberGuard</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Live</span>
                  </span>
                </div>
                <p className="text-xs text-blue-200 font-mono truncate max-w-[190px]">
                  {modelUsed}
                </p>
              </div>
            </div>

            {/* Header Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportChat}
                title="Export Conversation"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                title="Clear Chat"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner if available */}
          {activeContext && (
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
              <span className="truncate font-medium">
                Context: <strong>{activeContext.district}</strong> ({activeContext.forecast_year}) • {activeContext.risk_level} Risk
              </span>
              <button
                onClick={() => handleSend(`Analyze the forecast for ${activeContext.district}, ${activeContext.state}: ${activeContext.predicted_total} predicted cases with ${activeContext.risk_level} risk tier.`)}
                className="text-blue-700 font-bold hover:underline shrink-0 ml-2"
              >
                Query
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id || m.content.slice(0, 10)}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`group relative max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
                  }`}
                >
                  {/* Rich Text Markdown Rendering */}
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none text-slate-800 space-y-2 font-sans">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-base font-bold text-slate-900 mt-2 mb-1" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-sm font-bold text-slate-900 mt-2 mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-800 mt-1.5 mb-0.5" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed text-sm text-slate-700" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-2 text-sm text-slate-700" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-2 text-sm text-slate-700" {...props} />,
                          li: ({node, ...props}) => <li className="leading-relaxed text-sm" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                          code: ({node, inline, ...props}) => (
                            inline 
                              ? <code className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-xs" {...props} />
                              : <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto my-2"><code {...props} /></pre>
                          ),
                          blockquote: ({node, ...props}) => <blockquote className="border-l-3 border-blue-500 pl-3 italic text-slate-600 my-2 text-sm" {...props} />
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans font-medium text-sm">
                      {m.content}
                    </div>
                  )}

                  {/* Message Action Tools for Assistant responses */}
                  {m.role === 'assistant' && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-xs">
                        {m.model ? m.model.split('/').pop() : 'Qwen'}
                      </span>

                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        title="Copy to clipboard"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors font-medium text-xs"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3 text-sm text-slate-600 shadow-xs flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Synthesizing threat intelligence...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          {messages.length <= 2 && (
            <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200/80 transition-colors text-left truncate max-w-full"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about risk criteria, IT Act laws, or crime trends..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl satark-input font-medium placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
