import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC88eNtWMuOQ4eezVriirq_sjjVOkfl8K8",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2"
};

// 🔥 Inisialisasi
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =======================================
// ✅ FUNGSI ABSEN
// =======================================
window.absen = function() {
  const namaInput = document.getElementById("nama");
  const kegiatanInput = document.getElementById("kegiatan");

  let nama = namaInput.value.trim();
  const kegiatan = kegiatanInput.value;

  if (!nama) {
    alert("Nama wajib diisi");
    return;
  }

  const idNama = nama.toLowerCase();

  set(ref(db, "absensi/" + idNama), {
    nama: nama,
    kegiatan: kegiatan,
    waktu: new Date().toLocaleString()
  });

  namaInput.value = "";
};

// =======================================
// ✅ TAMPILKAN DATA REALTIME
// =======================================
document.addEventListener("DOMContentLoaded", () => {
  const daftarRef = ref(db, "absensi/");
  const daftarBody = document.querySelector("#daftar tbody");

  onValue(daftarRef, (snapshot) => {
    const data = snapshot.val();
    daftarBody.innerHTML = ""; // reset tabel

    if (!data) return;

    const sortedData = Object.values(data).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    sortedData.forEach((peserta) => {
      const tr = document.createElement("tr");

      // warna baris berdasarkan status
      let bgColor = "";
      switch (peserta.kegiatan) {
        case "Hadir":
          bgColor = "#d4edda"; // hijau
          break;
        case "Izin":
          bgColor = "#fff3cd"; // kuning
          break;
        case "Sakit":
        case "Alfa":
          bgColor = "#f8d7da"; // merah
          break;
      }
      tr.style.backgroundColor = bgColor;

      tr.innerHTML = `
        <td>${peserta.nama}</td>
        <td>${peserta.kegiatan}</td>
        <td>${peserta.waktu}</td>
      `;

      daftarBody.appendChild(tr);
    });
  });
});
