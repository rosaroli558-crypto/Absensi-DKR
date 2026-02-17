import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const daftar = document.getElementById("daftar");
const namaSelect = document.getElementById("nama");
const kegiatanSelect = document.getElementById("kegiatan");

/* ===============================
   🔹 MODAL SEDERHANA
================================= */
function showAlert(message){
  alert(message);
}

/* ===============================
   🔹 LOAD USER LIST A-Z
================================= */
onValue(ref(db,"userList/"), snapshot=>{
  const data = snapshot.val() || {};
  namaSelect.innerHTML = "";

  Object.values(data)
    .sort((a,b)=>a.localeCompare(b))
    .forEach(nama=>{
      const option = document.createElement("option");
      option.value = nama;
      option.textContent = nama;
      namaSelect.appendChild(option);
    });
});

/* ===============================
   🔹 TAMPIL 5 ABSENSI TERAKHIR
================================= */
onValue(ref(db,"absensi/"), snapshot=>{
  const data = snapshot.val() || {};

  let arr = Object.values(data)
    .map(p=>({...p, date:new Date(p.waktu)}))
    .sort((a,b)=>b.date - a.date)
    .slice(0,5);

  daftar.innerHTML = "";

  arr.forEach(p=>{
    const li = document.createElement("li");
    li.textContent =
      `${p.nama} | ${p.kegiatan} | ` +
      `${p.date.toLocaleDateString('id-ID')} ` +
      `${p.date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;
    daftar.appendChild(li);
  });
});

/* ===============================
   🔹 FUNGSI ABSEN (LIMIT 4/BULAN)
================================= */
window.absen = async ()=>{

  const nama = namaSelect.value;
  const kegiatan = kegiatanSelect.value;

  if(!nama){
    showAlert("Pilih nama terlebih dahulu!");
    return;
  }

  const now = new Date();
  const bulan = now.getMonth();
  const tahun = now.getFullYear();

  try{

    // Ambil semua data absensi
    const snapshot = await get(ref(db,"absensi/"));
    const data = snapshot.val() || {};

    let countThisMonth = 0;

    Object.values(data).forEach(p=>{
      const d = new Date(p.waktu);
      if(
        p.nama === nama &&
        d.getMonth() === bulan &&
        d.getFullYear() === tahun
      ){
        countThisMonth++;
      }
    });

    if(countThisMonth >= 4){
      showAlert(`User "${nama}" sudah 4x absen bulan ini!`);
      return;
    }

    // ✅ SIMPAN DENGAN PUSH (AMAN)
    await push(ref(db,"absensi/"),{
      nama,
      kegiatan,
      waktu: now.toISOString()
    });

    showAlert("Absensi berhasil!");

  }catch(error){
    showAlert("Gagal menyimpan data: " + error.message);
  }
};
