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

const daftarRef = ref(db, "absensi/");
const daftarNamaRef = ref(db, "userList/");
const daftar = document.getElementById("daftar");
const namaSelect = document.getElementById("nama");

// Ambil daftar nama dari Firebase
onValue(daftarNamaRef, snapshot=>{
  const data = snapshot.val() || {};
  namaSelect.innerHTML = '<option value="">Pilih Nama</option>';
  Object.keys(data).forEach(key=>{
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = data[key];
    namaSelect.appendChild(opt);
  });
});

// Tampilkan 5 data terakhir
onValue(daftarRef, snapshot=>{
  const data = snapshot.val();
  daftar.innerHTML = "";
  if(!data) return;

  let dataArray = Object.values(data).sort((a,b)=>new Date(b.waktu)-new Date(a.waktu));
  dataArray = dataArray.slice(0,5);

  dataArray.forEach(p=>{
    const li = document.createElement("li");
    const waktu = new Date(p.waktu);
    const waktuDisplay = `${waktu.toLocaleDateString('id-ID')} ${waktu.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;
    li.textContent = `${p.nama} | ${p.kegiatan} | ${waktuDisplay}`;
    daftar.appendChild(li);
  });
});

// Fungsi absen
window.absen = function(){
  const nama = namaSelect.value;
  const kegiatanInput = document.getElementById("kegiatan");
  const kegiatan = kegiatanInput.value;

  if(!nama){ alert("Pilih nama dulu"); return; }

  const now = new Date();
  let count = 0;

  onValue(daftarRef, snapshot=>{
    const data = snapshot.val() || {};
    Object.values(data).forEach(p=>{
      const date = new Date(p.waktu);
      if(p.nama === nama &&
         date.getFullYear()===now.getFullYear() &&
         date.getMonth()===now.getMonth()){
           count++;
      }
    });
  }, {onlyOnce:true});

  setTimeout(()=>{
    if(count>=4){
      alert("User sudah absen 4 kali bulan ini");
      return;
    }
    push(daftarRef,{
      nama: nama,
      kegiatan: kegiatan,
      waktu: now.toISOString()
    });
  },100);
};
