import React from 'react';

const PaymentPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-4">Langganan Anda Telah Berakhir</h2>
                <p className="text-gray-600 mb-6">
                    Akun Anda saat ini tidak aktif. Silakan lakukan pembayaran untuk melanjutkan akses ke aplikasi SmartRW.
                </p>
                <div className="space-y-4">
                    <button 
                        onClick={() => window.location.href = '#'}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                        Bayar Sekarang
                    </button>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition"
                    >
                        Cek Status Pembayaran
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
