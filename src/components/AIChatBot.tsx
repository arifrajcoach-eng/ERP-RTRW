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
  getInventorySummary,
  getRegistrationInfo,
  createSurat,
  registerELapak
} from '../services/aiAgentTools';
import { chatWithAI, textToSpeech } from '../services/aiService';

export default function AIChatBot({ currentUser, agentType = 'auto', plan }: { currentUser: any, agentType?: 'cs' | 'admin' | 'auto', plan?: string }) {
  const isPrivileged = agentType === 'cs' ? false :
                       agentType === 'admin' ? true :
                       ['SUPER_ADMIN', 'ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser?.role);
  const agentName = isPrivileged ? "Aspri" : "Chaty";
  const agentTitle = isPrivileged ? "AI Asisten Pribadi Pa Ketua" : "AI Customer Service Warga";

  const welcomeMessage = isPrivileged 
    ? `Assalamu’alaikum! 🫡 Aku Aspri, asisten pribadimu. Ada data rahasia, keuangan, atau tugas kepengurusan yang perlu aku bantu atau analisakan hari ini? hehe.`
    : `Assalamu’alaikum! Haii, aku Chaty, AI Customer Service pintar buat warga kita 😊. Ada yang bisa aku bantu untuk info warga, surat pengantar, atau cara bayar iuran?`;

  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: welcomeMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [dataContext, setDataContext] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenTextRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mountedRef = useRef(true);

  // Helper to convert PCM to WAV Blob
  const pcmToWavBlob = (pcmData: Uint8Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + pcmData.length, true); // Length
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (16-bit mono = 2 bytes per sample)
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, pcmData.length, true); // Subchunk2Size

    // Write PCM data efficiently
    new Uint8Array(buffer, 44).set(pcmData);

    return new Blob([buffer], { type: 'audio/wav' });
  };
  
  const tenantId = currentUser?.tenantId || 'RW26_SMART';
  const roleUpper = currentUser?.role?.toUpperCase();
  
  // Calculate maxUsage based on plan
  const normalizedPlan = (plan || 'STARTER').toUpperCase();
  let maxUsage = 5; // Default for STARTER/FREE (5 chats/month as requested)
  if (roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN' || roleUpper === 'SUPER ADMIN' || currentUser?.isSuperAdmin) {
    maxUsage = 9999;
  } else if (normalizedPlan.includes('FLASH') || normalizedPlan.includes('BASIC')) {
    maxUsage = 50;
  } else if (normalizedPlan.includes('PRO')) {
    maxUsage = 200;
  } else if (normalizedPlan.includes('PREMIUM') || normalizedPlan.includes('ENTERPRISE')) {
    maxUsage = 1000;
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (audioRef.current instanceof HTMLAudioElement) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const resumeAudio = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }

      // Unlock HTMLAudioElement to bypass iOS Silent Switch reliably
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      if (audioRef.current.paused && !audioRef.current.src.startsWith('blob:')) {
        audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audioRef.current.play().catch(() => {});
      }

      // Keep channel open with a tiny silent buffer on first physical click
      try {
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          const silence = audioContextRef.current.createBuffer(1, 1, 22050);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = silence;
          source.connect(audioContextRef.current.destination);
          source.start(0);
        }
      } catch (e) {}
    };
    window.addEventListener('click', resumeAudio, { once: false });
    window.addEventListener('touchstart', resumeAudio, { once: false });
    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  const refreshContext = async () => {
    try {
      const [
        fin, health, activity, waste, guests, letters, lapak, election, inventory, registrations
      ] = await Promise.all([
        getFinancialSummary(tenantId),
        getHealthSummary(tenantId),
        getWargaActivitySummary(tenantId),
        getWasteBankSummary(tenantId),
        getGuestBookSummary(tenantId),
        getLettersSummary(tenantId),
        getELapakSummary(tenantId),
        getElectionSummary(tenantId),
        getInventorySummary(tenantId),
        getRegistrationInfo(tenantId)
      ]);
      
      if (mountedRef.current) {
        setDataContext({ 
          financial: fin, health, activity, wasteBank: waste, 
          guestBook: guests, letters, eLapak: lapak, 
          election, inventory, registrations 
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
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch (e) {}
        sourceRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      lastSpokenTextRef.current = text;
      
      const response = await textToSpeech(text);
      if (!response || !mountedRef.current) {
        console.warn("TTS Service returned no response. Check Gemini Key/Quota. Falling back to Browser TTS.");
        // Fallback to browser TTS if Gemini fails
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'id-ID';
          utterance.onend = () => { if (mountedRef.current) setIsSpeaking(false); };
          utterance.onerror = () => { if (mountedRef.current) setIsSpeaking(false); };
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
        return;
      }
      
      const { data: base64Audio, mimeType } = response;
      console.log(`TTS Response: ${mimeType}, Size: ${base64Audio?.length}`);
      
      if (!base64Audio) throw new Error("No audio data received");

      // Robust base64 to binary
      const binaryString = atob(base64Audio.replace(/\s/g, ""));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Ensure AudioContext is ready for any path we take
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      // Handle PCM specifically (Most direct path for Gemini's raw output)
      if (mimeType?.includes('pcm') || !mimeType) {
        const sampleRate = parseInt(mimeType?.match(/rate=(\d+)/)?.[1] || '24000', 10);
        console.log(`Playing PCM via unlocked HTMLAudioElement: ${sampleRate}Hz`);
        
        try {
          const wavBlob = pcmToWavBlob(bytes, sampleRate);
          const url = URL.createObjectURL(wavBlob);
          
          if (!audioRef.current) audioRef.current = new Audio();
          const audio = audioRef.current;
          
          // Cleanup previous blob URL
          if (audio.src && audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src);
          }
          
          audio.src = url;
          audio.onended = () => {
            if (mountedRef.current) setIsSpeaking(false);
          };
          audio.onerror = (e) => {
            console.warn("Audio element error", e);
            if (mountedRef.current) setIsSpeaking(false);
          };
          
          // Play on the unlocked audio element (Bypasses iOS Silent switch)
          await audio.play();
        } catch (playError) {
          console.warn("HTMLAudioElement play failed, falling back to AudioContext:", playError);
          if (!ctx) throw new Error("AudioContext not supported");

          // Decode PCM 16-bit to Float32
          const alignedLength = Math.floor(bytes.length / 2);
          const int16Array = new Int16Array(bytes.buffer, 0, alignedLength);
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
          }
          
          // Play directly via AudioContext
          const audioBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
          audioBuffer.getChannelData(0).set(float32Array);
          
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          
          const gainNode = ctx.createGain();
          gainNode.gain.value = 1.0;
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          sourceRef.current = source;
          source.onended = () => {
            if (mountedRef.current) setIsSpeaking(false);
            sourceRef.current = null;
          };
          source.start(0);
        }
      } else {
        // Fallback for encoded formats (MP3/WAV/etc)
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        
        if (audio.src && audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }
        
        audio.src = url;
        audio.onended = () => {
          if (mountedRef.current) setIsSpeaking(false);
        };
        try {
          await audio.play();
        } catch (e) {
          console.warn("Audio element playback failed, trying AudioContext decode:", e);
          if (ctx) {
            const decoded = await ctx.decodeAudioData(bytes.buffer.slice(0));
            const source = ctx.createBufferSource();
            source.buffer = decoded;
            source.connect(ctx.destination);
            source.onended = () => { if (mountedRef.current) setIsSpeaking(false); };
            source.start(0);
            sourceRef.current = source;
          } else {
            if (mountedRef.current) setIsSpeaking(false);
          }
          URL.revokeObjectURL(url);
        }
      }
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

    // Pre-warm AudioContext on start listening gesture
    if (isMuted) setIsMuted(false);
    
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(e => console.warn("Failed to resume audio on listening gesture:", e));
        }
        // Silence trick to keep channel open
        try {
          const silence = audioContextRef.current.createBuffer(1, 1, 22050);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = silence;
          source.connect(audioContextRef.current.destination);
          source.start(0);
        } catch (e) {}
      }

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

  const handleSend = async (manualInput?: string, retries = 1) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    // Pre-warm AudioContext and Audio on user gesture
    if (isMuted && manualInput === undefined) setIsMuted(false);
    
    if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(e => console.warn("Failed to resume audio on gesture:", e));
        }
        // Silence trick to keep channel open
        try {
          const silence = audioContextRef.current.createBuffer(1, 1, 22050);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = silence;
          source.connect(audioContextRef.current.destination);
          source.start(0);
        } catch (e) {}
      }

    // Unlock HTMLAudioElement to bypass iOS Silent Switch reliably
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    if (audioRef.current.paused && !audioRef.current.src.startsWith('blob:')) {
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioRef.current.play().catch(() => {});
    }

    if (usageCount >= maxUsage) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Maaf, kuota AI harian Anda telah habis.' }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      // Ensure the history alternates correctly and starts with 'user'
      let history = [];
      let lastRole = null;

      const rawHistory = messages
        .filter(m => m.role === 'user' || m.role === 'bot')
        .map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model' as 'user' | 'model', 
          parts: [{ text: m.text }] 
        }));

      for (const entry of rawHistory) {
        if (entry.role !== lastRole) {
          if (history.length === 0 && entry.role === 'model') continue;
          history.push(entry);
          lastRole = entry.role;
        }
      }

      const isSensitiveDataAllowed = isPrivileged;
      
      const filteredContext = isSensitiveDataAllowed ? dataContext : {
        financial: { total: dataContext?.financial?.total }, // Keep only summary, hide details
        health: dataContext?.health,
        activity: dataContext?.activity,
        wasteBank: dataContext?.wasteBank,
        guestBook: dataContext?.guestBook,
        letters: dataContext?.letters,
        eLapak: dataContext?.eLapak,
        election: dataContext?.election,
        // Excluded: inventory, registrations, sensitive financial details
      };

      const stream = await chatWithAI({
        message: textToSend,
        tenantId,
        role: currentUser?.role || 'Warga',
        dataSummary: filteredContext || {},
        history,
        isPrivileged: isPrivileged
      } as any);

      if (!mountedRef.current) return;

      setMessages(prev => [...prev, { role: 'bot', text: '' }]);
      
      let fullText = '';
      try {
        for await (const chunk of (stream as any)) {
          if (!mountedRef.current) break;
          const chunkText = chunk.text;
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
          // Speak clean version
          const speakText = (text: string) => {
             // Basic check if it looks like JSON
             if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                 try {
                     const parsed = JSON.parse(text);
                     if (parsed.text) return parsed.text;
                     return ""; // Don't speak raw action JSON
                 } catch(e) { return text; }
             }
             return text.replace(/```json/g, '').replace(/```/g, '').trim();
          };

          try {
            const cleanText = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonAction = JSON.parse(cleanText);
            if (jsonAction.action === 'createSurat') {
              const res = await createSurat({ ...jsonAction.params, tenantId });
              const msg = res.success ? `Alhamdulillah kak, surat pengantar berhasil dibuat (ID: ${res.id}).` : 'Maaf kak, ada kendala saat membuat surat.';
              setMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: msg }]);
              handleSpeak(msg);
            } else if (jsonAction.action === 'registerELapak') {
              const res = await registerELapak({ ...jsonAction.params, tenantId, userId: currentUser?.email || 'unknown' });
              const msg = res.success ? `Alhamdulillah kak, pendaftaran e-lapak berhasil (ID: ${res.id}).` : 'Maaf kak, ada kendala saat mendaftar e-lapak.';
              setMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: msg }]);
              handleSpeak(msg);
            } else {
              handleSpeak(speakText(fullText));
            }
          } catch (e) {
            handleSpeak(speakText(fullText));
          }
        }
      } catch (streamError) {
        throw streamError; // Rethrow to be caught by outer catch
      }

      if (mountedRef.current) {
        setUsageCount(prev => prev + 1);
        refreshContext();
      }
    } catch (error: any) {
      console.error('AI Chat Error (attempt ' + (2 - retries) + '):', error);
      if (retries > 0) {
        console.log('Retrying...');
        return handleSend(textToSend, retries - 1);
      }
      if (mountedRef.current) {
        const errorMsg = error.message?.includes('GEMINI_API_KEY') ? 'Aduh maaf, sistem kekurangan konfigurasi kunci AI (GEMINI_API_KEY belum dipasang di environment Vercel). Mohon lapor pengurus atau developer ya!' : 'Maaf, ada gangguan pada koneksi atau AI saya. Coba lagi ya!';
        setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
        handleSpeak(errorMsg);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-h-[600px] w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-widest">{agentTitle}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sistem Cerdas Lingkungan • {maxUsage > 100 ? 'Kuota Unlimited' : `Sisa Kuota: ${maxUsage - usageCount}`}
            </p>
          </div>
        </div>
        <button 
          onClick={async () => {
            // Resume AudioContext on user gesture
            if (audioContextRef.current?.state === 'suspended') {
              try { await audioContextRef.current.resume(); } catch(e) {}
            }
            // Test audio if double clicked or just help diagnosing
            if (!isMuted) {
              handleSpeak("Tes suara AI Agen. Jika terdengar, maka sistem audio Anda sudah aktif.");
            } else {
              setIsMuted(false);
            }
          }}
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
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-brand-blue' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-brand-blue" />}
                </div>
                <div className={`group relative p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-brand-blue text-white rounded-tr-none shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                }`}>
                  {msg.text || (isLoading && idx === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : '...')}
                  
                  {msg.role === 'bot' && msg.text && (
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="absolute -right-2 -bottom-2 p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-100 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <Volume2 className="w-3 h-3 text-brand-blue" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-blue/10 focus-within:border-brand-blue transition-all">
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
          AI Agent • Didukung oleh Nexapps<br/>
          <span className="text-[8px] text-slate-400 font-normal lowercase tracking-normal">(Pastikan volume HP tidak di-mute / silent switch off agar suara AI terdengar)</span>
        </p>
      </div>
    </div>
  );
}
