import React from 'react';

export const SuratTemplate = ({ surat, kop, settings }: { surat: any, kop: any, settings: any }) => {
    return (
        <div className="w-[210mm] min-h-[297mm] p-[15mm] bg-white text-black shadow-lg mx-auto text-sm font-serif">
             <div className="flex items-center gap-4 relative">
                {kop?.logo_url && <img src={kop.logo_url} crossOrigin="anonymous" alt="Logo" className="w-20 h-20 object-contain" />}
                <div className="flex-1 text-center">
                    <h2 className="text-lg font-bold uppercase">{kop?.nama_rt || `RUKUN TETANGGA ${kop?.rt || '...'} / RUKUN WARGA ${kop?.rw || '...'}`}</h2>
                    <p className="text-sm">KELURAHAN {kop?.kelurahan?.toUpperCase() || '...'} - KECAMATAN {kop?.kecamatan?.toUpperCase() || '...'}</p>
                    <p className="text-sm font-bold">{kop?.kabupaten?.toUpperCase().includes('KABUPATEN') || kop?.kabupaten?.toUpperCase().includes('KOTA') ? '' : 'KABUPATEN '}{kop?.kabupaten?.toUpperCase() || 'BEKASI'}</p>
                    <p className="text-[10px]">Sekretariat : {kop?.alamat || '...'} | Email: {kop?.email || '...'} | Instagram: {kop?.instagram || '...'}</p>
                </div>
                <div className="w-20"></div>
            </div>
            <div className="border-b-4 border-black mt-2"></div>
            <div className="border-b-2 border-black mt-0.5"></div>
            
            <div className="text-center mt-6">
                <h3 className="text-lg font-bold underline">{surat?.jenisSurat || 'SURAT PENGANTAR'}</h3>
                <p>Nomor : {surat?.nomor_surat || '...... / RT .... / RW .... / Tahun 202...'}</p>
            </div>

            {/* In a real app, logic for specific letter fields would be here based on surat.jenisSurat */}
            <div className="mt-6 leading-relaxed">
              <p className="mb-4">Yang bertanda tangan di bawah ini Ketua RT {surat?.rt || kop?.rt || '...'} / RW {surat?.rw || kop?.rw || '...'}</p>
              <p className="mb-4">Dengan ini menerangkan bahwa :</p>
              <div className="grid grid-cols-[180px_10px_1fr] gap-2 ml-4">
                 <div>Nama</div><div>:</div><div><strong>{surat?.pemohon || '...'}</strong></div>
                 <div>Tempat Tgl, Lahir</div><div>:</div><div>{surat?.ttl || '-'}</div>
                 {/* ... other fields ... */}
              </div>
            </div>
        </div>
    );
};
