import { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';
import { Bot, User, Send, Sparkles, Sprout, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  "What is the fair market price for Grade A Tomatoes in Coimbatore today?",
  "How does logistics pooling reduce my transport cost in Pollachi?",
  "Best time to harvest and sell Bananas?",
  "How can an FPO aggregate produce to negotiate higher bulk rates?",
  "What pest prevention practices apply for winter crops?"
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Namaste! I am your AgriDirect AI Agro-Advisor. I provide real-time guidance on mandi price trends, fair contracting, crop care, post-harvest logistics pooling, and supply chain direct selling. How can I assist your farming or buying operations today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(query);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.response || res.message || "I have analyzed market factors for your query. For best returns, consider grouping lots with neighboring FPOs and dispatching through consolidated freight.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      toast.error('AI assistant temporarily offline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm flex items-center gap-2 text-slate-900">
              AgriDirect AI Advisory
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Agro-Neural Core
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">Mandi price discovery, crop guidance, and logistics pooling assistance</p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAi
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isAi ? <Sprout size={16} /> : <User size={16} />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                      : 'bg-emerald-600 text-white shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className={`text-[10px] text-slate-400 block px-1 ${!isAi && 'text-right'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Analyzing APMC mandi trends and crop factors...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 overflow-x-auto flex gap-2">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-white hover:bg-slate-100 hover:text-slate-900 text-slate-600 px-3 py-1 rounded-full whitespace-nowrap border border-slate-200 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about fair floor prices, direct contracts, logistics pooling, quality grading..."
            className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="agri-btn-primary py-2 px-4 text-xs font-bold disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
