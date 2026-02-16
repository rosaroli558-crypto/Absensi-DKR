import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔹 Firebase Config
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

// 🔹 Elements
const daftarBody = document.getElementById("daftarAdmin");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");
const addUserBtn = document.getElementById("addUserBtn");
const newUserInput = document.getElementById("newUser");
const userListUl = document.getElementById("userList");

// 🔹 References
const absensiRef = ref(db,"absensi/");
const userRef = ref(db,"userList/");

// Tambah user
addUserBtn.addEventListener("click", ()=>{
  const nama = newUserInput.value.trim();
  if(!nama){ alert("Nama kosong"); return; }
  push(userRef, nama).then(()=> newUserInput.value="");
});

// Daftar user realtime, urut A-Z
onValue(userRef, snapshot=>{
  const data = snapshot.val() || {};
  userListUl.innerHTML = "";

  const sortedUsers = Object.entries(data).sort((a,b)=> a[1].localeCompare(b[1]));

  sortedUsers.forEach(([key,nama])=>{
    const li = document.createElement("li");
    li.textContent = nama;

    const btn = document.createElement("button");
    btn.textContent = "Hapus";
    btn.addEventListener("click", ()=>{
      showModal(`Hapus user "${nama}"?`, ()=> remove(ref(db,"userList/"+key)));
    });

    li.appendChild(btn);
    userListUl.appendChild(li);
  });
});

// Ambil data absensi realtime
let allData = {};
onValue(absensiRef, snapshot=>{
  allData = snapshot.val() || {};
  tampilkanDaftar();
});

// Filter bulan
bulanSelect.addEventListener("change", tampilkanDaftar);

// Fungsi tampilkan daftar
function tampilkanDaftar(){
  daftarBody.innerHTML="";
  let dataArray = Object.entries(allData).map(([id,p])=>({
    id, ...p, date:new Date(p.waktu)
  }));

  // Filter bulan
  const selBulan = bulanSelect.value;
  if(selBulan!=="all"){
    dataArray = dataArray.filter(p=>p.date.getMonth()===parseInt(selBulan));
  }

  // Urut terbaru
  dataArray.sort((a,b)=>b.date-a.date);

  // Total respons
  totalSpan.textContent = dataArray.length;

  // Render tabel
  dataArray.forEach(p=>{
    const tr = document.createElement("tr");

    // Warna baris sesuai status
    let bgColor="";
    switch(p.kegiatan){
      case "Hadir": bgColor="#d4edda"; break;
      case "Izin":
      case "Sakit": bgColor="#fff3cd"; break;
      case "Alfa": bgColor="#f8d7da"; break;
    }
    tr.style.backgroundColor = bgColor;

    tr.innerHTML=`
      <td>${p.nama}</td>
      <td>${p.kegiatan}</td>
      <td>${p.date.toLocaleDateString('id-ID')} ${p.date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</td>
      <td><button class="delete-btn">Hapus</button></td>
    `;

    // Hapus per absensi
    tr.querySelector(".delete-btn").addEventListener("click", ()=>{
      showModal(`Hapus absensi ${p.nama} | ${p.kegiatan}?`, ()=> remove(ref(db,"absensi/"+p.id)));
    });

    daftarBody.appendChild(tr);
  });
}

// 🔹 Modal Custom
function showModal(msg, callback){
  const modal = document.createElement("div");
  modal.style.position="fixed";
  modal.style.top="0";
  modal.style.left="0";
  modal.style.width="100%";
  modal.style.height="100%";
  modal.style.background="rgba(0,0,0,0.5)";
  modal.style.display="flex";
  modal.style.alignItems="center";
  modal.style.justifyContent="center";
  modal.style.zIndex="1000";

  const box = document.createElement("div");
  box.style.background="white";
  box.style.padding="20px";
  box.style.borderRadius="10px";
  box.style.textAlign="center";
  box.innerHTML=`<p>${msg}</p>`;

  const yesBtn = document.createElement("button");
  yesBtn.textContent="Ya";
  yesBtn.style.margin="10px";
  yesBtn.addEventListener("click", ()=>{
    callback();
    document.body.removeChild(modal);
  });

  const noBtn = document.createElement("button");
  noBtn.textContent="Batal";
  noBtn.style.margin="10px";
  noBtn.addEventListener("click", ()=> document.body.removeChild(modal));

  box.appendChild(yesBtn);
  box.appendChild(noBtn);
  modal.appendChild(box);
  document.body.appendChild(modal);
}
