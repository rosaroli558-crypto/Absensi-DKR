// =============================
// FIREBASE IMPORT
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  push, 
  onValue, 
  query, 
  limitToLast 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
// LOAD NAMA DARI DATABASE
// =============================
function loadUsers() {

  const selectNama = document.getElementById("nama");
  if (!selectNama) return;

  const userRef = ref(db, "users");

  onValue(userRef, (snapshot) => {

    selectNama.innerHTML = `<option value="">-- Pilih Nama --</option>`;

    if (!snapshot.exists()) {
      selectNama.innerHTML = `<option value="">Belum ada user</option>`;
      return;
    }

    snapshot.forEach(child => {
      const data = child.val();
      if (!data?.name) return;

      const option = document.createElement("option");
      option.value = data.name;
      option.textContent = data.name;

      selectNama.appendChild(option);
    });

  });
}

// =============================
// KIRIM ABSENSI
// =============================
function handleAbsen() {

  const nama = document.getElementById("nama")?.value;
  const kegiatan = document.getElementById("kegiatan")?.value;

  if (!nama) {
    alert("Silakan pilih nama terlebih dahulu.");
    return;
  }

  push(ref(db, "absensi"), {
    nama: nama,
    status: kegiatan,
    waktu: new Date().toLocaleString(),
    createdAt: Date.now()
  })
  .then(() => {
    alert("Absensi berhasil!");
  })
  .catch((error) => {
    console.error(error);
    alert("Gagal menyimpan data.");
  });
}

// =============================
// LOAD 5 DATA TERAKHIR
// =============================
function loadLastFive() {

  const list = document.getElementById("daftar");
  if (!list) return;

  const q = query(ref(db, "absensi"), limitToLast(5));

  onValue(q, (snapshot) => {

    list.innerHTML = "";

    if (!snapshot.exists()) {
      list.innerHTML = "<li>Belum ada data</li>";
      return;
    }

    const dataArr = [];

    snapshot.forEach(child => {
      dataArr.push(child.val());
    });

    dataArr.reverse();

    dataArr.forEach(data => {
      const li = document.createElement("li");
      li.textContent = `${data.nama} - ${data.status} (${data.waktu})`;
      list.appendChild(li);
    });

  });
}

// =============================
// INIT SAAT HALAMAN DIBUKA
// =============================
document.addEventListener("DOMContentLoaded", () => {

  loadUsers();
  loadLastFive();

  const btn = document.getElementById("btnAbsen");
  if (btn) {
    btn.addEventListener("click", handleAbsen);
  }

});
