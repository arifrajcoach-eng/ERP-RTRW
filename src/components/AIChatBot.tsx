import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getFinancialSummary, getHealthSummary, getPPOBSummary, getWargaActivitySummary, detectAnomalies } from '../services/aiAgentTools';

// Initialize AI SDK. 
// The environment provides GEMINI_API_KEY.
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  tools: [{
    functionDeclarations: [
      {
        name: 'getFinancialSummary',
        description: 'Mendapatkan ringkasan keuangan RT/RW (total masuk, keluar, dan saldo)',
        parameters: { type: 'object', properties: { tenantId: { type: 'string' } }, required: ['tenantId'] }
      },
      {
        name: 'getHealthSummary',
        description: 'Mendapatkan ringkasan data kesehatan warga (Posyandu balita, ibu hamil, dll)',
        parameters: { type: 'object', properties: { tenantId: { type: 'string' } }, required: ['tenantId'] }
      },
      {
        name: 'getPPOBSummary',
        description: 'Mendapatkan ringkasan transaksi PPOB (jumlah transaksi dan volume)',
        parameters: { type: 'object', properties: { tenantId: { type: 'string' } }, required: ['tenantId'] }
      },
      {
        name: 'getWargaActivitySummary',
        description: 'Mendapatkan ringkasan aktivitas warga (total, aktif, pasif)',
        parameters: { type: 'object', properties: { tenantId: { type: 'string' } }, required: ['tenantId'] }
      },
      {
        name: 'detectAnomalies',
        description: 'Mendeteksi aktivitas mencurigakan atau anomali keuangan',
        parameters: { type: 'object', properties: { tenantId: { type: 'string' } }, required: ['tenantId'] }
      }
    ]
  }]
});

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

  const [chatSession, setChatSession] = useState<any>(null);

  useEffect(() => {
    setChatSession(model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "Anda adalah asisten AI RW. Anda membantu pengurus mengolah data, membuat laporan, dan memonitor aktivitas warga. Gunakan tools yang tersedia untuk menjawab pertanyaan." }],
            },
            {
                role: "model",
                parts: [{ text: "Siap, saya siap membantu pengurus RW." }],
            },
        ],
    }));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSession) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let result = await chatSession.sendMessage(userMessage);
      let response = result.response;
      
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        let resultData;
        if (call.name === 'getFinancialSummary') resultData = await getFinancialSummary(tenantId);
        else if (call.name === 'getHealthSummary') resultData = await getHealthSummary(tenantId);
        else if (call.name === 'getPPOBSummary') resultData = await getPPOBSummary(tenantId);
        else if (call.name === 'getWargaActivitySummary') resultData = await getWargaActivitySummary(tenantId);
        else if (call.name === 'detectAnomalies') resultData = await detectAnomalies(tenantId);
        
        result = await chatSession.sendMessage([{
            functionResponse: {
                name: call.name,
                response: resultData
            }
        }]);
        response = result.response;
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: response.text() }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Maaf, terjadi kesalahan saat menghubungi AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-600" />
        <span>AI Asisten RW</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {msg.role === 'bot' && <div className="text-xs font-bold mb-1 opacity-70">AI Asisten</div>}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-sm text-slate-500">Mencari jawaban...</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2"
          placeholder="Tanya sesuatu tentang RW..."
        />
        <button onClick={handleSend} disabled={isLoading} className="p-2 bg-blue-600 rounded-xl text-white disabled:bg-blue-300">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
