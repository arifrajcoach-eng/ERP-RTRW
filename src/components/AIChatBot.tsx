import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, MessageSquare, User, Loader2, Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const { currentUser } = props;
  const tenantId = currentUser?.tenantId || localStorage.getItem('currentTenantId') || (window as any).currentTenant?.id;
  
  if (!tenantId) {
    console.warn("AIChatBot: Tenant ID still missing after check.");
    return null;
  }
  
  const optimizedUser = { ...currentUser, tenantId };

  return <AIChatBotInner {...props} currentUser={optimizedUser} />;
}

function AIChatBotInner({ currentUser, agentType = 'auto', plan }: { currentUser: any, agentType?: 'cs' | 'admin' | 'auto', plan?: string }) {
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
  const [isMuted, setIsMuted] = useState(true);
  
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
    };
  }, []);

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
      const response = await textToSpeech(text);
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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ttsError && (
          <div className="p-2 bg-red-100 text-red-700 text-xs rounded mb-2">
            {ttsError}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.text}
              {msg.role === 'bot' && (
                <button onClick={() => handleSpeak(msg.text)} className="ml-2 text-xs opacity-50 hover:opacity-100">
                  {isSpeaking ? <VolumeX size={12}/> : <Volume2 size={12}/>}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && <Loader2 className="animate-spin text-blue-600" />}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <button onClick={toggleListening} className={`p-2 rounded ${isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>
          {isListening ? <Square size={20}/> : <Mic size={20}/>}
        </button>
        <button onClick={() => setIsAutoSpeak(!isAutoSpeak)} className={`p-2 rounded ${isAutoSpeak ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
          {isAutoSpeak ? <Volume2 size={20}/> : <VolumeX size={20}/>}
        </button>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border rounded p-2" 
          placeholder="Tanya Chaty..." 
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded"><Send size={20}/></button>
      </div>
    </div>
  );
}
