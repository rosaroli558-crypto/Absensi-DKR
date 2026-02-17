import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase config
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

const daftar = document.getElementById("daftar");
const namaSelect = document.getElementById("nama");
const kegiatanSelect = document.getElementById("kegiatan");

// Ambil user list realtime
const userRef = ref(db,"userList/");
onValue(userRef, snapshot=>{
  const data = snapshot.val() || {};
  namaSelect.innerHTML="";
  Object.values(data).sort((a,b)=> a.localeCompare(b)).forEach(nama=>{
    const option = document.createElement("option");
    option.value = nama; option.textContent = nama;
    namaSelect.appendChild(option);
  });
});

// Fungsi absen
window.absen = ()=>{
  const nama = namaSelect.value;
  const kegiatan = kegiatanSelect.value;
  if(!nama){ alert("Pilih nama!"); return; }

  const id = `${nama}_${new Date().getTime()}`;
  set(ref(db,"absensi/"+id),{
    nama,
    kegiatan,
    waktu: new Date().toISOString()
  });
};

// Tampilkan 5 data terakhir
const absensiRef = ref(db,"absensi/");
onValue(absensiRef, snapshot=>{
  const data = snapshot.val() || {};
  let arr = Object.values(data).sort((a,b)=> new Date(b.waktu)-new Date(a.waktu));
  arr = arr.slice(0,5);
  daftar.innerHTML="";
  arr.forEach(p=>{
    const li = document.createElement("li");
    const date = new Date(p.waktu);
    li.textContent = `${p.nama} | ${p.kegiatan} | ${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;
    daftar.appendChild(li);
  });
});
