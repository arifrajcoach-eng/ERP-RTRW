import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { shortenUrl } from '../lib/appUtils';
import { CheckCircle2 as Check, Files as Copy, Zap } from 'lucide-react';

export default function AppQRCode({ tenantId }: { tenantId: string }) {
  const [displayUrl, setDisplayUrl] = useState(window.location.origin);
  const [isShortening, setIsShortening] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    setIsShortening(true);
    try {
      const short = await shortenUrl(window.location.origin);
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
        // Fallback for older browsers or insecure contexts
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
    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl w-full max-w-sm mx-auto">
      <h3 className="font-bold text-slate-800 dark:text-white tracking-tight text-center mb-1">Akses Aplikasi Warga</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">Scan QR Code ini untuk membuka SmaRtRw AI</p>
      
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
        <QRCodeSVG value={displayUrl || window.location.origin} size={200} level="H" />
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
          <div className="flex-1 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 truncate px-2">
            {displayUrl}
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500"
            title="Salin Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!displayUrl.includes('bit.ly') && !displayUrl.includes('tinyurl.com') && (
          <button
            onClick={handleShorten}
            disabled={isShortening}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-brand-blue hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
          >
            {isShortening ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Pendekkan URL (Bitly)</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-6 text-[10px] text-slate-400 text-center leading-relaxed">
        Anda bisa mencetak dan menempelkan QR Code ini di Mading, Pos Satpam, atau Fasilitas Umum untuk memudahkan warga mengakses sistem.
      </p>
    </div>
  );
}
