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
  HelpCircle
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
      content: 'Hello. I can assist with district-level cybercrime forecasts, risk evaluations, NCRB statistics, and Indian cyber law (IT Act 2000).\n\nHow can I help with your analysis?',
      model: 'openai/gpt-oss-120b'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState('openai/gpt-oss-120b');
  const [copiedId, setCopiedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsgId = 'user-' + Date.now();
    const newMessages = [...messages, { id: userMsgId, role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

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
          content: 'Unable to connect to the AI Assistant service. Please try again.',
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
    a.download = `satark_ai_analysis_${new Date().toISOString().slice(0, 10)}.txt`;
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
      {/* Floating Launcher Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-full shadow-md hover:shadow-lg border border-slate-200 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 text-xs font-semibold group"
        >
          <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-tight">Assistant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded 
              ? 'bottom-4 right-4 left-4 sm:left-auto sm:w-[620px] h-[88vh]' 
              : 'bottom-5 right-5 w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">Cybercrime Analytics Assistant</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                  {modelUsed}
                </p>
              </div>
            </div>

            {/* Header Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportChat}
                title="Export Conversation"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                title="Clear Chat"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner if available */}
          {activeContext && (
            <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
              <span className="truncate">
                Focus: <strong>{activeContext.district}</strong> ({activeContext.forecast_year}) • {activeContext.risk_level} Risk
              </span>
              <button
                onClick={() => handleSend(`Analyze the forecast for ${activeContext.district}, ${activeContext.state}: ${activeContext.predicted_total} predicted cases with ${activeContext.risk_level} risk tier.`)}
                className="text-slate-900 font-semibold hover:underline shrink-0 ml-2"
              >
                Ask Analysis
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#fafafa]">
            {messages.map((m) => (
              <div
                key={m.id || m.content.slice(0, 10)}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`group relative max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {/* Rich Text Markdown Rendering */}
                  {m.role === 'assistant' ? (
                    <div className="prose prose-xs max-w-none text-slate-800 space-y-2">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-sm font-bold text-slate-900 mt-2 mb-1" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xs font-bold text-slate-900 mt-2 mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xs font-bold text-slate-800 mt-1.5 mb-0.5" {...props} />,
                          p: ({node, ...props}) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-1.5" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 mb-1.5" {...props} />,
                          li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                          code: ({node, inline, ...props}) => (
                            inline 
                              ? <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]" {...props} />
                              : <pre className="p-2 rounded-lg bg-slate-100 text-slate-900 font-mono text-[11px] overflow-x-auto my-1.5"><code {...props} /></pre>
                          ),
                          blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-slate-300 pl-2.5 italic text-slate-600 my-1.5" {...props} />
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">
                      {m.content}
                    </div>
                  )}

                  {/* Message Action Tools for Assistant responses */}
                  {m.role === 'assistant' && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-[9px]">
                        {m.model ? m.model.split('/').pop() : 'Llama'}
                      </span>

                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        title="Copy to clipboard"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
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
                <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 shadow-2xs flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing cybercrime threat intelligence...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips (if few messages) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] border border-slate-200 transition-colors text-left truncate max-w-full"
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
            className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about risk tiers, IT Act laws, or forecast trends..."
              className="flex-1 px-3 py-2 text-xs rounded-lg clean-input font-medium placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
