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

onValue(ref(db, "absensi/"), snapshot => {
  dataGlobal = snapshot.val() || {};
  tampilkanRekap();
});

bulanSelect.addEventListener("change", tampilkanRekap);

function tampilkanRekap(){
  daftarBody.innerHTML = "";
  const selectedBulan = bulanSelect.value;

  let dataArray = Object.entries(dataGlobal).map(([id,p])=>({
    id,...p,date:new Date(p.waktu)
  }));

  if(selectedBulan!=="all"){
    dataArray = dataArray.filter(p=>p.date.getMonth()===parseInt(selectedBulan));
  }

  // Rekap per user
  const rekapPerUser = {};
  dataArray.forEach(p=>{
    if(!rekapPerUser[p.nama]){
      rekapPerUser[p.nama]={
        nama:p.nama,
        total:0,
        statusTerakhir:p.kegiatan,
        semuaKegiatan:[],
        semuaWaktu:[],
        ids:[]
      };
    }
    rekapPerUser[p.nama].total++;
    rekapPerUser[p.nama].statusTerakhir=p.kegiatan;
    rekapPerUser[p.nama].semuaKegiatan.push(p.kegiatan);
    rekapPerUser[p.nama].semuaWaktu.push(p.waktu);
    rekapPerUser[p.nama].ids.push(p.id);
  });

  const rekapArray = Object.values(rekapPerUser);
  totalSpan.textContent = rekapArray.length;

  rekapArray.forEach(user=>{
    const tr=document.createElement("tr");
    let bgColor="";
    switch(user.statusTerakhir){
      case "Hadir": bgColor="#d4edda";break;
      case "Izin": bgColor="#fff3cd";break;
      case "Sakit": bgColor="#fff3cd";break;
      case "Alfa": bgColor="#f8d7da";break;
    }
    tr.style.backgroundColor=bgColor;

    const semuaStatus=user.semuaKegiatan.join(", ");
    const semuaWaktu=user.semuaWaktu.join(", ");

    tr.innerHTML=`
      <td>${user.nama}</td>
      <td>${user.total} / 4</td>
      <td>${semuaStatus}</td>
      <td>${semuaWaktu}</td>
      <td><button class="delete-btn">Hapus</button></td>
    `;

    tr.querySelector(".delete-btn").onclick=()=>{
      user.ids.forEach(id=>remove(ref(db,"absensi/"+id)));
    };

    daftarBody.appendChild(tr);
  });
}
