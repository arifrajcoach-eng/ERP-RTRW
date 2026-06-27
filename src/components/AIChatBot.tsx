import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, MessageSquare, User, Loader2, Mic, MicOff, Volume2, VolumeX, Square, X, ChevronLeft, RadioReceiver, Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

function AIChatBotInner({ currentUser, agentType = 'auto', plan, onClose }: { currentUser: any, agentType?: 'cs' | 'admin' | 'auto', plan?: string, onClose?: () => void }) {
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
    ? `Halo, selamat hari yang luar biasa, Ketua ! Chaty senang sekali bisa menyapa Bapak Ibu hari ini. Ada yang bisa Chaty bantu untuk keperluan wilayah kita hari ini, Pimpinan? Chaty siap membantu dengan penuh semangat!`
    : `Halo Bapak/ Ibu Pengurus RT RW ! Selamat datang, Chaty senang sekali bisa menyapa Bapak/ Ibu hari ini. 😊✨ Ada yang bisa Chaty bantu untuk keperluan administrasi, pembuatan surat, atau layanan warga lainnya hari ini ? Silakan beri tahu Chaty ya, Chaty siap membantu dengan senang hati! 🙏`;

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
        <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onClose && (
              <button 
                onClick={onClose}
                className="mr-1 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
                title="Kembali"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200 tracking-wide">{agentTitle}</h2>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Sistem Intelijen Aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={startLiveSession}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isLiveMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
              }`}
              title={isLiveMode ? "Stop Voice Mode" : "Start Live Voice Mode (Deep Thinking)"}
            >
              {isLiveMode ? <PhoneOff size={14} className="animate-pulse" /> : <Phone size={14} />}
              {isLiveMode ? "LIVE" : "VOICE MODE"}
            </button>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all"
                title="Tutup Chat"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-sm font-semibold text-slate-700">{agentTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startLiveSession}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isLiveMode ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
              title={isLiveMode ? "Stop Voice Mode" : "Start Live Voice Mode"}
            >
              {isLiveMode ? <PhoneOff size={14} className="animate-pulse" /> : <Phone size={14} />}
              {isLiveMode ? "LIVE" : "VOICE MODE"}
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {isLiveMode && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-xl flex items-center justify-center gap-3 mb-4">
            <RadioReceiver className="w-5 h-5 animate-pulse" />
            {liveModeStatus || "Voice Mode Active"}
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
                relative px-5 py-3.5 rounded-2xl max-w-[85%] text-[13px] md:text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? isPrivileged 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 rounded-tr-sm' 
                    : 'bg-blue-600 text-white shadow-md rounded-tr-sm' 
                  : isPrivileged
                    ? 'bg-slate-900/80 text-slate-300 border border-slate-800/80 rounded-tl-sm backdrop-blur-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }
              `}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                
                {msg.role === 'bot' && (
                  <button 
                    onClick={() => handleSpeak(msg.text)} 
                    className={`absolute -bottom-3 ${isPrivileged ? '-right-3 bg-slate-800 border-slate-700 text-slate-400 hover:text-blue-400' : '-right-3 bg-white border-slate-200 text-slate-500 hover:text-blue-600'} p-1.5 rounded-full border shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100`}
                    title="Putar Suara"
                  >
                    {isSpeaking ? <VolumeX size={12}/> : <Volume2 size={12}/>}
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
      <div className={`p-4 md:p-5 ${isPrivileged ? 'bg-slate-900 border-t border-slate-800/80' : 'bg-white border-t border-slate-100'}`}>
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={toggleListening} 
            className={`p-3 rounded-xl transition-all shrink-0
              ${isListening 
                ? 'bg-red-500/20 text-red-500 animate-pulse' 
                : isPrivileged 
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            title="Dikte Suara"
          >
            {isListening ? <Square size={18}/> : <Mic size={18}/>}
          </button>
          
          <button 
            onClick={() => setIsAutoSpeak(!isAutoSpeak)} 
            className={`p-3 rounded-xl transition-all shrink-0 hidden sm:flex
              ${isAutoSpeak 
                ? isPrivileged ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600' 
                : isPrivileged ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            title={isAutoSpeak ? "Suara Otomatis Aktif" : "Suara Otomatis Nonaktif"}
          >
            {isAutoSpeak ? <Volume2 size={18}/> : <VolumeX size={18}/>}
          </button>
          
          <div className="flex-1 relative">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className={`w-full pl-4 pr-12 py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2
                ${isPrivileged 
                  ? 'bg-slate-800 border-none text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/50' 
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white'
                }
              `}
              placeholder="Tanya Chaty sesuatu..." 
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all
                ${!input.trim() 
                  ? 'opacity-50 cursor-not-allowed text-slate-400' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md hover:shadow-blue-600/25 shadow-blue-600/20'
                }
              `}
            >
              <Send size={16} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              {isLoading && <Loader2 size={16} className="absolute inset-0 m-auto animate-spin" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
