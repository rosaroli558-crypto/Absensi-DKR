import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const daftarBody = document.querySelector("#daftarAdmin tbody");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");
const rekap4Checkbox = document.getElementById("rekap4");

let data = {};

// Ambil data real-time
onValue(ref(db, "absensi/"), (snapshot) => {
  data = snapshot.val() || {};
  tampilkanDaftar();
});

// Event filter
bulanSelect.addEventListener("change", tampilkanDaftar);
rekap4Checkbox.addEventListener("change", tampilkanDaftar);

// Fungsi tampilkan daftar dengan filter & rekap
function tampilkanDaftar() {
  daftarBody.innerHTML = "";
  
  let dataArray = Object.entries(data).map(([id, peserta]) => ({
    id,
    ...peserta,
    date: new Date(peserta.waktu)
  }));

  // Filter bulan
  const selectedBulan = bulanSelect.value;
  if(selectedBulan !== "all") {
    dataArray = dataArray.filter(p => p.date.getMonth() === parseInt(selectedBulan));
  }

  // Urut terbaru di atas
  dataArray.sort((a,b) => new Date(b.date) - new Date(a.date));

  // Rekap per 4 absensi
  if(rekap4Checkbox.checked){
    const rekap = {};
    const hasil = [];
    dataArray.forEach(p => {
      if(!rekap[p.nama]) rekap[p.nama] = [];
      rekap[p.nama].push(p);
    });
    for(const nama in rekap){
      const list = rekap[nama];
      for(let i=0; i<list.length; i+=4){
        const batch = list.slice(i, i+4);
        hasil.push(...batch);
      }
    }
    dataArray = hasil;
  }

  totalSpan.textContent = dataArray.length;

  // Tampilkan tabel
  dataArray.forEach(peserta => {
    const tr = document.createElement("tr");

    // warna baris sesuai status
    let bgColor = "";
    switch(peserta.kegiatan){
      case "Hadir": bgColor="#d4edda"; break;
      case "Izin": bgColor="#fff3cd"; break;
      case "Sakit":
      case "Alfa": bgColor="#f8d7da"; break;
    }
    tr.style.backgroundColor = bgColor;

    tr.innerHTML = `
      <td>${peserta.nama}</td>
      <td>${peserta.kegiatan}</td>
      <td>${peserta.waktu}</td>
      <td><button class="delete-btn">Hapus</button></td>
    `;

    tr.querySelector(".delete-btn").onclick = () => remove(ref(db, "absensi/" + peserta.id));
    daftarBody.appendChild(tr);
  });
}
