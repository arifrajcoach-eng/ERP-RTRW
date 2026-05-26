import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const GuestBookQRCode = ({ tenantId }: { tenantId: string }) => {
  const url = `${window.location.origin}/guestbook/${tenantId}`;
  return (
    <div className="flex flex-col items-center p-4 bg-white border rounded-xl">
      <h3 className="font-bold mb-2">QR Code Keamanan Digital</h3>
      <QRCodeSVG value={url} size={200} />
      <p className="mt-2 text-sm text-gray-500">{url}</p>
    </div>
  );
};
