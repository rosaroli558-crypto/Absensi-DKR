// =============================
// FIREBASE IMPORT
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// =============================
// FIREBASE CONFIG
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
// DAFTAR NAMA (ISI SESUAI ANGGOTA)
// =============================
const daftarNama = [
  "Ahmad",
  "Budi",
  "Citra",
  "Dina",
  "Eko"
];

// =============================
// LOAD NAMA KE SELECT
// =============================
document.addEventListener("DOMContentLoaded", () => {

  const selectNama = document.getElementById("nama");
  if (!selectNama) return;

  selectNama.innerHTML = `<option value="">-- Pilih Nama --</option>`;

  daftarNama.forEach(nama => {
    const option = document.createElement("option");
    option.value = nama;
    option.textContent = nama;
    selectNama.appendChild(option);
  });

  loadDaftarTerakhir();
});

// =============================
// FUNGSI ABSEN (GLOBAL)
// =============================
window.absen = async function () {

  const nama = document.getElementById("nama")?.value;
  const kegiatan = document.getElementById("kegiatan")?.value;

  if (!nama) {
    alert("Pilih nama dulu!");
    return;
  }

  try {
    await push(ref(db, "absensi"), {
      nama: nama,
      status: kegiatan,
      waktu: new Date().toLocaleString(),
      createdAt: Date.now()
    });

    alert("Absensi berhasil!");

  } catch (error) {
    console.error(error);
    alert("Gagal menyimpan data.");
  }
};

// =============================
// LOAD 5 DATA TERAKHIR
// =============================
function loadDaftarTerakhir() {

  const list = document.getElementById("daftar");
  if (!list) return;

  const q = query(ref(db, "absensi"), limitToLast(5));

  onValue(q, (snapshot) => {

    list.innerHTML = "";

    if (!snapshot.exists()) {
      list.innerHTML = "<li>Belum ada data</li>";
      return;
    }

    const dataArray = [];

    snapshot.forEach(child => {
      dataArray.push(child.val());
    });

    // Urutkan terbaru di atas
    dataArray.reverse();

    dataArray.forEach(data => {
      const li = document.createElement("li");
      li.textContent = `${data.nama} - ${data.status} (${data.waktu})`;
      list.appendChild(li);
    });

  });
}
