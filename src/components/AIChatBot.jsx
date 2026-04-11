import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  RefreshCw,
  Minimize2
} from 'lucide-react';
import api from '../api/axios';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Suggested questions
  const suggestions = [
    { label: 'Giải thích bài học này', prompt: 'Hãy giải thích chi tiết nội dung bài học tôi đang xem.' },
    { label: 'Làm sao để thăng cấp?', prompt: 'Tôi cần làm gì để vượt qua các cột mốc trong lộ trình thăng tiến?' },
    { label: 'Kế hoạch học tập', prompt: 'Gợi ý cho tôi một kế hoạch học tập hiệu quả trong tuần này.' }
  ];

  // Fetch history on initialization
  useEffect(() => {
    const fetchHistory = async () => {
      // Only fetch if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.accessToken) {
        setMessages([
          { role: 'assistant', content: 'Xin chào! Tôi là SmartBuddy — người bạn đồng hành AI của bạn. Hãy đăng nhập để tôi có thể hỗ trợ bạn tốt nhất nhé! 🚀' }
        ]);
        return;
      }

      try {
        const res = await api.get('/ai/history');
        if (res.data && res.data.length > 0) {
          setMessages(res.data.map(m => ({ role: m.role, content: m.content })));
        } else {
          setMessages([
            { role: 'assistant', content: 'Xin chào! Tôi là SmartBuddy — người bạn đồng hành AI của bạn. Hãy để tôi giúp bạn bứt phá trong lộ trình thăng tiến nhé! 🚀' }
          ]);
        }
      } catch (err) {
        if (err.response?.status === 401) {
             setMessages([{ role: 'assistant', content: 'Hãy đăng nhập để trò chuyện cùng SmartBuddy nhé!' }]);
        } else {
             console.error('Failed to fetch AI history', err);
        }
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', { 
        message: textToSend
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (_) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Rất tiếc, SmartBuddy gặp một chút trục trặc kết nối. Bạn hãy thử lại sau nhé!' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            className="mb-4 sm:mb-6 w-[calc(100vw-32px)] sm:w-[380px] h-[calc(100vh-120px)] sm:h-[600px] sm:max-h-[80vh] bg-white/95 backdrop-blur-3xl rounded-[32px] sm:rounded-[36px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-white/50"
          >
            {/* Mesh Gradient Background Decor */}
            <div className="absolute inset-0 -z-10 overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/30 rounded-full blur-[100px]" />
            </div>

            {/* Premium Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-5 sm:p-6 text-white relative">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl backdrop-blur-xl flex items-center justify-center relative border border-white/30 shadow-inner">
                      <Sparkles size={24} className="text-yellow-300 animate-pulse sm:scale-125" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 border-2 sm:border-4 border-indigo-600 rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-black text-[18px] sm:text-[20px] leading-tight tracking-tight">SmartBuddy AI</h3>
                    <p className="text-[10px] sm:text-[12px] font-bold text-blue-100 uppercase tracking-widest opacity-80 mt-1">Trợ lý đặc quyền</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"
                >
                  <Minimize2 size={20} />
                </button>
              </div>
              {/* Header glass shine */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex gap-4'}`}>
                    {msg.role === 'assistant' && (
                       <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg border-2 border-white">
                          <Bot size={20} />
                       </div>
                    )}
                    <div className={`p-5 rounded-[24px] text-[15px] leading-relaxed shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${
                      msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-tr-none' 
                      : 'bg-white text-[#2b3674] rounded-tl-none border border-gray-100/50'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Suggested Actions */}
              {!isLoading && messages.length < 4 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 pt-4"
                >
                   {suggestions.map((s, idx) => (
                     <button
                       key={idx}
                       onClick={() => handleSend(s.prompt)}
                       className="bg-white/60 hover:bg-white border border-blue-100/50 text-[#0050b3] text-[12px] font-bold px-4 py-2 rounded-full shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                     >
                       {s.label}
                     </button>
                   ))}
                </motion.div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-md text-[#0050b3] flex items-center justify-center border border-gray-100">
                      <RefreshCw size={18} className="animate-spin" />
                    </div>
                    <div className="bg-white/80 p-5 rounded-[24px] rounded-tl-none border border-gray-100 flex gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Input Area */}
            <div className="p-4 sm:p-8 pt-4 bg-white/50 backdrop-blur-xl border-t border-gray-100/30">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Viết tin nhắn..."
                  className="w-full pl-5 pr-12 py-4 sm:py-5 bg-white border border-gray-100 rounded-[24px] sm:rounded-[28px] text-[14px] sm:text-[15px] font-medium shadow-inner focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-gray-400"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className={`absolute right-2 top-2 bottom-2 w-10 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                    input.trim() 
                    ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-blue-500/30 active:scale-90 cursor-pointer' 
                    : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                <Sparkles size={10} className="text-yellow-600" />
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#2b3674]">
                  Powered by Llama 3 Advanced AI
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stunning Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[28px] flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(0,80,179,0.3)] transition-all duration-700 relative overflow-hidden ${
          isOpen ? 'bg-white text-[#ff4d4f] border-2 border-gray-50' : 'bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-700 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
               <X size={32} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
               <MessageSquare size={32} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow effect for closed state */}
        {!isOpen && (
           <>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-500 border-2 border-white shadow-md"></span>
                </span>
              </div>
           </>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatBot;
