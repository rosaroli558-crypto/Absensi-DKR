import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const daftarBody = document.querySelector("#daftarAdmin tbody");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");

let dataGlobal = {};

onValue(ref(db,"absensi/"), snapshot => {
  dataGlobal = snapshot.val() || {};
  tampilkanRekap();
});

bulanSelect.addEventListener("change", tampilkanRekap);

function tampilkanRekap(){
  daftarBody.innerHTML = "";
  const selectedBulan = bulanSelect.value;

  let dataArray = Object.entries(dataGlobal).map(([id,p]) => ({
    id, ...p, date:new Date(p.waktu)
  }));

  if(selectedBulan !== "all"){
    dataArray = dataArray.filter(p=>p.date.getMonth()===parseInt(selectedBulan));
  }

  totalSpan.textContent = dataArray.length;

  dataArray.sort((a,b)=>b.date - a.date);

  dataArray.forEach(p=>{
    const tr = document.createElement("tr");

    let bgColor="";
    switch(p.kegiatan){
      case "Hadir": bgColor="#d4edda"; break;
      case "Izin": bgColor="#fff3cd"; break;
      case "Sakit": bgColor="#fff3cd"; break;
      case "Alfa": bgColor="#f8d7da"; break;
    }
    tr.style.backgroundColor = bgColor;

    const tgl = p.date.toLocaleDateString('id-ID');
    const jam = p.date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    const waktuDisplay = `${tgl} ${jam}`;

    tr.innerHTML = `
      <td>${p.nama}</td>
      <td>${p.kegiatan}</td>
      <td>${waktuDisplay}</td>
      <td><button class="delete-btn">Hapus</button></td>
    `;

    tr.querySelector(".delete-btn").onclick = () => {
      remove(ref(db,"absensi/"+p.id));
    };

    daftarBody.appendChild(tr);
  });
}
