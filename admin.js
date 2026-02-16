import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const daftarRef = ref(db,"absensi/");
const userRef = ref(db,"userList/");
const daftarBody = document.getElementById("daftarAdmin");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");
const addUserBtn = document.getElementById("addUserBtn");
const newUserInput = document.getElementById("newUser");

// Tambah nama user ke userList
addUserBtn.onclick = ()=>{
  const nama = newUserInput.value.trim();
  if(!nama){ alert("Nama kosong"); return; }
  push(userRef, nama);
  newUserInput.value = "";
};

// Ambil semua absensi realtime
let data = {};
onValue(daftarRef,snapshot=>{
  data = snapshot.val()||{};
  tampilkanDaftar();
});

// Filter bulan
bulanSelect.addEventListener("change", tampilkanDaftar);

function tampilkanDaftar(){
  daftarBody.innerHTML="";
  let dataArray = Object.entries(data).map(([id, p])=>({id,...p, date:new Date(p.waktu)}));

  // Filter bulan
  const selBulan = bulanSelect.value;
  if(selBulan!=="all"){
    dataArray = dataArray.filter(p=>p.date.getMonth()===parseInt(selBulan));
  }

  // Urut terbaru di atas
  dataArray.sort((a,b)=>b.date-a.date);

  // Hitung total
  totalSpan.textContent = dataArray.length;

  // Tampilkan
  dataArray.forEach(p=>{
    const tr = document.createElement("tr");

    // warna baris sesuai status
    let bgColor="";
    switch(p.kegiatan){
      case "Hadir": bgColor="#d4edda"; break;
      case "Izin": bgColor="#fff3cd"; break;
      case "Sakit": bgColor="#fff3cd"; break;
      case "Alfa": bgColor="#f8d7da"; break;
    }
    tr.style.backgroundColor=bgColor;

    tr.innerHTML=`
      <td>${p.nama}</td>
      <td>${p.kegiatan}</td>
      <td>${new Date(p.waktu).toLocaleDateString('id-ID')} ${new Date(p.waktu).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</td>
      <td><button class="delete-btn">Hapus</button></td>
    `;

    tr.querySelector(".delete-btn").onclick = ()=>{
      remove(ref(db,"absensi/"+p.id));
    };

    daftarBody.appendChild(tr);
  });
}
