// =============================
// FIREBASE IMPORT
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// =============================
// FIREBASE CONFIG (DATA KAMU)
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyC88eNtWMuOQ4eezVriirq_sjjVOkfl8K8",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2",
  measurementId: "G-MYTKHS8FHM"
};

// =============================
// INIT FIREBASE
// =============================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =============================
// FORM HANDLER
// =============================
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formAbsensi");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama")?.value.trim();
    const tanggal = document.getElementById("tanggal")?.value;
    const keterangan = document.getElementById("keterangan")?.value.trim();

    if (!nama || !tanggal || !keterangan) {
      alert("Semua field wajib diisi!");
      return;
    }

    try {
      await push(ref(db, "absensi"), {
        nama,
        tanggal,
        keterangan,
        createdAt: Date.now()
      });

      alert("Absensi berhasil dikirim!");
      form.reset();

    } catch (error) {
      console.error("Gagal kirim data:", error);
      alert("Terjadi kesalahan. Coba lagi.");
    }
  });

});
