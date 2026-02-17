import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// 🔹 Elements
const daftarBody = document.querySelector("#daftarAdmin tbody");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");
const addUserBtn = document.getElementById("addUserBtn");
const newUserInput = document.getElementById("newUser");
const userListUl = document.getElementById("userList");
const exportBtn = document.getElementById("exportExcel");

// 🔹 Modal custom
const modal = document.createElement("div");
modal.id = "modalConfirm";
modal.style.cssText = `
  position: fixed; top:0; left:0; width:100%; height:100%;
  display:none; justify-content:center; align-items:center;
  background: rgba(0,0,0,0.5); z-index:1000;
`;
const modalBox = document.createElement("div");
modalBox.style.cssText = `
  background:white; padding:20px; border-radius:8px; min-width:250px;
  text-align:center;
`;
const modalText = document.createElement("p");
const btnYes = document.createElement("button");
btnYes.textContent = "Ya";
btnYes.style.margin="5px";
const btnNo = document.createElement("button");
btnNo.textContent = "Batal";
btnNo.style.margin="5px";
modalBox.appendChild(modalText);
modalBox.appendChild(btnYes);
modalBox.appendChild(btnNo);
modal.appendChild(modalBox);
document.body.appendChild(modal);

function confirmModal(message){
  return new Promise(resolve=>{
    modalText.textContent = message;
    modal.style.display = "flex";
    btnYes.onclick = ()=> { modal.style.display="none"; resolve(true); };
    btnNo.onclick = ()=> { modal.style.display="none"; resolve(false); };
  });
}

// 🔹 Tambah user
addUserBtn.addEventListener("click", ()=>{
  const nama = newUserInput.value.trim();
  if(!nama){ alert("Nama kosong"); return; }
  push(ref(db,"userList/"), nama).then(()=> newUserInput.value="");
});

// 🔹 Daftar user realtime A→Z
onValue(ref(db,"userList/"), snapshot=>{
  const data = snapshot.val() || {};
  userListUl.innerHTML = "";
  Object.entries(data).sort((a,b)=>a[1].localeCompare(b[1])).forEach(async ([key,nama])=>{
    const li = document.createElement("li");
    li.textContent = nama + " ";
    const btn = document.createElement("button");
    btn.textContent = "Hapus";
    btn.addEventListener("click", async ()=>{
      if(await confirmModal(`Hapus user "${nama}"?`)) remove(ref(db,"userList/"+key));
    });
    li.appendChild(btn);
    userListUl.appendChild(li);
  });
});

// 🔹 Ambil data absensi realtime
let allData = {};
onValue(ref(db,"absensi/"), snapshot=>{
  allData = snapshot.val() || {};
  tampilkanDaftar();
});

// 🔹 Filter bulan
bulanSelect.addEventListener("change", tampilkanDaftar);

// 🔹 Fungsi tampilkan daftar & batas 4 absensi per user per bulan
function tampilkanDaftar(){
  daftarBody.innerHTML="";
  let dataArray = Object.entries(allData).map(([id,p])=>({id,...p,date:new Date(p.waktu)}));

  const selBulan = bulanSelect.value;
  if(selBulan!=="all"){
    dataArray = dataArray.filter(p=>p.date.getMonth()===parseInt(selBulan));
  }

  // Hitung absensi per user per bulan
  const countPerUser = {};
  dataArray.forEach(p=>{
    const key = `${p.nama}-${p.date.getMonth()}`;
    countPerUser[key] = (countPerUser[key]||0)+1;
  });

  // Total respons
  totalSpan.textContent = dataArray.length;

  // Urut terbaru
  dataArray.sort((a,b)=>b.date-a.date);

  // Render tabel
  dataArray.forEach(p=>{
    const key = `${p.nama}-${p.date.getMonth()}`;
    if(countPerUser[key]>4) return; // batasi 4 absensi per user per bulan

    const tr = document.createElement("tr");

    // Warna baris sesuai status
    let bgColor="";
    switch(p.kegiatan){
      case "Hadir": bgColor="#d4edda"; break;
      case "Izin": bgColor="#fff3cd"; break;
      case "Sakit": bgColor="#fff3cd"; break;
      case "Alfa": bgColor="#f8d7da"; break;
    }
    tr.style.backgroundColor = bgColor;

    // Nama
    const tdNama = document.createElement("td");
    tdNama.textContent = p.nama;

    // Kegiatan
    const tdKegiatan = document.createElement("td");
    tdKegiatan.textContent = p.kegiatan;

    // Waktu
    const tdWaktu = document.createElement("td");
    tdWaktu.textContent = `${p.date.toLocaleDateString('id-ID')} ${p.date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;

    // Aksi Hapus per entry
    const tdAksi = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Hapus";
    delBtn.addEventListener("click", async ()=>{
      if(await confirmModal(`Hapus absensi ${p.nama} | ${p.kegiatan}?`)) remove(ref(db,"absensi/"+p.id));
    });
    tdAksi.appendChild(delBtn);

    // Append td ke tr
    tr.appendChild(tdNama);
    tr.appendChild(tdKegiatan);
    tr.appendChild(tdWaktu);
    tr.appendChild(tdAksi);

    daftarBody.appendChild(tr);
  });
}

// 🔹 Ekspor ke Excel
exportBtn.addEventListener("click", ()=>{
  const rows = [["Nama","Kegiatan","Waktu"]];
  daftarBody.querySelectorAll("tr").forEach(tr=>{
    const tds = tr.querySelectorAll("td");
    rows.push([tds[0].textContent, tds[1].textContent, tds[2].textContent]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Absensi");
  XLSX.writeFile(wb, "Rekap_Absensi_DKR.xlsx");
});
