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
// ✅ FUNGSI ABSEN (Tidak Bisa Dobel)
// =======================================
window.absen = function() {

  const namaInput = document.getElementById("nama");
  const kegiatanInput = document.getElementById("kegiatan");

  let nama = namaInput.value.trim();
  const kegiatan = kegiatanInput.value;

  if (nama === "") {
    alert("Nama wajib diisi");
    return;
  }

  // Supaya tidak case sensitive
  const idNama = nama.toLowerCase();

  // Simpan / Update data (bukan push)
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
const daftarRef = ref(db, "absensi/");

onValue(daftarRef, (snapshot) => {

  const data = snapshot.val();
  const daftar = document.getElementById("daftar");

  daftar.innerHTML = "";

  if (!data) return;

  for (let id in data) {
    const li = document.createElement("li");

    li.textContent =
      data[id].nama +
      " | " +
      data[id].kegiatan +
      " | " +
      data[id].waktu;

    daftar.appendChild(li);
  }

});
