import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';
import { getFinancialSummary, getHealthSummary, getWargaActivitySummary } from '../services/aiAgentTools';

export default function AIChatBot({ currentUser }: { currentUser: any }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Halo! Saya AI Asisten RW. Bagaimana saya bisa membantu Anda hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const tenantId = currentUser?.tenantId || 'RW26_SMART';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [usageCount, setUsageCount] = useState(0);
  const maxUsage = currentUser?.role === 'Admin' ? 999 : 10;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (usageCount >= maxUsage) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Maaf, kuota AI harian Anda telah habis (Maksimal 10 tanyaan/hari).' }]);
      return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare data summary to help AI
      const [fin, health, activity] = await Promise.all([
        getFinancialSummary(tenantId),
        getHealthSummary(tenantId),
        getWargaActivitySummary(tenantId)
      ]);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          tenantId,
          userId: currentUser?.uid,
          role: currentUser?.role || 'Warga',
          dataSummary: { financial: fin, health, activity },
          history: messages.map(m => ({ 
            role: m.role === 'user' ? 'user' : 'model', 
            parts: [{ text: m.text }] 
          }))
        })
      });

      if (!response.ok) throw new Error('Gateway Error');
      
      const result = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: result.text }]);
      setUsageCount(prev => prev + 1);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Maaf, terjadi kesalahan saat menghubungi AI Hub (Limit atau Gangguan).' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span>AI Asisten RW (Premium)</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100">
           <div className={`w-2 h-2 rounded-full ${usageCount >= maxUsage ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
           <span className="text-[9px] font-black uppercase text-slate-400">Quota: {usageCount} / {maxUsage}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-800'}`}>
              {msg.role === 'bot' && <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">AI Asisten</div>}
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 items-center text-slate-400">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Menyusun jawaban...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
          placeholder="Tanya ringkasan warga, keuangan, atau anomali..."
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()} 
          className="p-3 bg-blue-600 rounded-xl text-white disabled:bg-blue-200 shadow-lg shadow-blue-200 flex items-center justify-center transition-all active:scale-90"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
