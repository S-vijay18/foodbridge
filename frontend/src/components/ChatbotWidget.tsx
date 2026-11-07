import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestedActions?: string[];
  timestamp: string;
}

interface ChatbotWidgetProps {
  onNavigate?: (tab: string) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "👋 Hi! I am **BridgeBot AI**, your smart surplus food rescue & hygiene assistant. How can I help you save meals or track deliveries today?",
      suggestedActions: [
        "How to donate food?",
        "Food safety rules",
        "Track active delivery",
        "Browse surplus listings",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const response = await api.chatWithAI(textToSend);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.reply,
        suggestedActions: response.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm having a brief connection interruption. Please feel free to check the Food Safety Guide or live Marketplace in the meantime.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.toLowerCase().includes('track') && onNavigate) {
      onNavigate('tracking');
      return;
    }
    if ((action.toLowerCase().includes('browse') || action.toLowerCase().includes('listing')) && onNavigate) {
      onNavigate('marketplace');
      return;
    }
    if (action.toLowerCase().includes('donate') && onNavigate) {
      onNavigate('donate');
      return;
    }
    if (action.toLowerCase().includes('safety') && onNavigate) {
      onNavigate('safety');
      return;
    }
    handleSend(action);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-4.5 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
                  <Sparkles size={18} className="text-amber-300" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm leading-tight flex items-center gap-1.5">
                    BridgeBot AI
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h4>
                  <p className="text-[11px] text-emerald-300">Zero-Waste AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-br-xs shadow-sm'
                        : 'bg-white text-slate-800 shadow-sm border border-slate-200/60 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {m.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 rounded-full font-bold transition-all text-[11px] border border-emerald-200/60 hover:scale-[1.02]"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">{m.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-500 bg-white p-3 rounded-2xl w-fit shadow-xs border border-slate-100">
                  <Bot size={16} className="text-emerald-600 animate-bounce" />
                  <span className="text-xs font-semibold">BridgeBot is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200/70">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about food hygiene, pickup status..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 text-slate-800 rounded-2xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-4.5 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 hover:from-emerald-700 hover:to-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none group border border-emerald-400/30 ring-4 ring-emerald-500/10"
      >
        <Sparkles size={18} className="text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-display text-xs font-bold tracking-wide">Ask BridgeBot AI</span>
      </button>
    </div>
  );
};
