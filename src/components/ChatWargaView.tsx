import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, RefreshCw, Zap } from 'lucide-react';

export default function ChatWargaView({ tenantId, currentUser, handleFirestoreError, currentTenant }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const plan = currentTenant?.status || 'TRIAL';
  const isRealtime = plan === 'PRO';

  const fetchMessages = async () => {
    if (!tenantId) return;
    setIsRefreshing(true);
    try {
      const q = query(
        collection(db, 'chat_messages'),
        where('tenantId', '==', tenantId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(50)
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages(msgs);
    } catch (err) {
      handleFirestoreError(err, 'list', 'chat_messages');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!tenantId) return;

    if (isRealtime) {
      const q = query(
        collection(db, 'chat_messages'),
        where('tenantId', '==', tenantId),
        orderBy('timestamp', 'asc'),
        firestoreLimit(100)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
      }, (err) => {
          handleFirestoreError(err, 'list', 'chat_messages');
      });
      return unsub;
    } else {
      // Semi-realtime for BASIC/TRIAL
      fetchMessages();
      const interval = setInterval(fetchMessages, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [tenantId, isRealtime]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    try {
      await addDoc(collection(db, 'chat_messages'), {
        tenantId,
        senderId: currentUser.uid || currentUser.id_user,
        senderName: currentUser.name || 'Warga',
        message: newMessage,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
      if (!isRealtime) fetchMessages(); // Immediate refresh after sending
    } catch (err) {
      handleFirestoreError(err, 'create', 'chat_messages');
    }
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Grup Chat Warga</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isRealtime ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {isRealtime ? 'Terhubung (Realtime)' : 'Dibatasi (Polling 30s)'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isRealtime && (
            <button 
              onClick={fetchMessages}
              disabled={isRefreshing}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
              title="Refresh Pesan"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {plan !== 'PRO' && (
            <div className="bg-indigo-50 px-2 py-1 rounded-lg flex items-center gap-1 border border-indigo-100 animate-bounce">
              <Zap className="w-3 h-3 text-indigo-600" />
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter">PRO</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Belum ada obrolan.<br/>Mulai sapa warga lainnya!</p>
          </div>
        ) : messages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.senderId === (currentUser.uid || currentUser.id_user) ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative p-4 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm ${
              msg.senderId === (currentUser.uid || currentUser.id_user) 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              <div className={`text-[10px] font-black uppercase tracking-tighter mb-1 opacity-70 ${
                msg.senderId === (currentUser.uid || currentUser.id_user) ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {msg.senderName}
              </div>
              <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm font-medium placeholder:text-slate-400"
            placeholder="Tulis pesan untuk warga..."
          />
          <button 
            onClick={sendMessage} 
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
