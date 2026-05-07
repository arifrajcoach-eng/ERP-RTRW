import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Volume2, VolumeX, Mic, MicOff, MessageSquare, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getFinancialSummary, 
  getHealthSummary, 
  getWargaActivitySummary,
  getWasteBankSummary,
  getGuestBookSummary,
  getLettersSummary,
  getELapakSummary,
  getElectionSummary,
  getInventorySummary
} from '../services/aiAgentTools';
import { chatWithAI, textToSpeech } from '../services/aiService';

export default function AIChatBot({ currentUser }: { currentUser: any }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Assalamu’alaikum! Haii, aku asisten pintar buat lingkungan kita. Kenalin ya, aku yang bakal bantu urusan RW & RT di sini. Apa nih yang bisa aku bantu hari ini? Hehe.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [dataContext, setDataContext] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const mountedRef = useRef(true);
  
  const tenantId = currentUser?.tenantId || 'RW26_SMART';
  const maxUsage = currentUser?.role === 'Admin' ? 999 : 10;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        try { audioRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const refreshContext = async () => {
    try {
      const [
        fin, health, activity, waste, guests, letters, lapak, election, inventory
      ] = await Promise.all([
        getFinancialSummary(tenantId),
        getHealthSummary(tenantId),
        getWargaActivitySummary(tenantId),
        getWasteBankSummary(tenantId),
        getGuestBookSummary(tenantId),
        getLettersSummary(tenantId),
        getELapakSummary(tenantId),
        getElectionSummary(tenantId),
        getInventorySummary(tenantId)
      ]);
      
      if (mountedRef.current) {
        setDataContext({ 
          financial: fin, health, activity, wasteBank: waste, 
          guestBook: guests, letters, eLapak: lapak, 
          election, inventory 
        });
      }
    } catch (e) {
      console.warn("Context refresh failed", e);
    }
  };

  useEffect(() => {
    refreshContext();
    const interval = setInterval(refreshContext, 60000);
    return () => clearInterval(interval);
  }, [tenantId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSpeak = async (text: string) => {
    if (isMuted) return;
    
    if (isSpeaking) {
      if (audioRef.current) {
        try { audioRef.current.stop(); } catch (e) {}
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      const base64Audio = await textToSpeech(text);
      if (!base64Audio || !mountedRef.current) {
        setIsSpeaking(false);
        return;
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer).catch(async () => {
          // Fallback manual decode if needed
          const buffer = audioContext.createBuffer(1, bytes.length / 2, 24000);
          const data = buffer.getChannelData(0);
          const view = new DataView(bytes.buffer);
          for (let i = 0; i < data.length; i++) {
            data[i] = view.getInt16(i * 2, true) / 32768;
          }
          return buffer;
      });

      if (!audioBuffer || !mountedRef.current) {
          setIsSpeaking(false);
          return;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => { if (mountedRef.current) setIsSpeaking(false); };
      
      if (audioRef.current) {
          try { audioRef.current.stop(); } catch (e) {}
      }
      audioRef.current = source;
      source.start();
    } catch (error: any) {
      console.warn('AI Voice Error:', error);
      if (mountedRef.current) setIsSpeaking(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'id-ID';
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      if (event.results[0].isFinal) {
        setIsListening(false);
        handleSend(transcript);
      }
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const handleSend = async (manualInput?: string) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || isLoading) return;
    if (usageCount >= maxUsage) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Maaf, kuota AI harian Anda telah habis.' }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      let history = messages
        .filter(m => m.role === 'user' || m.role === 'bot')
        .map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model' as 'user' | 'model', 
          parts: [{ text: m.text }] 
        }));

      // Ensure the history doesn't start with 'model'
      if (history.length > 0 && history[0].role === 'model') {
        history = history.slice(1);
      }

      const stream = await chatWithAI({
        message: textToSend,
        tenantId,
        role: currentUser?.role || 'Warga',
        dataSummary: dataContext || {},
        history
      } as any);

      if (!mountedRef.current) return;

      setMessages(prev => [...prev, { role: 'bot', text: '' }]);
      
      let fullText = '';
      try {
        for await (const chunk of (stream as any)) {
          if (!mountedRef.current) break;
          const chunkText = chunk.text();
          fullText += chunkText;
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
                newMessages[newMessages.length - 1] = { role: 'bot', text: fullText };
            }
            return newMessages;
          });
        }
        if (fullText && mountedRef.current) {
          handleSpeak(fullText);
        }
      } catch (streamError) {
        console.error("Stream error:", streamError);
      }

      if (mountedRef.current) {
        setUsageCount(prev => prev + 1);
        refreshContext();
      }
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      if (mountedRef.current) {
        setMessages(prev => [...prev, { role: 'bot', text: 'Maaf, ada gangguan pada otak saya. Coba lagi ya!' }]);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-lg mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">AI Asisten Pribadi Pa Ketua</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sistem Cerdas Lingkungan
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-slate-200 text-slate-400' : 'bg-brand-blue/10 text-brand-blue'}`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-brand-blue' : 'bg-white border border-slate-100'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-brand-blue" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-brand-blue text-white rounded-tr-none shadow-md' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                }`}>
                  {msg.text || (isLoading && idx === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : '...')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-blue/10 focus-within:border-brand-blue transition-all">
          <button 
            type="button"
            onClick={startListening}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-slate-200 text-slate-400'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya apa saja..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-2"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-brand-blue text-white rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest text-center mt-3">
          AI Agent • Didukung oleh Nexapps
        </p>
      </div>
    </div>
  );
}
