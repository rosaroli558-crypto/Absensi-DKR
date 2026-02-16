import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC88eNtWMuOQ4eezVriirq_sjjVOkfl8K8",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Kirim data
window.absen = function() {
  const nama = document.getElementById("nama").value;

  if (nama === "") {
    alert("Nama wajib diisi");
    return;
  }

  push(ref(db, "absensi/"), {
    nama: nama,
    waktu: new Date().toLocaleString()
  });

  document.getElementById("nama").value = "";
};

// Ambil & tampilkan data realtime
const daftarRef = ref(db, "absensi/");
onValue(daftarRef, (snapshot) => {
  const data = snapshot.val();
  const daftar = document.getElementById("daftar");
  daftar.innerHTML = "";

  for (let id in data) {
    const li = document.createElement("li");
    li.textContent = data[id].nama + " - " + data[id].waktu;
    daftar.appendChild(li);
  }
});
