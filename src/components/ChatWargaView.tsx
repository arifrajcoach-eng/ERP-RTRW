import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send } from 'lucide-react';

export default function ChatWargaView({ tenantId, currentUser, handleFirestoreError }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!tenantId) return;
    const q = query(
      collection(db, 'chat_messages'),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    }, (err) => {
        handleFirestoreError(err, 'list', 'chat_messages');
    });
    return unsub;
  }, [tenantId]);

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
    } catch (err) {
      handleFirestoreError(err, 'create', 'chat_messages');
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold">Chat Warga</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.senderId === (currentUser.uid || currentUser.id_user) ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.senderId === (currentUser.uid || currentUser.id_user) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <div className="text-xs font-bold mb-1 opacity-70">{msg.senderName}</div>
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2"
          placeholder="Tulis pesan..."
        />
        <button onClick={sendMessage} className="p-2 bg-blue-600 rounded-xl text-white">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
