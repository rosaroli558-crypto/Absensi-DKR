import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyC88eNtWMuOQ4eezVriirq_sjjVOkfl8K8",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2",
  measurementId: "G-MYTKHS8FHM"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const absensiRef = ref(db, "absensi");

/* ================= ELEMENT ================= */

const tableBody = document.getElementById("adminTable");
const filterBulan = document.getElementById("filterBulan");
const rekapBox = document.getElementById("rekapData");
const exportBtn = document.getElementById("exportExcel");

/* ================= STATE ================= */

let globalData = [];

/* ================= SORT ================= */

function sortData(data) {
  return data.sort((a, b) => {

    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();

    if (timeA !== timeB) {
      return timeB - timeA; // terbaru dulu
    }

    return a.nama.localeCompare(b.nama, "id", { sensitivity: "base" });
  });
}

/* ================= RENDER TABLE ================= */

function renderTable(data) {

  tableBody.innerHTML = "";

  if (!data.length) {
    tableBody.innerHTML =
      "<tr><td colspan='5'>Tidak ada data</td></tr>";
    return;
  }

  data.forEach(item => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>${item.kegiatan}</td>
      <td>${item.tanggal}</td>
      <td>${item.jam}</td>
      <td><button data-id="${item.id}">Hapus</button></td>
    `;

    tr.querySelector("button").addEventListener("click", () => {
      if (confirm("Yakin hapus data ini?")) {
        remove(ref(db, "absensi/" + item.id));
      }
    });

    tableBody.appendChild(tr);
  });
}

/* ================= REKAP ================= */

function renderRekap(data) {

  const rekap = {};

  data.forEach(item => {
    if (!rekap[item.nama]) {
      rekap[item.nama] = 0;
    }
    rekap[item.nama]++;
  });

  const sortedNama = Object.keys(rekap)
    .sort((a, b) => a.localeCompare(b, "id", { sensitivity: "base" }));

  let html = "";

  sortedNama.forEach(nama => {
    html += `<p>${nama} : ${rekap[nama]} kali</p>`;
  });

  rekapBox.innerHTML = html || "Belum ada data";
}

/* ================= UPDATE UI ================= */

function updateUI(data) {
  const sorted = sortData([...data]);
  renderTable(sorted);
  renderRekap(sorted);
}

/* ================= FILTER ================= */

function applyFilter() {

  const bulan = filterBulan.value;

  if (!bulan) {
    updateUI(globalData);
    return;
  }

  const filtered = globalData.filter(item =>
    item.timestamp.startsWith(bulan)
  );

  updateUI(filtered);
}

/* ================= EXPORT CSV ================= */

function exportCSV(data) {

  if (!data.length) {
    alert("Tidak ada data untuk export.");
    return;
  }

  const sorted = sortData([...data]);

  let csv = "Nama,Kegiatan,Tanggal,Jam\n";

  sorted.forEach(item => {
    csv += `${item.nama},${item.kegiatan},${item.tanggal},${item.jam}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "rekap_absensi.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* ================= FIREBASE LISTENER ================= */

onValue(absensiRef, snapshot => {

  const data = snapshot.val();

  if (!data) {
    globalData = [];
    updateUI([]);
    return;
  }

  globalData = Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  }));

  applyFilter();
});

/* ================= EVENT ================= */

filterBulan.addEventListener("change", applyFilter);

exportBtn.addEventListener("click", () => {

  const bulan = filterBulan.value;

  if (!bulan) {
    exportCSV(globalData);
  } else {
    const filtered = globalData.filter(item =>
      item.timestamp.startsWith(bulan)
    );
    exportCSV(filtered);
  }
});
