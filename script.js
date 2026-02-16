import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const namaSelect = document.getElementById("nama");
const kegiatanSelect = document.getElementById("kegiatan");
const daftar = document.getElementById("daftar");

// Ambil nama user realtime
const userRef = ref(db,"userList/");
onValue(userRef, snapshot=>{
  const data = snapshot.val() || {};
  namaSelect.innerHTML = '<option value="">Pilih Nama</option>';
  Object.values(data).forEach(nama=>{
    const opt = document.createElement("option");
    opt.value = nama;
    opt.textContent = nama;
    namaSelect.appendChild(opt);
  });
});

// Ambil data absensi realtime
const absensiRef = ref(db,"absensi/");
let allData = {};
onValue(absensiRef, snapshot=>{
  allData = snapshot.val() || {};
  tampilkanDaftar();
});

// Fungsi absen (limit 4 per bulan per user)
window.absen = function(){
  const nama = namaSelect.value;
  const kegiatan = kegiatanSelect.value;
  if(!nama){ alert("Pilih nama"); return; }

  const sekarang = new Date();
  const bulanIni = sekarang.getMonth();
  const tahunIni = sekarang.getFullYear();

  // Hitung jumlah absensi user di bulan ini
  const userAbsensi = Object.values(allData).filter(a=>{
    const dt = new Date(a.waktu);
    return a.nama===nama && dt.getMonth()===bulanIni && dt.getFullYear()===tahunIni;
  });

  if(userAbsensi.length>=4){
    alert("User sudah melakukan 4 absensi bulan ini");
    return;
  }

  // Simpan
  const key = push(ref(db,"absensi/")).key;
  set(ref(db,"absensi/"+key),{
    nama, kegiatan, waktu: sekarang.toISOString()
  });
};

// Tampilkan daftar 5 terakhir
function tampilkanDaftar(){
  daftar.innerHTML="";
  let arr = Object.values(allData).sort((a,b)=>new Date(b.waktu)-new Date(a.waktu));
  arr = arr.slice(0,5);
  arr.forEach(a=>{
    const li = document.createElement("li");
    const dt = new Date(a.waktu);
    li.textContent = `${a.nama} | ${a.kegiatan} | ${dt.toLocaleDateString('id-ID')} ${dt.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;
    daftar.appendChild(li);
  });
}
