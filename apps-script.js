// Konfigurasi Header Sheet
// WARGA: A=NIK, B=No_KK, C=Nama, D=Hubungan_Keluarga, E=No_HP, F=Alamat, G=Status, H=Tanggal_Daftar
// IURAN: A=ID_Transaksi, B=Tanggal, C=NIK, D=Periode, E=Nominal
// KAS: A=ID_Transaksi, B=Tanggal, C=Tipe, D=Keterangan, E=Masuk, F=Keluar, G=Saldo_Akhir
// PENGATURAN: A=Kunci (Key), B=Nilai (Value), C=Deskripsi

// ==========================================
// FUNGSI HELPER: BACA PENGATURAN DB
// ==========================================
function getPengaturan(kunciData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPengaturan = ss.getSheetByName("Pengaturan");
  
  if (!sheetPengaturan) return null;
  
  var data = sheetPengaturan.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === String(kunciData).toUpperCase()) {
      return data[i][1];
    }
  }
  return null;
}

function doPost(e) {
  // 1. Menggunakan LockService untuk mencegah tabrakan data (Race Conditions)
  // Terutama sat beberapa warga/admin melakukan input di detik yang bersamaan
  var lock = LockService.getScriptLock();
  
  try {
    // Tunggu maksimal 10 detik jika ada proses lain yang sedang berjalan
    lock.waitLock(10000);
  } catch (err) {
    return respondError("Sistem sedang sibuk. Silakan coba lagi beberapa saat.");
  }

  try {
    // 2. Parsing Payload (Request dari Frontend React/Flutter)
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var data = body.data;

    // Mendapatkan Spreadsheet yang aktif (Tempat script ini dicopy-paste)
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ==========================================
    // AKSI 1: TAMBAH WARGA BARU
    // ==========================================
    if (action === "TAMBAH_WARGA") {
      var sheetWarga = ss.getSheetByName("Warga");
      if (!sheetWarga) return respondError("Sheet 'Warga' tidak ditemukan.");

      var nikBaru = String(data.nik);
      var dataWarga = sheetWarga.getDataRange().getValues();
      
      // Validasi: Cek Duplikasi NIK (Asumsi NIK berada di Kolom A / Index 0)
      for (var i = 1; i < dataWarga.length; i++) {
        if (String(dataWarga[i][0]) === nikBaru) {
          return respondError("Gagal! NIK " + nikBaru + " sudah terdaftar.");
        }
      }

      // Masukkan Data Baru
      sheetWarga.appendRow([
        nikBaru,
        data.no_kk,
        data.nama,
        data.hubungan_keluarga,
        data.no_hp,
        data.alamat,
        data.status,
        new Date() // Tanggal_Daftar Otomatis
      ]);

      return respondSuccess("Data warga berhasil ditambahkan.");
    }

    // ==========================================
    // AKSI: EDIT WARGA
    // ==========================================
    if (action === "EDIT_WARGA") {
      var sheetWarga = ss.getSheetByName("Warga");
      if (!sheetWarga) return respondError("Sheet 'Warga' tidak ditemukan.");

      var nikEdit = String(data.nik);
      var dataWarga = sheetWarga.getDataRange().getValues();
      var rowIndex = -1;
      
      for (var i = 1; i < dataWarga.length; i++) {
        if (String(dataWarga[i][0]) === nikEdit) {
          rowIndex = i + 1; // getValues 0-indexed, row sheet 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
         return respondError("Gagal! NIK " + nikEdit + " tidak ditemukan.");
      }

      sheetWarga.getRange(rowIndex, 2).setValue(data.no_kk);
      sheetWarga.getRange(rowIndex, 3).setValue(data.nama);
      sheetWarga.getRange(rowIndex, 4).setValue(data.hubungan_keluarga);
      sheetWarga.getRange(rowIndex, 5).setValue(data.no_hp);
      sheetWarga.getRange(rowIndex, 6).setValue(data.alamat);
      sheetWarga.getRange(rowIndex, 7).setValue(data.status);

      return respondSuccess("Data warga berhasil diperbarui.");
    }

    // ==========================================
    // AKSI: HAPUS WARGA
    // ==========================================
    if (action === "HAPUS_WARGA") {
      var sheetWarga = ss.getSheetByName("Warga");
      if (!sheetWarga) return respondError("Sheet 'Warga' tidak ditemukan.");

      var nikDelete = String(data.nik);
      var dataWarga = sheetWarga.getDataRange().getValues();
      var rowIndex = -1;
      
      for (var i = 1; i < dataWarga.length; i++) {
        if (String(dataWarga[i][0]) === nikDelete) {
          rowIndex = i + 1; // getValues 0-indexed, row sheet 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
         return respondError("Gagal! NIK " + nikDelete + " tidak ditemukan.");
      }

      sheetWarga.deleteRow(rowIndex);
      return respondSuccess("Data warga berhasil dihapus.");
    }

    // ==========================================
    // AKSI: INPUT IURAN TRANSAKSI
    // ==========================================
    if (action === "INPUT_IURAN") {
      var sheetIuran = ss.getSheetByName("Iuran");
      var sheetKas = ss.getSheetByName("Dashboard_Kas");

      if (!sheetIuran || !sheetKas) return respondError("Sheet 'Iuran' atau 'Dashboard_Kas' tidak ditemukan.");

      var nominal = Number(data.nominal) || Number(getPengaturan("NOMINAL_IURAN")) || 50000;
      var idTransaksi = "TRX-" + new Date().getTime(); // Generate ID unik
      var tanggal = new Date();

      // [A] Catat ke Sheet Iuran
      sheetIuran.appendRow([
        idTransaksi,
        tanggal,
        data.nik,
        data.periode,
        nominal
      ]);

      // [B] Catat / Otomatisasi Hitung ke Sheet Kas
      var lastRowKas = sheetKas.getLastRow();
      var saldoSebelumnya = 0;

      // Ambil Saldo Akhir baris terakhir untuk kalkulasi (Asumsi Saldo ada di kolom G / index 7)
      if (lastRowKas > 1) { 
         saldoSebelumnya = Number(sheetKas.getRange(lastRowKas, 7).getValue()) || 0;
      }

      var saldoBaru = saldoSebelumnya + nominal;

      sheetKas.appendRow([
        idTransaksi,
        tanggal,
        "Pemasukan",
        "Pembayaran Iuran NIK: " + data.nik + " (Periode " + data.periode + ")",
        nominal,     // Uang Masuk
        0,           // Uang Keluar
        saldoBaru    // Kalkulasi Update Saldo Kas Terbaru
      ]);

      return respondSuccess("Iuran berhasil dicatat dan Kas RT otomatis bertambah Rp " + nominal);
    }

    // Jika Aksi tidak dikenali
    return respondError("Action Api tidak ditemukan!");

  } catch (err) {
    // Tangani error sistem
    return respondError("Terjadi Kesalahan Server: " + err.message);
  } finally {
    // 3. Wajib melepas Lock agar bisa memproses antrian request berikutnya
    lock.releaseLock();
  }
}

// ==========================================
// FUNGSI HELPER: FORMAT RESPONSE JSON
// ==========================================
function respondSuccess(message, data) {
  var output = {
    status: "success",
    message: message,
    data: data || null
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function respondError(message) {
  var output = {
    status: "error",
    message: message
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// FUNGSI AUTOMASI: REMINDER WA (TANGGAL 5)
// ==========================================
function prosesKirimReminderWA() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetWarga = ss.getSheetByName("Warga");
  var sheetIuran = ss.getSheetByName("Iuran");
  
  // Ambil pengaturan dinamis
  var isAutomasiWA = getPengaturan("AKTIFKAN_AUTOMASI") !== "FALSE";
  var nominalIuranTetap = getPengaturan("NOMINAL_IURAN") || 50000;
  var tokenWA = getPengaturan("TOKEN_WA") || "TOKEN_API_WHATSAPP_ANDA";
  var namaRT = getPengaturan("NAMA_RT") || "Sistem RT";
  
  // Jika automasi dinonaktifkan via Settings, batalkan aksi.
  if(!isAutomasiWA) {
    Logger.log("Automasi dinonaktifkan di Pengaturan.");
    return;
  }

  // Kita buat sheet baru khusus untuk tracking log agar tidak terkirim ganda
  var sheetLog = ss.getSheetByName("Log_Notifikasi"); 
  if (!sheetLog) {
    sheetLog = ss.insertSheet("Log_Notifikasi");
    sheetLog.appendRow(["Timestamp", "NIK", "Periode", "Status"]); // Setup Header
  }

  var dataWarga = sheetWarga.getDataRange().getValues();
  var dataIuran = sheetIuran.getDataRange().getValues();
  var dataLog = sheetLog.getDataRange().getValues();

  // Tentukan periode saat ini (format: "04-2026")
  var hariIni = new Date();
  var periodeSekarang = Utilities.formatDate(hariIni, Session.getScriptTimeZone(), "MM-yyyy");

  // 1. Kumpulkan daftar NIK yang SUDAH membayar pada bulan ini
  var nikSudahBayar = [];
  for (var i = 1; i < dataIuran.length; i++) {
    var nikIuran = String(dataIuran[i][2]);
    var periodeIuran = String(dataIuran[i][3]); // Asumsi kolom periode berformat MM-yyyy
    if (periodeIuran === periodeSekarang) {
      nikSudahBayar.push(nikIuran);
    }
  }

  // 2. Kumpulkan daftar NIK-Periode yang SUDAH dikirimi pesan agar tidak ganda
  var logReminderSent = [];
  for (var j = 1; j < dataLog.length; j++) {
    var nikLog = String(dataLog[j][1]);
    var periodeLog = String(dataLog[j][2]);
    logReminderSent.push(nikLog + "_" + periodeLog);
  }

  // 3. Periksa seluruh warga
  for (var w = 1; w < dataWarga.length; w++) {
    var nik = String(dataWarga[w][0]);
    var noKk = String(dataWarga[w][1]); // Kolom B adalah No_KK
    var nama = dataWarga[w][2];
    var hubKeluarga = dataWarga[w][3];
    var noHp = String(dataWarga[w][4]);
    
    // Abaikan baris kosong header
    if(!nik || nik === "NIK") continue;

    // Abaikan jika NIK sudah ada di daftar 'sudah bayar'
    if (nikSudahBayar.indexOf(nik) !== -1) continue;

    // Abaikan jika NIK bulan ini sudah dikirimi WA
    var keyLog = nik + "_" + periodeSekarang;
    if (logReminderSent.indexOf(keyLog) !== -1) continue;

    // Menarik Text Template dari Settings dan ubah wildcard {nama}
    var rawText = getPengaturan("TEMPLATE_PESAN") || "Halo Bpk/Ibu {nama}, ini adalah pengingat otomatis dari {nama_rt}. Iuran Bulanan sebesar Rp {nominal} untuk periode {periode} belum tercatat. Mohon konfirmasinya. Terima kasih!";
    var pesanKirim = rawText.replace("{nama}", nama)
                            .replace("{nama_rt}", namaRT)
                            .replace("{nominal}", nominalIuranTetap)
                            .replace("{periode}", periodeSekarang);

    // Siapkan Payload untuk Endpoint API WhatsApp Gateway
    var waPayload = {
      "target": noHp,
      "message": pesanKirim
    };

    // --- EKSEKUSI PENGIRIMAN KE API WA GATEWAY (Contoh pakai Fonnte / Wablas) ---
    /*
    try {
      var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(waPayload),
        "headers": {
          "Authorization": "Bearer " + tokenWA
        }
      };
      
      var responseMsg = UrlFetchApp.fetch("https://api.wagateway.com/send", options);
      Logger.log("Pesan WA terkirim ke " + nama);
      
      // 4. Update Sheet Log Notifikasi dengan mark 'Reminder_Sent' SAAT BERHASIL
      sheetLog.appendRow([new Date(), nik, periodeSekarang, "Reminder_Sent"]);

    } catch (error) {
      Logger.log("Gagal mengirim WA ke " + nama + " (" + error.message + ")");
    }
    */
    
    // UNTUK TESTING / TANPA API AKTIF: Langsung catat ke LOG agar simulasi berjalan
    sheetLog.appendRow([new Date(), nik, periodeSekarang, "Reminder_Sent"]);
  }
}

// ==========================================
// FUNGSI TRIGGER OTOMATIS: Dijalankan 1x saja
// ==========================================
function setupTriggerTanggal5() {
  // Menghapus trigger lama agar tidak menumpuk
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "prosesKirimReminderWA") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Membuat jadwal otomatis setiap tanggal 5 jam 9 pagi
  ScriptApp.newTrigger("prosesKirimReminderWA")
    .timeBased()
    .onMonthDay(5)
    .atHour(9)
    .create();
}
