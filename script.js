import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC88eNtWMuOQ4eezVriirq_sjjVOkfl8K8",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const daftarRef = ref(db, "absensi/");
const daftarEl = document.getElementById("daftar");

let dataGlobal = {};
onValue(daftarRef, snapshot => {
  dataGlobal = snapshot.val() || {};
  tampilkanDaftar();
});

window.absen = function() {
  const namaInput = document.getElementById("nama");
  const kegiatanInput = document.getElementById("kegiatan");

  const nama = namaInput.value.trim();
  const kegiatan = kegiatanInput.value;

  if(!nama){
    alert("Nama wajib diisi");
    return;
  }

  const now = new Date();
  const bulanIni = now.getMonth();
  const tahunIni = now.getFullYear();

  // Hitung absensi user bulan ini
  let countThisMonth = 0;
  for(const key in dataGlobal){
    const p = dataGlobal[key];
    if(p.nama.toLowerCase() === nama.toLowerCase()){
      const t = new Date(p.waktu);
      if(t.getMonth() === bulanIni && t.getFullYear() === tahunIni){
        countThisMonth++;
      }
    }
  }

  if(countThisMonth >= 4){
    alert("Absensi bulan ini sudah mencapai 4 kali.");
    return;
  }

  // Simpan absensi baru
  const idNama = nama.toLowerCase() + "_" + Date.now();
  set(ref(db, "absensi/" + idNama), {
    nama,
    kegiatan,
    waktu: new Date().toISOString()
  });

  namaInput.value = "";
};

function tampilkanDaftar(){
  daftarEl.innerHTML = "";
  const arr = Object.values(dataGlobal).sort((a,b) => new Date(b.waktu)-new Date(a.waktu));
  arr.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.nama} | ${p.kegiatan} | ${new Date(p.waktu).toLocaleString()}`;
    daftarEl.appendChild(li);
  });
}
