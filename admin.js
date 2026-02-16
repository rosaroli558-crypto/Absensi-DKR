// Import Firebase modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔹 Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC88eNtWMuOQ4eezVriirq_sjjVOkfl8K8",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ambil elemen
const daftarBody = document.querySelector("#daftarAdmin tbody");
const totalSpan = document.getElementById("total");
const bulanSelect = document.getElementById("bulan");

let dataGlobal = {};

// 🔹 Ambil data real-time
onValue(ref(db, "absensi/"), snapshot => {
  dataGlobal = snapshot.val() || {};
  tampilkanRekap();
});

// Event filter bulan
bulanSelect.addEventListener("change", tampilkanRekap);

// Fungsi tampilkan rekap per user per bulan
function tampilkanRekap() {
  daftarBody.innerHTML = "";

  const selectedBulan = bulanSelect.value;

  // Konversi data object ke array & parsing tanggal
  let dataArray = Object.entries(dataGlobal).map(([id, peserta]) => ({
    id,
    ...peserta,
    date: new Date(peserta.waktu)
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
        semuaWaktu: [],
        ids: []
      };
    }
    rekapPerUser[p.nama].total += 1;
    rekapPerUser[p.nama].statusTerakhir = p.kegiatan;
    rekapPerUser[p.nama].semuaKegiatan.push(p.kegiatan);
    rekapPerUser[p.nama].semuaWaktu.push(p.waktu);
    rekapPerUser[p.nama].ids.push(p.id);
  });

  const rekapArray = Object.values(rekapPerUser);

  // Update total respons
  totalSpan.textContent = rekapArray.length;

  // Tampilkan tabel
  rekapArray.forEach(user => {
    const tr = document.createElement("tr");

    // Warna baris sesuai status terakhir
    let bgColor = "";
    switch(user.statusTerakhir){
      case "Hadir": bgColor="#d4edda"; break;
      case "Izin": bgColor="#fff3cd"; break;
      case "Sakit": bgColor="#fff3cd"; break;
      case "Alfa": bgColor="#f8d7da"; break;
    }
    tr.style.backgroundColor = bgColor;

    // Semua waktu
    const semuaWaktu = user.semuaWaktu.join(", ");
    const semuaStatus = user.semuaKegiatan.join(", ");

    // Tampilkan 1 baris per user + tombol hapus
    tr.innerHTML = `
      <td>${user.nama}</td>
      <td>${user.total} / 4</td>
      <td>${semuaStatus}</td>
      <td>${semuaWaktu}</td>
      <td><button class="delete-btn">Hapus</button></td>
    `;

    // Hapus semua absensi user
    tr.querySelector(".delete-btn").onclick = () => {
      user.ids.forEach(id => remove(ref(db, "absensi/" + id)));
    };

    daftarBody.appendChild(tr);
  });
}
