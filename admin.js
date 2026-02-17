import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ===============================
   🔹 FIREBASE CONFIG
================================= */
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

/* ===============================
   🔹 ELEMENTS
================================= */
const daftarBody = document.querySelector("#daftarAdmin tbody");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");
const addUserBtn = document.getElementById("addUserBtn");
const newUserInput = document.getElementById("newUser");
const userListUl = document.getElementById("userList");
const exportBtn = document.getElementById("exportExcel");

/* ===============================
   🔹 MODAL KONFIRMASI
================================= */
const modal = document.createElement("div");
modal.style.cssText = `
  position:fixed; top:0; left:0; width:100%; height:100%;
  display:none; justify-content:center; align-items:center;
  background:rgba(0,0,0,0.5); z-index:9999;
`;

const modalBox = document.createElement("div");
modalBox.style.cssText = `
  background:white; padding:20px; border-radius:8px;
  min-width:260px; text-align:center;
`;

const modalText = document.createElement("p");

const btnYes = document.createElement("button");
btnYes.textContent = "Ya";
btnYes.style.margin = "5px";

const btnNo = document.createElement("button");
btnNo.textContent = "Batal";
btnNo.style.margin = "5px";

modalBox.appendChild(modalText);
modalBox.appendChild(btnYes);
modalBox.appendChild(btnNo);
modal.appendChild(modalBox);
document.body.appendChild(modal);

function confirmModal(message){
  return new Promise(resolve=>{
    modalText.textContent = message;
    modal.style.display = "flex";
    btnYes.onclick = ()=>{ modal.style.display="none"; resolve(true); };
    btnNo.onclick = ()=>{ modal.style.display="none"; resolve(false); };
  });
}

/* ===============================
   🔹 TAMBAH USER
================================= */
addUserBtn.addEventListener("click", ()=>{
  const nama = newUserInput.value.trim();
  if(!nama){
    alert("Nama tidak boleh kosong!");
    return;
  }

  push(ref(db,"userList/"), nama)
    .then(()=> newUserInput.value="")
    .catch(err=> alert("Gagal tambah user: "+err.message));
});

/* ===============================
   🔹 LIST USER REALTIME A-Z
================================= */
onValue(ref(db,"userList/"), snapshot=>{
  const data = snapshot.val() || {};
  userListUl.innerHTML = "";

  Object.entries(data)
    .sort((a,b)=>a[1].localeCompare(b[1]))
    .forEach(([key,nama])=>{

      const li = document.createElement("li");
      li.textContent = nama + " ";

      const btn = document.createElement("button");
      btn.textContent = "Hapus";

      btn.onclick = async ()=>{
        if(await confirmModal(`Hapus user "${nama}"?`)){
          remove(ref(db,"userList/"+key));
        }
      };

      li.appendChild(btn);
      userListUl.appendChild(li);
    });
});

/* ===============================
   🔹 DATA ABSENSI REALTIME
================================= */
let allData = {};

onValue(ref(db,"absensi/"), snapshot=>{
  allData = snapshot.val() || {};
  renderTable();
});

bulanSelect.addEventListener("change", renderTable);

/* ===============================
   🔹 RENDER TABLE (TANPA LIMIT)
================================= */
function renderTable(){

  daftarBody.innerHTML = "";

  let dataArray = Object.entries(allData).map(([id,p])=>({
    id,
    ...p,
    date: new Date(p.waktu)
  }));

  const selectedMonth = bulanSelect.value;

  if(selectedMonth !== "all"){
    dataArray = dataArray.filter(p =>
      p.date.getMonth() === parseInt(selectedMonth)
    );
  }

  // total respons
  totalSpan.textContent = dataArray.length;

  // urut terbaru
  dataArray.sort((a,b)=> b.date - a.date);

  dataArray.forEach(p=>{

    const tr = document.createElement("tr");

    // warna status
    switch(p.kegiatan){
      case "Hadir": tr.style.backgroundColor="#d4edda"; break;
      case "Izin": tr.style.backgroundColor="#fff3cd"; break;
      case "Sakit": tr.style.backgroundColor="#fff3cd"; break;
      case "Alfa": tr.style.backgroundColor="#f8d7da"; break;
    }

    const tdNama = document.createElement("td");
    tdNama.textContent = p.nama;

    const tdKegiatan = document.createElement("td");
    tdKegiatan.textContent = p.kegiatan;

    const tdWaktu = document.createElement("td");
    tdWaktu.textContent =
      `${p.date.toLocaleDateString('id-ID')} ` +
      `${p.date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;

    const tdAksi = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Hapus";

    delBtn.onclick = async ()=>{
      if(await confirmModal(`Hapus absensi ${p.nama} | ${p.kegiatan}?`)){
        remove(ref(db,"absensi/"+p.id));
      }
    };

    tdAksi.appendChild(delBtn);

    tr.appendChild(tdNama);
    tr.appendChild(tdKegiatan);
    tr.appendChild(tdWaktu);
    tr.appendChild(tdAksi);

    daftarBody.appendChild(tr);
  });
}

/* ===============================
   🔹 EXPORT EXCEL
================================= */
exportBtn.addEventListener("click", ()=>{
  const rows = [["Nama","Kegiatan","Waktu"]];

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
});
