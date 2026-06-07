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
  reportKematian
} from '../services/aiAgentTools';
import { chatWithAI, textToSpeech } from '../services/aiService';

export default function AIChatBot({ currentUser, agentType = 'auto', plan }: { currentUser: any, agentType?: 'cs' | 'admin' | 'auto', plan?: string }) {
  const isPrivileged = agentType === 'cs' ? false :
                       agentType === 'admin' ? true :
                       ['SUPER_ADMIN', 'ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser?.role?.toUpperCase());
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
  
  const tenantId = currentUser?.tenantId || 'rw26_berjuang';
  const roleUpper = currentUser?.role?.toUpperCase();
  
  // Calculate weeklyLimit based on plan
  const normalizedPlan = (plan || 'STARTER').toUpperCase();
  const baseKey = normalizedPlan.includes('TRIAL') || normalizedPlan.includes('STARTER') ? 'TRIAL' :
                  normalizedPlan.includes('FLASH') || normalizedPlan.includes('BASIC') ? 'BASIC' :
                  normalizedPlan.includes('PRO') ? 'PRO' :
                  normalizedPlan.includes('PREMIUM') ? 'PREMIUM' :
                  normalizedPlan.includes('ENTERPRISE') ? 'ENTERPRISE' : 'TRIAL';
  
  const planDetails = PLAN_FEATURES[baseKey] || PLAN_FEATURES.TRIAL;

  let weeklyLimit = planDetails.weeklyAiLimit || 2;
  const isSuperUser = roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN' || roleUpper === 'SUPER ADMIN' || currentUser?.isSuperAdmin;
  if (isSuperUser) {
    weeklyLimit = 9999;
  }

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
    if (!isPrivileged) return; // Nonaktifkan suara untuk AI Asisten Warga
    if (isMuted) return;

    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {}
      sourceRef.current = null;
    }

    if (!text) return;

    try {
      setIsSpeaking(true);
      const response = await textToSpeech(text, isPrivileged);
      if (!response || !mountedRef.current) {
        setIsSpeaking(false);
        return;
      }

      const base64Audio = response.data;
      const audioContext = audioContextRef.current || new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Use the pcmToWavBlob for broader compatibility (iOS, etc)
      const blob = pcmToWavBlob(bytes, 24000);
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        if (mountedRef.current) {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        }
      };
      
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        if (mountedRef.current) {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        }
      };

      await audio.play();
    } catch (error) {
      console.error("Speech Error:", error);
      if (mountedRef.current) {
        setIsSpeaking(false);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      } catch (e) {}
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung pengenalan suara (Speech Recognition). Silakan gunakan Google Chrome atau Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setIsMuted(false);

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      let errorHelpMsg = "Maaf, terjadi kesalahan koneksi atau konfigurasi pada speech recognition mikrofon.";
      if (event.error === 'not-allowed') {
        errorHelpMsg = "Izin mikrofon terblokir secara otomatis oleh browser atau iframe. Silakan berikan izin mikrofon pada peramban/browser Kakak di bar atas, atau buka aplikasi SmaRtRw AI langsung di tab baru (klik tombol panah keluar di kanan atas preview) untuk mengaktifkan mikrofon secara penuh! 😊🎤";
      } else if (event.error === 'no-speech') {
        errorHelpMsg = "Suara Kakak kurang terdengar atau tidak terdeteksi nih. Yuk coba bicara lagi lebih dekat ke mikrofon ya! 😉🎙️";
      } else if (event.error === 'network') {
        errorHelpMsg = "Gagal memproses suara karena masalah jaringan. Mohon coba beberapa saat lagi ya Kak! ⚡";
      } else if (event.error === 'aborted') {
        errorHelpMsg = "Perekaman suara dibatalkan.";
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: errorHelpMsg }]);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const results = event.results;
      if (results.length > 0) {
        const transcript = results[results.length - 1][0].transcript;
        setInput(transcript);

        if (transcript.trim()) {
          setTimeout(() => {
            handleSend(transcript);
          }, 300);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (manualInput?: string, retries = 1) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || isLoading) return;

    if (usageCount >= weeklyLimit) {
      setMessages(prev => [...prev, { role: 'bot', text: `Aduh maaf sekali Kakak/Pimpinan! 🫣 Kuota Chat AI Mingguan (${weeklyLimit}x per minggu) untuk Paket ${baseKey === 'TRIAL' ? 'STARTER' : baseKey} Anda sudah habis.\n\nSupaya Kakak/Pimpinan bisa bebas chatingan dengan Chaty tanpa hambatan batas mingguan, silakan lakukan Upgrade Paket dengan klik banner "SmaRtRw AI" di dashboard utama atau hubungi Tim Support kami via wa.me/6287726741143 ya! Terima kasih banyak atas pengertiannya! 😉✨` }]);
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
      
      const filteredContext = {
        ...(isSensitiveDataAllowed ? dataContext : {
          financial: { total: dataContext?.financial?.total }, // Keep only summary, hide details
          health: dataContext?.health,
          activity: dataContext?.activity,
          wasteBank: dataContext?.wasteBank,
          guestBook: dataContext?.guestBook,
          letters: dataContext?.letters,
          eLapak: dataContext?.eLapak,
          election: dataContext?.election,
          // Excluded: inventory, registrations, sensitive financial details
        }),
        currentUserProfile: {
          nama: currentUser?.nama || currentUser?.name || 'Warga',
          nik: currentUser?.nik || currentUser?.nikMapping || '-',
          kk: currentUser?.kk || currentUser?.noKK || '-',
          alamat: currentUser?.alamat || '-',
          rt: currentUser?.rt || '01',
          rw: currentUser?.rw || '26',
          role: currentUser?.role || 'Warga',
          terverifikasi: currentUser?.terverifikasi || false
        }
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
             // 1. Remove markdown code blocks
             let cleaned = text.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim();
             
             // 2. If it's still raw JSON structure, attempt to extract 'text' field or return empty
             if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
                 try {
                     const parsed = JSON.parse(cleaned);
                     if (parsed.text) return parsed.text;
                     return ""; // Don't speak raw internal JSON
                 } catch(e) {
                     // Not valid JSON, keep as is
                 }
             }
             
             // 3. Remove remaining emoji icons that might sound weird if too many
             return cleaned;
          };

          try {
            const cleanText = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonAction = JSON.parse(cleanText);
            if (jsonAction.action === 'createSurat') {
              const params = jsonAction.params || {};
              const res = await createSurat({ 
                pemohon: params.pemohon || currentUser?.nama || currentUser?.name || 'Warga',
                nik: params.nik || currentUser?.nik || '-',
                noKK: params.noKK || params.nokk || params.kk || currentUser?.kk || currentUser?.noKK || '-',
                kk: params.noKK || params.nokk || params.kk || currentUser?.kk || currentUser?.noKK || '-',
                keperluan: params.keperluan || 'Dokumen Administrasi',
                jenisSurat: params.jenisSurat || 'Pengantar',
                jenis: params.jenisSurat || params.jenis || 'Pengantar',
                nomorHp: params.nomorHp || params.phone || currentUser?.phone || currentUser?.nomorHp || '-',
                tenantId,
                userId: currentUser?.uid || currentUser?.id_user || currentUser?.id || null,
                authUid: currentUser?.uid || currentUser?.id_user || currentUser?.id || null,
                rt: params.rt || currentUser?.rt || '01',
                rw: params.rw || currentUser?.rw || '26'
              });
              const msg = res.success ? (jsonAction.text || `Alhamdulillah kak, ${params.jenisSurat || 'surat'} berhasil dibuat (ID: ${res.id}).`) : 'Maaf kak, ada kendala saat membuat surat.';
              setMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: msg }]);
              handleSpeak(msg);
            } else if (jsonAction.action === 'registerELapak') {
              const res = await registerELapak({ ...jsonAction.params, tenantId, userId: currentUser?.email || 'unknown' });
              const msg = res.success ? `Alhamdulillah kak, pendaftaran e-lapak berhasil (ID: ${res.id}).` : 'Maaf kak, ada kendala saat mendaftar e-lapak.';
              setMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: msg }]);
              handleSpeak(msg);
            } else if (jsonAction.action === 'reportKelahiran') {
              const params = jsonAction.params || {};
              const res = await reportKelahiran({ ...params, tenantId });
              const msg = res.success ? (jsonAction.text || `Sip, kelahiran telah dicatat.`) : 'Maaf kak, gagal mencatat kelahiran.';
              setMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: msg }]);
              handleSpeak(msg);
            } else if (jsonAction.action === 'reportKematian') {
              const params = jsonAction.params || {};
              const res = await reportKematian({ ...params, tenantId });
              const msg = res.success ? (jsonAction.text || `Pelaporan kematian telah dicatat.`) : 'Maaf kak, gagal mencatat pelaporan kematian.';
              setMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: msg }]);
              handleSpeak(msg);
            } else if (jsonAction.action === 'reportComplaint') {
              const params = jsonAction.params || {};
              const res = await reportComplaint({ ...params, tenantId, userId: currentUser?.uid });
              const msg = res.success ? (jsonAction.text || `Keluhan telah dicatat (ID: ${res.id}).`) : 'Maaf kak, gagal mencatat keluhan.';
              setMessages(prev => [...prev.slice(0, -1), { role: 'bot', text: msg }]);
              handleSpeak(msg);
            } else if (jsonAction.action === 'bookFacility') {
              const params = jsonAction.params || {};
              const res = await bookFacility({ ...params, tenantId, userId: currentUser?.uid });
              const msg = res.success ? (jsonAction.text || `Booking fasilitas telah diajukan (ID: ${res.id}).`) : 'Maaf kak, gagal melakukan booking.';
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
        const checkMsg = error.message && error.message.includes('GEMINI') ? error.message : '';
        let errorMsg = `Maaf, ada gangguan pada koneksi atau AI saya. Detail: ${error.message || 'Error tidak diketahui'}`;
        
        if (error.message?.includes('GEMINI_API_KEY') || error.message?.includes('VITE_GEMINI')) {
          errorMsg = 'Aduh maaf, kunci AI belum terdeteksi. Jika di Vercel, pastikan kamu menggunakan nama VITE_GEMINI_API_KEY, dan kamu WAJIB melakukan Redeploy setelah memasukkan kunci tersebut ya!';
        } else if (
          error.message?.includes('429') || 
          error.message?.includes('Quota exceeded') || 
          error.message?.includes('RESOURCE_EXHAUSTED') ||
          JSON.stringify(error).includes('429') ||
          JSON.stringify(error).includes('RESOURCE_EXHAUSTED')
        ) {
          errorMsg = isPrivileged
            ? `Halo Pimpinan! Mohon maaf sebesar-besarnya. 🫣 Layanan AI pintar kami saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).\n\nUntuk tetap menikmati fitur analisis AI premium, verifikasi data, laporan otomatis, dan pencetakan tanpa batas kuota, silakan hubungi tim kami untuk Aktivasi Premium dengan klik banner "SmaRtRw AI" di Dashboard utama atau hubungi WhatsApp Admin SmaRtRw AI di wa.me/6287726741143 (0877-2674-1143) sekarang juga. Terima kasih atas perhatiannya! 😉⚡`
            : `Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Kuota panggilan AI gratisan Chaty saat ini literally lagi penuh/kehabisan kuota harian nih (Error 429: Resource Exhausted). Maklum, warga komplek lain lagi ramai banget chatingan sama Chaty buat cetak surat dan tanya-tanya! 🤭✨\n\nTapi tenang aja Kak! Kakak sekeluarga bisa klik banner "SmaRtRw AI" di dashboard atau hubungi WhatsApp Admin di wa.me/6287726741143 untuk melakukan Aktivasi Premium biar bebas kuota kapan saja dengan fast response! Boleh juga dicoba lagi beberapa saat yaa. Chaty tunggu kabarnya! 😉✨`;
        }

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
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sistem Cerdas Lingkungan • {weeklyLimit >= 9999 ? 'Kuota Unlimited' : `Sisa Kuota Mingguan: ${weeklyLimit - usageCount}`}
            </p>
          </div>
        </div>
        {isPrivileged && (
          <button
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (newMuted) {
                stopSpeaking();
              } else {
                const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot');
                if (lastBotMsg && lastBotMsg.text) {
                  handleSpeak(lastBotMsg.text);
                }
              }
            }}
            className={`p-2 rounded-xl border transition-all ${
              isMuted 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-sm'
            }`}
            title={isMuted ? "Suara Chaty: Nonaktif" : "Suara Chaty: Aktif"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />}
          </button>
        )}
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
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm pb-8'
                }`}>
                  {msg.text || (isLoading && idx === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : '...')}
                  
                  {msg.role === 'bot' && msg.text && isPrivileged && (
                    <button
                      onClick={() => {
                        setIsMuted(false);
                        handleSpeak(msg.text);
                      }}
                      className="absolute right-2 bottom-2 text-slate-400 hover:text-brand-blue dark:text-slate-500 dark:hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
                      title="Bacakan ulang pesan ini"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
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
          {isPrivileged && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              title={isListening ? "Mendengarkan... klik untuk berhenti" : "Klik & sapa Chaty melalui Mic"}
              disabled={isLoading}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'scale-110' : ''}`} />
            </button>
          )}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Mendengarkan Kakak bicara..." : "Tanya apa saja..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-2 pl-2"
            disabled={isLoading || isListening}
          />

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 transition-all"
              title="Hentikan suara Chaty"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={() => handleSend()}
            disabled={isLoading || isListening || !input.trim()}
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
