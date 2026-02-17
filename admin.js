import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, remove, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const listUser = document.getElementById("listUser");

let semuaData = [];

/* ======================
   LOAD USER
====================== */
onValue(ref(db,"userList/"), snapshot=>{
  const data = snapshot.val() || {};
  listUser.innerHTML="";
  Object.entries(data)
    .sort((a,b)=>a[1].localeCompare(b[1]))
    .forEach(([key,nama])=>{
      listUser.innerHTML += `
        <li>
          ${nama}
          <button onclick="hapusUser('${key}')">Hapus</button>
        </li>
      `;
    });
});

/* ======================
   TAMBAH USER
====================== */
window.tambahUser = function(){
  const nama = document.getElementById("namaBaru").value.trim();
  if(!nama) return alert("Nama kosong");

  push(ref(db,"userList/"), nama);
  document.getElementById("namaBaru").value="";
}

/* ======================
   HAPUS USER
====================== */
window.hapusUser = function(key){
  if(confirm("Yakin hapus user?")){
    remove(ref(db,"userList/"+key));
  }
}

/* ======================
   LOAD ABSENSI
====================== */
onValue(ref(db,"absensi/"), snapshot=>{
  const data = snapshot.val() || {};

  semuaData = Object.entries(data).map(([key,val])=>{
    const tgl = new Date(val.waktu);
    return {
      id:key,
      nama:val.nama,
      tanggal:tgl,
      tanggalString:tgl.toISOString().split("T")[0],
      keterangan:val.keterangan || "Hadir"
    }
  })
  .sort((a,b)=>{
    if(a.tanggalString === b.tanggalString){
      return a.nama.localeCompare(b.nama);
    }
    return new Date(a.tanggal) - new Date(b.tanggal);
  });

  tampilkanData(semuaData);
});

/* ======================
   TAMPILKAN
====================== */
function tampilkanData(data){
  tabel.innerHTML="";
  data.forEach((d,i)=>{
    tabel.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${d.nama}</td>
        <td>${formatTanggal(d.tanggal)}</td>
        <td>${d.keterangan}</td>
        <td>
          <button onclick="hapusAbsensi('${d.id}')">Hapus</button>
        </td>
      </tr>
    `;
  });
}

/* ======================
   HAPUS ABSENSI
====================== */
window.hapusAbsensi = function(id){
  if(confirm("Yakin hapus absensi ini?")){
    remove(ref(db,"absensi/"+id));
  }
}

/* ======================
   FILTER
====================== */
window.filterData = function(){
  const nama = document.getElementById("searchNama").value.toLowerCase();
  const tanggal = document.getElementById("searchTanggal").value;
  const ket = document.getElementById("searchKeterangan").value;

  let filtered = semuaData.filter(d=>{
    return (
      (nama==="" || d.nama.toLowerCase().includes(nama)) &&
      (tanggal==="" || d.tanggalString===tanggal) &&
      (ket==="" || d.keterangan===ket)
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

/* ======================
   FORMAT TANGGAL
====================== */
function formatTanggal(date){
  return date.toLocaleDateString("id-ID",{
    day:"2-digit",
    month:"long",
    year:"numeric"
  });
}
