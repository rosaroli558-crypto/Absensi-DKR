import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const tabel = document.getElementById("tabelData");

let semuaData = [];

/* ==============================
   LOAD DATA
================================ */
onValue(ref(db,"absensi/"), snapshot=>{
  const data = snapshot.val() || {};

  semuaData = Object.values(data)
    .map(item=>{
      const tgl = new Date(item.waktu);
      return {
        nama: item.nama,
        tanggal: tgl,
        tanggalString: tgl.toISOString().split("T")[0],
        keterangan: item.keterangan || item.kegiatan || "Hadir"
      }
    })
    // Urutkan berdasarkan tanggal sama lalu nama A-Z
    .sort((a,b)=>{
      if(a.tanggalString === b.tanggalString){
        return a.nama.localeCompare(b.nama);
      }
      return new Date(a.tanggal) - new Date(b.tanggal);
    });

  tampilkanData(semuaData);
});

/* ==============================
   TAMPILKAN DATA
================================ */
function tampilkanData(data){
  tabel.innerHTML="";
  data.forEach((d,i)=>{
    const row = `
      <tr>
        <td>${i+1}</td>
        <td>${d.nama}</td>
        <td>${formatTanggal(d.tanggal)}</td>
        <td>${d.keterangan}</td>
      </tr>
    `;
    tabel.innerHTML += row;
  });
}

/* ==============================
   FILTER
================================ */
window.filterData = function(){
  const nama = document.getElementById("searchNama").value.toLowerCase();
  const tanggal = document.getElementById("searchTanggal").value;
  const ket = document.getElementById("searchKeterangan").value;

  let filtered = semuaData.filter(d=>{
    return (
      (nama === "" || d.nama.toLowerCase().includes(nama)) &&
      (tanggal === "" || d.tanggalString === tanggal) &&
      (ket === "" || d.keterangan === ket)
    );
  });

  tampilkanData(filtered);
}

window.resetFilter = function(){
  document.getElementById("searchNama").value="";
  document.getElementById("searchTanggal").value="";
  document.getElementById("searchKeterangan").value="";
  tampilkanData(semuaData);
}

/* ==============================
   FORMAT TANGGAL
================================ */
function formatTanggal(date){
  return date.toLocaleDateString("id-ID",{
    day:"2-digit",
    month:"long",
    year:"numeric"
  });
}

/* ==============================
   EXPORT (Placeholder)
================================ */
window.exportExcel = function(){
  alert("Fitur export Excel bisa kita sambungkan ke backend Python.");
}
