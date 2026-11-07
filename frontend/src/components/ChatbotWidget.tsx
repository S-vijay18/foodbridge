import React, { useState, useRef, useEffect } from 'react';
import {
  X, Send, Sparkles, Bot, Phone,
  Utensils, ShieldCheck, Activity, RotateCcw,
  ExternalLink, ChevronRight
} from 'lucide-react';
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
      text: "👋 Hi! I am **BridgeBot AI**, your smart surplus food rescue & food safety copilot.\n\nTap any quick button below or ask me about live food listings, safety guidelines, or courier tracking!",
      suggestedActions: [
        "🍲 Available Food Listings",
        "🛡️ Food Safety Rules",
        "⚡ Track Delivery #1",
        "📞 Contact Admin",
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
        text: "I am having a brief network connection refresh. You can explore the live Marketplace or Food Safety page directly in the meantime.",
        suggestedActions: ["Browse Marketplace", "Food Safety Rules"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    const actLower = action.toLowerCase();

    // Direct Phone Call Action
    if (actLower.includes('emergency') || actLower.includes('hotline') || actLower.includes('call')) {
      window.location.href = 'tel:+919976273763';
      return;
    }

    // Direct Navigation Actions
    if ((actLower.includes('track') || actLower.includes('live tracking')) && onNavigate) {
      onNavigate('tracking');
      setIsOpen(false);
      return;
    }
    if ((actLower.includes('marketplace') || actLower.includes('available food') || actLower.includes('browse')) && onNavigate) {
      onNavigate('marketplace');
      setIsOpen(false);
      return;
    }
    if ((actLower.includes('donate') || actLower.includes('list food')) && onNavigate) {
      onNavigate('donate');
      setIsOpen(false);
      return;
    }
    if ((actLower.includes('safety') || actLower.includes('hygiene') || actLower.includes('manual')) && onNavigate) {
      onNavigate('safety');
      setIsOpen(false);
      return;
    }
    if ((actLower.includes('analytics') || actLower.includes('impact')) && onNavigate) {
      onNavigate('analytics');
      setIsOpen(false);
      return;
    }

    // Otherwise send as prompt to AI
    handleSend(action);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: "✨ Chat history cleared! How can I assist you right now?",
        suggestedActions: [
          "🍲 Available Food Listings",
          "🛡️ Food Safety Rules",
          "⚡ Track Delivery #1",
          "📞 Contact Admin",
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
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
            className="w-[410px] max-w-[calc(100vw-2rem)] h-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden mb-4 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-4 flex items-center justify-between border-b border-emerald-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                  <Sparkles size={18} className="text-amber-300" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm leading-tight flex items-center gap-1.5">
                    BridgeBot AI
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h4>
                  <p className="text-[11px] text-emerald-300 font-medium">Smart Food & Safety Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-xl text-emerald-300/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-emerald-300/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Action Top Bar */}
            <div className="bg-emerald-900/40 px-3 py-2 border-b border-emerald-800/30 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSend("What food is available right now?")}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold whitespace-nowrap transition-colors flex items-center space-x-1"
              >
                <Utensils size={12} className="text-amber-400" />
                <span>Available Food</span>
              </button>
              <button
                onClick={() => handleSend("Food safety guidelines and temperature danger zones")}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold whitespace-nowrap transition-colors flex items-center space-x-1"
              >
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Safety Rules</span>
              </button>
              <button
                onClick={() => handleSend("Track donation #1")}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold whitespace-nowrap transition-colors flex items-center space-x-1"
              >
                <Activity size={12} className="text-blue-400" />
                <span>Track #1</span>
              </button>
              <button
                onClick={() => handleSend("Contact admin Sivaraj")}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold whitespace-nowrap transition-colors flex items-center space-x-1"
              >
                <Phone size={12} className="text-amber-300" />
                <span>Admin Line</span>
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-br-xs shadow-sm font-medium'
                        : 'bg-white text-slate-900 shadow-sm border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed text-[12px]">{m.text}</div>

                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {m.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold transition-all text-[11px] border border-emerald-200/60 hover:scale-[1.02] flex items-center space-x-1"
                          >
                            <span>{action}</span>
                            <ChevronRight size={11} className="text-emerald-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">{m.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-600 bg-white p-3 rounded-2xl w-fit shadow-xs border border-slate-200">
                  <Bot size={16} className="text-emerald-600 animate-bounce" />
                  <span className="text-xs font-bold">BridgeBot is fetching data...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200/80">
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
                  placeholder="Ask about surplus food, safety, tracking..."
                  className="flex-1 px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
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
        className="flex items-center space-x-2.5 px-4.5 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-950 hover:from-emerald-700 hover:to-slate-900 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none group border border-emerald-400/30 ring-4 ring-emerald-500/15"
      >
        <Sparkles size={18} className="text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-display text-xs font-bold tracking-wide">Ask BridgeBot AI</span>
      </button>
    </div>
  );
};
