import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔹 Firebase config
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
    option.value = nama;
    option.textContent = nama;
    namaSelect.appendChild(option);
  });
});

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

// 🔹 Fungsi absen dengan batas 4 per user per bulan
window.absen = async ()=>{
  const nama = namaSelect.value;
  const kegiatan = kegiatanSelect.value;
  if(!nama){ alert("Pilih nama!"); return; }

  const now = new Date();
  const bulan = now.getMonth();
  const tahun = now.getFullYear();

  // Ambil semua absensi user bulan ini
  const snapshot = await get(absensiRef);
  const data = snapshot.val() || {};
  let countThisMonth = 0;

  Object.values(data).forEach(p=>{
    const d = new Date(p.waktu);
    if(p.nama===nama && d.getMonth()===bulan && d.getFullYear()===tahun){
      countThisMonth++;
    }
  });

  if(countThisMonth >= 4){
  showModal(`User "${nama}" Ciee Rajin Absen! Semoga Bulan Depan Rajin Lagi Yaa!!!`);
  return;
}
  // Simpan absensi baru
  const id = `${nama}_${now.getTime()}`;
  set(ref(db,"absensi/"+id),{
    nama,
    kegiatan,
    waktu: now.toISOString()
  });
};
