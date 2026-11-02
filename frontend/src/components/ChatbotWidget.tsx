import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
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
      text: "👋 Hi! I am **BridgeBot**, your AI Food Donation & Safety Assistant. How can I help you reduce food waste today?",
      suggestedActions: [
        "How to donate food?",
        "Food safety rules",
        "Track donation #1",
        "Browse available food",
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
        text: "I am having trouble reaching the AI assistant service at the moment. Please try again or check the Food Safety page.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Tracking') && onNavigate) {
      onNavigate('tracking');
      return;
    }
    if (action.includes('Marketplace') && onNavigate) {
      onNavigate('marketplace');
      return;
    }
    if (action.includes('Donate') && onNavigate) {
      onNavigate('donate');
      return;
    }
    handleSend(action);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-700/80 flex items-center justify-center border border-emerald-600/50">
                  <Sparkles size={18} className="text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    BridgeBot AI
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h4>
                  <p className="text-[11px] text-emerald-200">Smart Food & Safety Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      m.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 shadow-xs border border-slate-100 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {m.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full font-medium transition-colors text-[11px]"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-400 bg-white p-3 rounded-2xl w-fit shadow-xs border border-slate-100">
                  <Bot size={16} className="text-emerald-600 animate-bounce" />
                  <span className="text-xs">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-100">
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
                  placeholder="Ask about food safety, tracking #1..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl transition-colors"
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
        className="flex items-center space-x-2.5 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none group"
      >
        <Sparkles size={18} className="text-amber-300 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-wide">Ask BridgeBot AI</span>
      </button>
    </div>
  );
};

