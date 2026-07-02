import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { shortenUrl } from '../lib/appUtils';
import { Files as Copy, CheckCircle2 as Check, Zap, MapPin } from 'lucide-react';

export const GuestBookQRCode = ({ tenantId }: { tenantId: string }) => {
  const initialUrl = `${window.location.origin}/guestbook/${tenantId}`;
  const [displayUrl, setDisplayUrl] = useState(initialUrl);
  const [isShortening, setIsShortening] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    setIsShortening(true);
    try {
      const short = await shortenUrl(initialUrl);
      setDisplayUrl(short);
    } catch (err) {
      console.error("Shortening failed", err);
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(displayUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = displayUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm max-w-sm mx-auto">
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
        <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      
      <h3 className="font-bold text-slate-800 dark:text-white mb-1">QR Code LAPOR TAMU</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">
        Tempelkan QR ini di Pos Satpam agar tamu bisa melapor secara mandiri.
      </p>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
        <QRCodeSVG value={displayUrl} size={180} level="H" />
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
          <div className="flex-1 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 truncate px-2">
            {displayUrl}
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!displayUrl.includes('bit.ly') && !displayUrl.includes('tinyurl.com') && (
          <button
            onClick={handleShorten}
            disabled={isShortening}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
          >
            {isShortening ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Pendekkan Link</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
