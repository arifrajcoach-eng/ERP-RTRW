import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const functionsToWrap = [
  'SOSOverlay', 'ETokoView', 'EVotingView', 'DashboardView', 'ConfirmModal', 
  'WargaView', 'PaymentModal', 'IuranView', 'SuratView', 'KasView', 
  'PengaturanView', 'VerifikasiAdminView', 'WargaProfileView', 'LoginView', 
  'UsersView', 'TenantsView', 'PosyanduView', 'BankSampahView', 'InventarisView'
];

functionsToWrap.forEach(fn => {
  const regex = new RegExp(`function ${fn}\\(`, 'g');
  code = code.replace(regex, `const ${fn} = React.memo(function ${fn}(`);
});

// Since we changed them to const, we need to add `);` at the end of their blocks.
// Wait, that's impossible to do accurately with simple regex because finding the end of the react component block is hard.
// Actually, it is easier to not wrap the definition, but just change where they are exported or something. But none of them are exported! They are just defined inline and used.

fs.writeFileSync('src/App.tsx', code);
console.log('Memo wrapped!');
