import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Konfigurasi Firebase
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

const daftarRef = ref(db, "absensi/");

// Tampilkan data realtime
const daftar = document.getElementById("daftar");
onValue(daftarRef, snapshot => {
  const data = snapshot.val();
  daftar.innerHTML = "";
  if (!data) return;

  const dataArray = Object.values(data).sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

  dataArray.forEach(p => {
    const li = document.createElement("li");
    const waktu = new Date(p.waktu);
    const waktuDisplay = `${waktu.toLocaleDateString('id-ID')} ${waktu.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}`;
    li.textContent = `${p.nama} | ${p.kegiatan} | ${waktuDisplay}`;
    daftar.appendChild(li);
  });
});

// Fungsi absen
window.absen = function() {
  const namaInput = document.getElementById("nama");
  const kegiatanInput = document.getElementById("kegiatan");

  const nama = namaInput.value.trim();
  const kegiatan = kegiatanInput.value;
  if(!nama){ alert("Nama wajib diisi"); return; }

  // Hitung absensi user bulan ini
  const now = new Date();
  let count = 0;
  onValue(daftarRef, snapshot => {
    const data = snapshot.val() || {};
    Object.values(data).forEach(p => {
      const date = new Date(p.waktu);
      if(p.nama.toLowerCase()===nama.toLowerCase() &&
         date.getFullYear() === now.getFullYear() &&
         date.getMonth() === now.getMonth()){
           count++;
      }
    });
  }, {onlyOnce:true});

  setTimeout(()=>{
    if(count >= 4){
      alert("User sudah absen 4 kali bulan ini");
      return;
    }

    push(daftarRef, {
      nama: nama,
      kegiatan: kegiatan,
      waktu: now.toISOString()
    });

    namaInput.value = "";
  }, 100); // timeout untuk menunggu onValue selesai
};
