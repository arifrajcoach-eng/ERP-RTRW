const fs = require('fs');
let code = fs.readFileSync('src/components/WargaView.tsx', 'utf8');

// Replace Table header 'RT/RW'
code = code.replace(
  '<th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em]">RT/RW</th>',
  '<th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em]">{isApt ? "Tower/Lantai" : "RT/RW"}</th>'
);

// Replace form title
code = code.replace(
  'Edit Data Warga</>',
  'Edit Data {isApt ? "Penghuni" : "Warga"}</>'
);

code = code.replace(
  'Tambah Warga Baru</>',
  'Tambah {isApt ? "Penghuni" : "Warga"} Baru</>'
);

// Form Fields
code = code.replace(
  'RT KTP/Domisili <span className="text-red-500">*</span></label>',
  '{isApt ? "Tower" : "RT KTP/Domisili"} <span className="text-red-500">*</span></label>'
);

code = code.replace(
  'RW KTP/Domisili <span className="text-red-500">*</span></label>',
  '{isApt ? "Lantai" : "RW KTP/Domisili"} <span className="text-red-500">*</span></label>'
);

// Update Status wording in form 
// wait, WargaView doesn't seem to have Status Warga exactly, but let's do:
code = code.replace(
  '<option value="Warga Tetap">Warga Tetap (Milik Sendiri)</option>',
  '<option value="Warga Tetap">{isApt ? "Penghuni Tetap (Milik Sendiri)" : "Warga Tetap (Milik Sendiri)"}</option>'
);

code = code.replace(
  '<option value="Warga Kontrakan">Warga Kontrakan/Kost</option>',
  '<option value="Warga Kontrakan">{isApt ? "Penyewa / Kost" : "Warga Kontrakan/Kost"}</option>'
);

fs.writeFileSync('src/components/WargaView.tsx', code);
console.log('Modified WargaView.tsx');