import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// 🔹 Modal custom
const modal = document.createElement("div");
modal.style.cssText = `
  position: fixed; top:0; left:0; width:100%; height:100%;
  display:none; justify-content:center; align-items:center;
  background: rgba(0,0,0,0.5); z-index:1000;
`;
const box = document.createElement("div");
box.style.cssText = `
  background:white; padding:20px; border-radius:8px; min-width:250px; text-align:center;
`;
const modalText = document.createElement("p");
const okBtn = document.createElement("button");
okBtn.textContent = "OK";
okBtn.style.marginTop="10px";
box.appendChild(modalText);
box.appendChild(okBtn);
modal.appendChild(box);
document.body.appendChild(modal);

function showModal(msg){
  return new Promise(resolve=>{
    modalText.textContent = msg;
    modal.style.display="flex";
    okBtn.onclick = ()=> { modal.style.display="none"; resolve(true); };
  });
}

// 🔹 Ambil user list realtime & urut A→Z
onValue(ref(db,"userList/"), snapshot=>{
  const data = snapshot.val() || {};
  namaSelect.innerHTML="";
  Object.values(data).sort((a,b)=> a.localeCompare(b)).forEach(nama=>{
    const option = document.createElement("option");
    option.value = nama;
    option.textContent = nama;
    namaSelect.appendChild(option);
  });
});

// 🔹 Tampilkan 5 absensi terakhir
onValue(ref(db,"absensi/"), snapshot=>{
  const data = snapshot.val() || {};
  let arr = Object.values(data).sort((a,b)=> new Date(b.waktu)-new Date(a.waktu));
  arr = arr.slice(0,5);
  daftar.innerHTML="";
  arr.forEach(p=>{
    const date = new Date(p.waktu);
    const li = document.createElement("li");
    li.textContent = `${p.nama} | ${p.kegiatan} | ${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;
    daftar.appendChild(li);
  });
});

// 🔹 Fungsi absen dengan batas 4 per user per bulan
window.absen = async ()=>{
  const nama = namaSelect.value;
  const kegiatan = kegiatanSelect.value;
  if(!nama){ await showModal("Pilih nama!"); return; }

  const now = new Date();
  const bulan = now.getMonth();
  const tahun = now.getFullYear();

  // Ambil semua absensi
  const snapshot = await get(ref(db,"absensi/"));
  const data = snapshot.val() || {};
  let countThisMonth = 0;

  Object.values(data).forEach(p=>{
    const d = new Date(p.waktu);
    if(p.nama===nama && d.getMonth()===bulan && d.getFullYear()===tahun){
      countThisMonth++;
    }
  });

  if(countThisMonth >= 4){
    await showModal(`User "${nama}" sudah melakukan 4 absensi bulan ini!`);
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
