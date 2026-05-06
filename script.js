import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');

// Use regex to remove functions. Be careful with brackets.
// Instead of regex, let's use the line numbers found by grep.
const lines = content.split('\n');

function deleteLines(startLine, endLine) {
    for (let i = startLine - 1; i < endLine; i++) {
        lines[i] = null;
    }
}

// Ensure the line contents match our expectation before deleting
const starts = {
    ConfirmModal: 4509,
    BukuTamuView: 4583,
    WargaView: 5274,
    IuranView: 6515,
    PPOBView: 7136,
    FinansialDashboardView: 7368,
    SuratView: 7420,
    KasView: 8281,
    VerifikasiAdminView: 9599,
    WargaProfileView: 10183
};

const ends = {
    ConfirmModal: 4582,
    BukuTamuView: 5273,
    WargaView: 6514,
    IuranView: 7135,
    PPOBView: 7367,
    FinansialDashboardView: 7419,
    SuratView: 8280,
    KasView: 9158,
    VerifikasiAdminView: 10182,
    WargaProfileView: 10867
};

for (const [name, start] of Object.entries(starts)) {
    const end = ends[name];
    console.log(`Deleting ${name} from ${start} to ${end}`);
    deleteLines(start, end);
}

const newContent = lines.filter(l => l !== null).join('\n');
fs.writeFileSync('src/App.tsx', newContent);
console.log('App.tsx updated');
