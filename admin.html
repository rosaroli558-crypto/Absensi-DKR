import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const daftarBody = document.querySelector("#daftarAdmin tbody");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");
const searchInput = document.getElementById("searchInput");
const addUserBtn = document.getElementById("addUserBtn");
const newUserInput = document.getElementById("newUser");
const userListUl = document.getElementById("userList");
const exportBtn = document.getElementById("exportExcel");

let allData = {};

// ================= DATA ABSENSI =================
onValue(ref(db,"absensi/"), snapshot=>{
  allData = snapshot.val() || {};
  renderTable();
});

bulanSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

function renderTable(){
  daftarBody.innerHTML = "";

  let dataArray = Object.entries(allData).map(([id,p])=>({
    id,
    ...p,
    date:new Date(p.waktu)
  }));

  // FILTER BULAN
  if(bulanSelect.value !== "all"){
    dataArray = dataArray.filter(p =>
      p.date.getMonth() === parseInt(bulanSelect.value)
    );
  }

  // FILTER SEARCH
  const keyword = searchInput.value.toLowerCase().trim();

  if(keyword){
    dataArray = dataArray.filter(p=>{
      const tanggal = p.date.toLocaleDateString('id-ID');
      return (
        p.nama.toLowerCase().includes(keyword) ||
        p.kegiatan.toLowerCase().includes(keyword) ||
        tanggal.includes(keyword)
      );
    });
  }

  totalSpan.textContent = dataArray.length;

  dataArray.sort((a,b)=>b.date-a.date);

  dataArray.forEach(p=>{
    const tr = document.createElement("tr");

    switch(p.kegiatan){
      case "Hadir": tr.style.background="#d4edda"; break;
      case "Izin": tr.style.background="#fff3cd"; break;
      case "Sakit": tr.style.background="#fff3cd"; break;
      case "Alfa": tr.style.background="#f8d7da"; break;
    }

    tr.innerHTML = `
      <td>${p.nama}</td>
      <td>${p.kegiatan}</td>
      <td>${p.date.toLocaleDateString('id-ID')} ${p.date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</td>
      <td><button data-id="${p.id}">Hapus</button></td>
    `;

    tr.querySelector("button").onclick = ()=>{
      if(confirm("Hapus data ini?")){
        remove(ref(db,"absensi/"+p.id));
      }
    };

    daftarBody.appendChild(tr);
  });
}

// ================= USER =================
addUserBtn.onclick = ()=>{
  const nama = newUserInput.value.trim();
  if(!nama) return alert("Nama kosong!");
  push(ref(db,"userList/"), nama);
  newUserInput.value="";
};

onValue(ref(db,"userList/"), snapshot=>{
  const data = snapshot.val() || {};
  userListUl.innerHTML="";

  Object.entries(data)
    .sort((a,b)=>a[1].localeCompare(b[1]))
    .forEach(([key,nama])=>{
      const li = document.createElement("li");
      li.innerHTML = `${nama} <button data-key="${key}">Hapus</button>`;
      li.querySelector("button").onclick = ()=>{
        if(confirm("Hapus user?")){
          remove(ref(db,"userList/"+key));
        }
      };
      userListUl.appendChild(li);
    });
});

// ================= EXPORT =================
exportBtn.onclick = ()=>{
  const rows = [["Nama","Status","Waktu"]];

  daftarBody.querySelectorAll("tr").forEach(tr=>{
    const tds = tr.querySelectorAll("td");
    rows.push([
      tds[0].textContent,
      tds[1].textContent,
      tds[2].textContent
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Absensi");
  XLSX.writeFile(wb, "Rekap_Absensi_DKR.xlsx");
};
