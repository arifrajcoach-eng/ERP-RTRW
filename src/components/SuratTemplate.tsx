import React from 'react';

export const SuratTemplate = ({ surat, kop, settings }: { surat: any, kop: any, settings: any }) => {
    return (
        <div 
          className="w-[210mm] min-h-[297mm] p-[15mm] bg-white text-black shadow-lg mx-auto text-sm font-serif relative"
          style={{ 
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact' 
          }}
        >
          {kop?.bg_kertas_url && (
            <div 
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
            >
                <div 
                    style={{
                        width: '100mm',
                        height: '100mm',
                        backgroundImage: `url(${kop.bg_kertas_url})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'grayscale(100%) opacity(0.15)'
                    }}
                />
            </div>
          )}
             <div className="flex items-center relative z-10">
                <div className="flex items-center w-48">
                    {surat?.show_logo !== 'no' && kop?.logo_url && <img src={kop.logo_url} alt="Logo" className="w-[90px] h-[90px] object-contain mr-4 ml-4" />}
                </div>
                <div className="flex-1 text-center px-4 flex flex-col justify-center items-center">
                    <h2 className="font-['Arial'] text-lg font-bold uppercase w-[393.992px] h-[23.9844px]">{`RUKUN TETANGGA ${surat?.rt || kop?.rt || '...'} / RUKUN WARGA ${kop?.rw || '...'}`}</h2>
                    <p className="font-['Arial'] text-[16px] leading-[24.8571px] font-bold w-[398.875px] h-[23.9792px]">KELURAHAN {kop?.kelurahan?.toUpperCase() || '...'} - KECAMATAN {kop?.kecamatan?.toUpperCase() || '...'}</p>
                    <p className="font-['Arial'] text-[16px] leading-[20px] font-bold">{kop?.kabupaten?.toUpperCase().includes('KABUPATEN') || kop?.kabupaten?.toUpperCase().includes('KOTA') ? '' : 'KABUPATEN '}{kop?.kabupaten?.toUpperCase() || 'BEKASI'}</p>
                    <p className="w-[347.242px] h-[23.2461px] text-[8px] leading-[11.14px]">Sekretariat : {kop?.alamat || '...'} | Email: {kop?.email || '...'} | Instagram: {kop?.instagram || '...'}</p>
                </div>
                <div className="flex items-center justify-start w-48">
                    {surat?.show_logo !== 'no' && kop?.logo_rw_url && <img src={kop.logo_rw_url} alt="Logo RW" className="w-[100px] h-[95px] object-contain ml-4" />}
                </div>
            </div>
            <div className="border-b-4 border-black mt-2"></div>
            <div className="border-b-2 border-black mt-0.5"></div>
            
            <div className="text-center mt-6">
                <h3 className="text-lg font-bold underline">{surat?.jenisSurat || 'SURAT PENGANTAR'}</h3>
                <p>Nomor : {surat?.nomor_surat || '...... / RT .... / RW .... / Tahun 202...'}</p>
            </div>

            {/* In a real app, logic for specific letter fields would be here based on surat.jenisSurat */}
            <div className="mt-6 leading-relaxed">
              <p className="mb-4">Yang bertanda tangan di bawah ini Ketua RT {surat?.rt || kop?.rt || '...'} / RW {kop?.rw || '...'} Kelurahan {(kop?.kelurahan || '...').toLowerCase().replace(/\b\w/g, s => s.toUpperCase())} Kecamatan {(kop?.kecamatan || '...').toLowerCase().replace(/\b\w/g, s => s.toUpperCase())} {((kop?.kabupaten || settings?.kabupaten || 'Bekasi').toLowerCase().includes('kabupaten') || (kop?.kabupaten || settings?.kabupaten || 'Bekasi').toLowerCase().includes('kota') ? '' : 'Kabupaten ') + (kop?.kabupaten || settings?.kabupaten || 'Bekasi').toLowerCase().replace(/\b\w/g, s => s.toUpperCase())}</p>
              <p className="mb-4">Dengan ini menerangkan bahwa :</p>
              <div className="grid grid-cols-[180px_10px_1fr] gap-2 ml-4">
                 <div>Nama</div><div>:</div><div><strong>{surat?.pemohon || '...'}</strong></div>
                 <div>Tempat Tgl, Lahir</div><div>:</div><div>{surat?.ttl || '-'}</div>
                 <div>Jenis Kelamin</div><div>:</div><div>{surat?.jk || '-'}</div>
                 <div>Pekerjaan</div><div>:</div><div>{surat?.pekerjaan || '-'}</div>
                 <div>Kewarganegaraan</div><div>:</div><div>{surat?.kewarganegaraan || 'WNI'}</div>
                 <div>No. KTP/NIK</div><div>:</div><div>{surat?.nik || '-'}</div>
                 <div>Status Perkawinan</div><div>:</div><div>{surat?.statusKawin || '-'}</div>
                 <div>Alamat</div><div>:</div><div>{surat?.alamat || '-'}</div>
                 <div className="mt-2">Maksud / Keperluan</div><div className="mt-2">:</div><div className="mt-2 font-bold">{surat?.keperluan || '-'}</div>
              </div>
              <p className="mt-6">Demikian Surat Pengantar ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>
            </div>

            <div className="mt-12 flex justify-between">
                <div className="text-center">
                    <p>Mengetahui,</p>
                    <p>Ketua RW {kop?.rw || '....'}</p>
                    <div className="h-20 flex items-center justify-center relative">
                        {kop?.signature_rw_url && (
                          <img 
                            src={kop.signature_rw_url} 
                            alt="TTD RW" 
                            className="absolute h-20 w-full object-contain pointer-events-none" 
                          />
                        )}
                    </div>
                    <p className="font-bold underline">( {surat?.ketua_rw_nama || kop?.nama_ketua_rw || '...................................'} )</p>
                </div>
                <div className="text-center">
                    <p>{(() => {
                        const kab = kop?.kabupaten || settings?.kabupaten || 'Bekasi';
                        const prefix = kab.toUpperCase().includes('KABUPATEN') || kab.toUpperCase().includes('KOTA') ? '' : 'Kabupaten ';
                        return prefix + kab.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                      })()}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p>{surat?.jabatan_ttd || 'Ketua RT'} {surat?.rt || kop?.rt || '....'}</p>
                    <div className="h-20 flex items-center justify-center relative">
                        {kop?.signature_rt_url && (
                          <img 
                            src={kop.signature_rt_url} 
                            alt="TTD RT" 
                            className="absolute h-20 w-full object-contain pointer-events-none" 
                          />
                        )}
                    </div>
                    <p className="font-bold underline">( {surat?.ketua || kop?.nama_ketua_rt || '...................................'} )</p>
                </div>
            </div>

            <div className="mt-12 border-t border-black pt-2 text-[10px] text-gray-800">
                 <div className="font-mono">
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {/* Kiri: TL. Berkas, Berkas Sesuai */}
                      <div className="flex flex-col">
                        <span>TL. Berkas / Surat No :</span>
                        <span className="mt-1">Berkas Sesuai</span>
                        <div className="w-20 h-6 border border-black mt-1 bg-white"></div>
                      </div>
                      {/* Tengah: Hal, Berkas Kecamatan */}
                      <div className="flex flex-col">
                        <span>Hal:</span>
                        <span className="mt-1">Berkas Kecamatan</span>
                        <div className="w-20 h-6 border border-black mt-1 bg-white"></div>
                      </div>
                      {/* Kanan: Tgl, Paraf Arsiparis */}
                      <div className="flex flex-col">
                        <span>Tgl :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
                        <span className="mt-1">Paraf Arsiparis</span>
                        <div className="w-20 h-6 border border-black mt-1 bg-white"></div>
                      </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};
