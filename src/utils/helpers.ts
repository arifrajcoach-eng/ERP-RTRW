export const calculateAge = (tglLahir: string) => {
  if (!tglLahir) return "-";
  const birthDate = new Date(tglLahir);
  if (isNaN(birthDate.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const calculateAgeMonths = (tglLahir: string) => {
  if (!tglLahir) return 0;
  const birthDate = new Date(tglLahir);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  return (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
};

export const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka);
};

export const formatTgl = (tgl: string) => {
  if (!tgl) return "-";
  const date = new Date(tgl);
  if (isNaN(date.getTime())) return tgl;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};
