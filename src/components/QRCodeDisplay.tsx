"use client";
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface QRCodeDisplayProps {
  shopId: string;
  restaurantName: string;
}

export default function QRCodeDisplay({ shopId, restaurantName }: QRCodeDisplayProps) {
  const [showQR, setShowQR] = useState(false);
  const { t } = useTranslation();

  const customerUrl = typeof window !== 'undefined' ? `${window.location.origin}/customer/${shopId}` : '';

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${restaurantName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {t.dashboard.qrTitle}
        </h3>
        <button
          onClick={() => setShowQR(!showQR)}
          className={`px-5 py-2.5 rounded-xl font-bold transition shadow-md ${
            showQR ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
          }`}
        >
          {showQR ? t.dashboard.hideQR : t.dashboard.showQR}
        </button>
      </div>

      {showQR && (
        <div className="text-center space-y-6">
          <div className="bg-white p-8 rounded-2xl inline-block border-2 border-gray-200 shadow-sm">
            <QRCodeSVG id="qr-code-svg" value={customerUrl} size={256} level="H" includeMargin={true} bgColor="#ffffff" fgColor="#000000" />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-2">{t.dashboard.customerUrl}</p>
            <p className="text-sm text-red-500 font-mono break-all">{customerUrl}</p>
          </div>

          <button
            onClick={downloadQR}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-red-200 transform hover:scale-105 active:scale-95"
          >
            {t.dashboard.downloadQR}
          </button>

          <p className="text-sm text-gray-500">{t.dashboard.qrHint}</p>
        </div>
      )}
    </div>
  );
}