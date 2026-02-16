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
  const daftar = document.getElementById("daftar");

  onValue(daftarRef, (snapshot) => {
    const data = snapshot.val();
    daftar.innerHTML = ""; // reset daftar

    if (!data) return;

    // Urutkan data berdasarkan waktu (terbaru di atas)
    const sortedData = Object.values(data).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    sortedData.forEach((peserta) => {
      const li = document.createElement("li");
      li.textContent = `${peserta.nama} | ${peserta.kegiatan} | ${peserta.waktu}`;
      daftar.appendChild(li);
    });
  });
});
