import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, MessageSquare, User, Loader2, Mic, MicOff, Volume2, VolumeX, Square, X, ChevronLeft, RadioReceiver, Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import VoiceAgentOverlay from './VoiceAgentOverlay';
import { PLAN_FEATURES } from '../constants';
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
  registerELapak,
  reportComplaint,
  bookFacility,
  reportKelahiran,
  reportKematian,
  getMadingSummary,
  getSOSSummary,
  getComplaintsSummary,
  getBookingsSummary,
  getBirthdaysSummary
} from '../services/aiAgentTools';
import { chatWithAI, textToSpeech } from '../services/aiService';

export default function AIChatBot(props: any) {
  const { currentUser, onClose } = props;
  const tenantId = currentUser?.tenantId || localStorage.getItem('currentTenantId') || (window as any).currentTenant?.id;
  
  if (!tenantId) {
    console.warn("AIChatBot: Tenant ID still missing after check.");
    return null;
  }
  
  const optimizedUser = { ...currentUser, tenantId };

  return <AIChatBotInner {...props} currentUser={optimizedUser} />;
}

function AIChatBotInner({ currentUser, agentType = 'auto', plan, onClose, startVoiceImmediately }: { currentUser: any, agentType?: 'cs' | 'admin' | 'auto', plan?: string, onClose?: () => void, startVoiceImmediately?: boolean }) {
  const roleUpper = currentUser?.role?.toUpperCase() || '';
  const isPrivileged = agentType === 'cs' ? false :
                       agentType === 'admin' ? true :
                       ['SUPER_ADMIN', 'ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(roleUpper) ||
                       roleUpper.includes('KETUA') ||
                       roleUpper.includes('ADMIN') ||
                       roleUpper.includes('RW') ||
                       roleUpper.includes('RT') ||
                       roleUpper.includes('BENDAHARA') ||
                       roleUpper.includes('SEKRETARIS') ||
                       !!currentUser?.isSuperAdmin;
  const agentName = "Chaty";
  const agentTitle = isPrivileged ? "Chaty - AI Asisten Ketua" : "Chaty - AI Asisten Warga";

  const welcomeMessage = isPrivileged 
    ? `Selamat datang Bapak/Ibu Ketua. Chaty siap membantu Anda mengelola wilayah dengan cerdas dan tertata rapi hari ini. Silakan sampaikan jika ada data atau informasi yang ingin Bapak/Ibu periksa.`
    : `Halo Bapak/Ibu Pengurus. Selamat datang di SmaRtRw AI. Chaty siap membantu keperluan administrasi dan layanan warga dengan sigap. Ada yang bisa Chaty bantu hari ini?`;

  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: welcomeMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true); // New state for AutoSpeak
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [dataContext, setDataContext] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveModeStatus, setLiveModeStatus] = useState<string | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const liveAudioCtxRef = useRef<AudioContext | null>(null);
  const liveOutputCtxRef = useRef<AudioContext | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const liveNextStartTimeRef = useRef(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenTextRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (startVoiceImmediately && !isLiveMode) {
      // Small delay to ensure contexts are ready
      const timer = setTimeout(() => {
        startLiveSession();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [startVoiceImmediately]);

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
    
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch (e) {}
      }
      stopLiveSession();
    };
  }, []);

  const stopLiveSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach(track => track.stop());
      liveStreamRef.current = null;
    }
    if (liveProcessorRef.current) {
      liveProcessorRef.current.disconnect();
      liveProcessorRef.current = null;
    }
    if (liveAudioCtxRef.current) {
      liveAudioCtxRef.current.close();
      liveAudioCtxRef.current = null;
    }
    if (liveOutputCtxRef.current) {
      liveOutputCtxRef.current.close();
      liveOutputCtxRef.current = null;
    }
    setIsLiveMode(false);
    setLiveModeStatus(null);
  }, []);

  const pcmToBase64 = (pcmData: Float32Array) => {
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcmData.length; i++) {
      let s = Math.max(-1, Math.min(1, pcmData[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playLiveAudioChunk = (ctx: AudioContext, base64: string) => {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const view = new DataView(bytes.buffer);
      const floatData = new Float32Array(len / 2);
      for (let i = 0; i < floatData.length; i++) {
        floatData[i] = view.getInt16(i * 2, true) / 32768;
      }
      const buffer = ctx.createBuffer(1, floatData.length, 24000);
      buffer.getChannelData(0).set(floatData);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsAgentSpeaking(false);
      };
      
      const currentTime = ctx.currentTime;
      if (liveNextStartTimeRef.current < currentTime) {
        liveNextStartTimeRef.current = currentTime;
      }
      setIsAgentSpeaking(true);
      source.start(liveNextStartTimeRef.current);
      liveNextStartTimeRef.current += buffer.duration;
    } catch(e) {
      console.error("Audio playback error:", e);
    }
  };

  const startLiveSession = async () => {
    if (isLiveMode) {
      stopLiveSession();
      return;
    }
    setIsLiveMode(true);
    setLiveModeStatus("Connecting...");
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/ai/live?tenantId=${currentUser?.tenantId}`);
      wsRef.current = ws;

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      liveAudioCtxRef.current = inputAudioCtx;
      liveOutputCtxRef.current = outputAudioCtx;
      liveNextStartTimeRef.current = 0;

      ws.onopen = async () => {
        setLiveModeStatus("Connected. Say Hi!");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          liveStreamRef.current = stream;
          const source = inputAudioCtx.createMediaStreamSource(stream);
          const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
          liveProcessorRef.current = processor;
          source.connect(processor);
          processor.connect(inputAudioCtx.destination);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Basic activity detection
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setIsUserSpeaking(rms > 0.01); // Threshold for speaking detection

            if (ws.readyState === WebSocket.OPEN && !isMuted) {
              const base64 = pcmToBase64(inputData);
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };
        } catch(e) {
          console.error("Mic error:", e);
          setLiveModeStatus("Microphone access denied.");
          setTimeout(stopLiveSession, 3000);
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setLiveModeStatus("Connection Error: " + msg.error);
            setTimeout(stopLiveSession, 3000);
          }
          if (msg.audio) {
            playLiveAudioChunk(outputAudioCtx, msg.audio);
          }
          if (msg.interrupted) {
            liveNextStartTimeRef.current = 0; // stop and reset playback queue logically
          }
        } catch(e) {}
      };

      ws.onerror = () => {
        setLiveModeStatus("Connection lost.");
        setTimeout(stopLiveSession, 3000);
      };
      ws.onclose = () => {
        stopLiveSession();
      };
    } catch(err) {
      console.error(err);
      stopLiveSession();
    }
  };

  const refreshContext = async () => {
    try {
      const [
        fin, health, activity, waste, guests, letters, lapak, election, inventory, registrations,
        mading, sos, complaints, bookings, birthdays
      ] = await Promise.all([
        getFinancialSummary(currentUser.tenantId),
        getHealthSummary(currentUser.tenantId),
        getWargaActivitySummary(currentUser.tenantId),
        getWasteBankSummary(currentUser.tenantId),
        getGuestBookSummary(currentUser.tenantId),
        getLettersSummary(currentUser.tenantId),
        getELapakSummary(currentUser.tenantId),
        getElectionSummary(currentUser.tenantId),
        getInventorySummary(currentUser.tenantId),
        getRegistrationInfo(currentUser.tenantId),
        getMadingSummary(currentUser.tenantId),
        getSOSSummary(currentUser.tenantId),
        getComplaintsSummary(currentUser.tenantId),
        getBookingsSummary(currentUser.tenantId),
        getBirthdaysSummary(currentUser.tenantId)
      ]);
      
      if (mountedRef.current) {
        setDataContext({ 
          financial: fin, health, activity, wasteBank: waste, 
          guestBook: guests, letters, eLapak: lapak, 
          election, inventory, registrations,
          mading, sos, complaints, bookings, birthdays
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
  }, [currentUser.tenantId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI({
        isPrivileged,
        message: input,
        role: currentUser.role,
        dataSummary: dataContext,
        history: messages.map(m => ({ 
          role: m.role === 'user' ? 'user' as const : 'model' as const, 
          parts: [{ text: m.text }] 
        }))
      });
      
      let botResponse = "";
      for await (const chunk of response) {
        botResponse += chunk.text || "";
      }
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      if (isAutoSpeak) {
        handleSpeak(botResponse);
      }
    } catch (e) {
      console.error("Chat failed", e);
      setMessages(prev => [...prev, { role: 'bot', text: "Maaf, Chaty sedang mengalami kendala. Bisa coba lagi sebentar lagi?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Browser SpeechRecognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.onresult = (event: any) => {
          setInput(event.results[0][0].transcript);
          setIsListening(false);
        };
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    
    setTtsError(null);
    setIsSpeaking(true);
    try {
      const response = await textToSpeech(text, isPrivileged);
      if (!response || !response.data) {
        console.warn("TTS failed: No valid audio data returned.");
        setIsSpeaking(false);
        setTtsError("Maaf, fitur suara sedang sibuk/habis kuota, silakan coba lagi nanti.");
        setTimeout(() => setTtsError(null), 5000);
        return;
      }
      
      // Convert base64 to Blob
      const base64Data = response.data;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], {type: 'audio/wav'});
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl); // Clean up memory
      };
      await audioRef.current.play();
    } catch (e) {
      console.error("TTS failed", e);
      setIsSpeaking(false);
      setTtsError("Maaf, terjadi kesalahan pada fitur suara.");
      setTimeout(() => setTtsError(null), 5000);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] md:h-[80vh] min-h-[500px] max-h-[850px] rounded-2xl shadow-2xl overflow-hidden transition-colors duration-500 ${isPrivileged ? 'bg-slate-950 border border-slate-800/60' : 'bg-white border border-slate-200'}`}>
      
      {/* Premium Header for Chairman */}
      {isPrivileged ? (
        <div className="px-6 py-5 border-b border-sky-400/10 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-all border border-slate-700/50"
                title="Kembali"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950 shadow-sm"></div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase font-elegant">{agentTitle}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-sky-400/80 uppercase tracking-widest">Sistem Intelijen Aktif</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={startLiveSession}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
                isLiveMode 
                  ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/30' 
                  : 'bg-sky-500/10 text-sky-400 border-sky-400/20 hover:bg-sky-500/20'
              }`}
            >
              {isLiveMode ? <RadioReceiver size={14} className="animate-pulse" /> : <Mic size={14} />}
              {isLiveMode ? "LIVE CHATY" : "VOICE MODE"}
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-slate-800/50 text-slate-400 hover:text-white transition-all border border-slate-700/50"
                title="Tutup Chat"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6 py-5 border-b border-sky-100 bg-white/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-sky-50 text-sky-500 hover:text-sky-700 transition-all border border-sky-100"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-sky-600" />
              </div>
              <h2 className="text-base font-bold text-slate-800">{agentTitle}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={startLiveSession}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                isLiveMode 
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20' 
                  : 'bg-sky-50 text-sky-600 hover:bg-sky-100 border-sky-100'
              }`}
            >
              {isLiveMode ? <RadioReceiver size={14} className="animate-pulse" /> : <Mic size={14} />}
              {isLiveMode ? "LIVE" : "VOICE"}
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        {isLiveMode && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-4 mb-4 backdrop-blur-md">
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-1 h-3 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1 h-3 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
            {liveModeStatus || "Chaty Voice Agent Active"}
          </motion.div>
        )}
        {ttsError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <VolumeX className="w-4 h-4 shrink-0" />
            {ttsError}
          </motion.div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              {msg.role === 'bot' && !isPrivileged && (
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0 mt-1">
                   <Bot className="w-4 h-4 text-blue-600" />
                 </div>
              )}
              {msg.role === 'bot' && isPrivileged && (
                 <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 shrink-0 mt-1">
                   <Bot className="w-4 h-4 text-blue-400" />
                 </div>
              )}
              
                <div className={`
                  relative px-5 py-4 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all
                  ${msg.role === 'user' 
                    ? 'bg-sky-500 text-white rounded-tr-none' 
                    : isPrivileged
                      ? 'bg-slate-900/80 text-sky-50 border border-sky-400/10 rounded-tl-none backdrop-blur-md'
                      : 'bg-white text-slate-800 border border-sky-100 rounded-tl-none'
                  }
                `}>
                  <Markdown>{msg.text}</Markdown>
                  
                  {msg.role === 'bot' && (
                    <button 
                      onClick={() => handleSpeak(msg.text)} 
                      className={`absolute -bottom-3 ${isPrivileged ? '-right-3 bg-sky-500 border-sky-400 text-white' : '-right-3 bg-white border-sky-200 text-sky-600'} p-2 rounded-full border shadow-lg transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:scale-110`}
                    >
                      {isSpeaking ? <VolumeX size={14}/> : <Volume2 size={14}/>}
                    </button>
                  )}
                </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex justify-start`}>
            {isPrivileged && (
                 <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 shrink-0">
                   <Bot className="w-4 h-4 text-blue-400" />
                 </div>
            )}
            <div className={`px-5 py-4 rounded-2xl rounded-tl-sm ${isPrivileged ? 'bg-slate-900/80 border border-slate-800/80' : 'bg-slate-100'} flex items-center gap-2`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isPrivileged ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '0ms' }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isPrivileged ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '150ms' }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isPrivileged ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <VoiceAgentOverlay 
        isOpen={isLiveMode}
        onClose={stopLiveSession}
        status={liveModeStatus}
        agentName={agentName}
        isListening={isUserSpeaking}
        isSpeaking={isAgentSpeaking}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Input Area */}
      <div className={`p-5 md:p-6 ${isPrivileged ? 'bg-slate-950 border-t border-sky-400/10' : 'bg-white border-t border-sky-100'}`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button 
            onClick={toggleListening} 
            className={`p-4 rounded-2xl transition-all shrink-0 border shadow-sm
              ${isListening 
                ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' 
                : isPrivileged 
                  ? 'bg-sky-500/10 text-sky-400 border-sky-400/20 hover:bg-sky-500/20' 
                  : 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100'
              }`}
          >
            {isListening ? <Square size={20}/> : <Mic size={20}/>}
          </button>
          
          <div className="flex-1 relative group">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className={`w-full pl-6 pr-14 py-4 rounded-2xl text-[15px] transition-all focus:outline-none focus:ring-4
                ${isPrivileged 
                  ? 'bg-slate-900 border-sky-400/10 text-sky-50 placeholder:text-slate-600 focus:border-sky-500/40 focus:ring-sky-500/10 border' 
                  : 'bg-slate-50 border border-sky-100 text-slate-800 focus:border-sky-500 focus:ring-sky-500/10 focus:bg-white'
                }
              `}
              placeholder="Tanya Chaty sesuatu..." 
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all
                ${!input.trim() 
                  ? 'opacity-30 cursor-not-allowed text-slate-500' 
                  : 'bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/25 hover:translate-x-1'
                }
              `}
            >
              <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              {isLoading && <Loader2 size={20} className="absolute inset-0 m-auto animate-spin" />}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] font-black text-sky-400/30 mt-4 uppercase tracking-[0.3em]">
          Powered by SmaRtRw AI Core v4.0 Tech
        </p>
      </div>
    </div>
  );
}
