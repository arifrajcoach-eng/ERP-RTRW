import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function AppQRCode({ tenantId }: { tenantId: string }) {
  const url = `${window.location.origin}`;
  return (
    <div className="flex flex-col items-center p-6 bg-white border border-slate-100 shadow-sm rounded-2xl w-full max-w-sm mx-auto">
      <h3 className="font-bold text-slate-800 tracking-tight text-center mb-1">Akses Aplikasi Warga</h3>
      <p className="text-sm text-slate-500 text-center mb-6">Scan QR Code ini untuk membuka SmaRtRw AI</p>
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <QRCodeSVG value={url} size={200} level="H" includeMargin={false} />
      </div>
      <p className="mt-6 text-xs font-mono font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full break-all text-center">
        {url}
      </p>
      <p className="mt-4 text-[10px] text-slate-400 text-center">
        Anda bisa mencetak dan menempelkan QR Code ini di Mading, Pos Satpam, atau Fasilitas Umum.
      </p>
    </div>
  );
}
