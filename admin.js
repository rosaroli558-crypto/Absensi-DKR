import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const daftarBody = document.querySelector("#daftarAdmin tbody");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");

let dataGlobal = {};

// Ambil data real-time
onValue(ref(db, "absensi/"), (snapshot) => {
  dataGlobal = snapshot.val() || {};
  tampilkanRekap();
});

// Event filter bulan
bulanSelect.addEventListener("change", tampilkanRekap);

function tampilkanRekap() {
  daftarBody.innerHTML = "";

  const selectedBulan = bulanSelect.value;

  // Konversi ke array & parsing tanggal
  let dataArray = Object.values(dataGlobal).map(p => ({
    ...p,
    date: new Date(p.waktu)
  }));

  // Filter bulan
  if(selectedBulan !== "all") {
    dataArray = dataArray.filter(p => p.date.getMonth() === parseInt(selectedBulan));
  }

  // Rekap per user
  const rekapPerUser = {};
  dataArray.forEach(p => {
    if(!rekapPerUser[p.nama]){
      rekapPerUser[p.nama] = {
        nama: p.nama,
        total: 0,
        statusTerakhir: p.kegiatan,
        semuaKegiatan: [],
        semuaWaktu: []
      };
    }
    rekapPerUser[p.nama].total += 1;
    rekapPerUser[p.nama].statusTerakhir = p.kegiatan;
    rekapPerUser[p.nama].semuaKegiatan.push(p.kegiatan);
    rekapPerUser[p.nama].semuaWaktu.push(p.waktu);
  });

  const rekapArray = Object.values(rekapPerUser);

  totalSpan.textContent = rekapArray.length;

  // Tampilkan tabel
  rekapArray.forEach(user => {
    const tr = document.createElement("tr");

    // warna baris sesuai status terakhir
    let bgColor = "";
    switch(user.statusTerakhir){
      case "Hadir": bgColor="#d4edda"; break;
      case "Izin": bgColor="#fff3cd"; break;
      case "Sakit":
      case "Alfa": bgColor="#f8d7da"; break;
    }
    tr.style.backgroundColor = bgColor;

    // tampilkan semua waktu
    const semuaWaktu = user.semuaWaktu.join(", ");

    tr.innerHTML = `
      <td>${user.nama}</td>
      <td>${user.total} / 4</td>
      <td>${user.semuaKegiatan.join(", ")}</td>
      <td>${semuaWaktu}</td>
    `;

    daftarBody.appendChild(tr);
  });
}
