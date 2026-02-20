import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  push,
  set,
  update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ================= FIREBASE CONFIG ================= */

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

/* ================= REFERENCES ================= */

const absensiRef = ref(db, "absensi");
const usersRef = ref(db, "users");

/* ================= ELEMENTS ================= */

const tableBody = document.getElementById("adminTable");
const filterBulan = document.getElementById("filterBulan");
const filterKegiatan = document.getElementById("filterKegiatan");
const rekapBox = document.getElementById("rekapData");
const exportBtn = document.getElementById("exportExcel");

const namaUserInput = document.getElementById("namaUser");
const jabatanUserInput = document.getElementById("jabatanUser");
const btnTambahUser = document.getElementById("btnTambahUser");
const listUser = document.getElementById("listUser");

/* ================= STATE ================= */

let globalAbsensi = [];
let filteredData = [];

/* ================= SORT DATA ================= */

function sortData(data) {
  return data.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });
}

/* ================= RENDER TABLE ================= */

function renderTable(data) {
  tableBody.innerHTML = "";

  if (!data.length) {
    tableBody.innerHTML = "<tr><td colspan='5'>Tidak ada data</td></tr>";
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

/* ================= RENDER REKAP ================= */

function renderRekap(data) {
  const rekap = {};

  data.forEach(item => {
    if (!rekap[item.nama]) {
      rekap[item.nama] = {
        Hadir: 0,
        Izin: 0,
        Sakit: 0,
        Alfa: 0,
        Total: 0
      };
    }

    rekap[item.nama][item.kegiatan]++;
    rekap[item.nama].Total++;
  });

  const sortedNama = Object.keys(rekap)
    .sort((a, b) => a.localeCompare(b, "id", { sensitivity: "base" }));

  let html = "";

  sortedNama.forEach(nama => {
    const r = rekap[nama];

    html += `
      <p>
        <strong>${nama}</strong><br>
        Hadir: ${r.Hadir} |
        Izin: ${r.Izin} |
        Sakit: ${r.Sakit} |
        Alfa: ${r.Alfa} |
        Total: ${r.Total}
      </p>
      <hr>
    `;
  });

  rekapBox.innerHTML = html || "Belum ada data";
}

/* ================= FILTER ================= */

function applyFilter() {

  let data = [...globalAbsensi];

  const bulan = filterBulan.value;
  const kegiatan = filterKegiatan.value;

  // ================= FILTER BULAN =================
  if (bulan) {

    data = data.filter(item => {

      if (!item.timestamp) return false;

      const date = new Date(item.timestamp);

      const yearMonth =
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1).toString().padStart(2, "0");

      return yearMonth === bulan;
    });
  }

  // ================= FILTER KEGIATAN =================
  if (kegiatan) {
    data = data.filter(item =>
      item.kegiatan === kegiatan
    );
  }

  filteredData = sortData(data);

  renderTable(filteredData);
  renderRekap(filteredData);
}

filterBulan.addEventListener("change", applyFilter);
filterKegiatan.addEventListener("change", applyFilter);

/* ================= EXPORT CSV ================= */

function exportToExcel(data, periodeText) {
  const wb = XLSX.utils.book_new();

  // Urutkan nama A-Z lalu timestamp terbaru
  data.sort((a, b) => {
    const nameCompare = a.nama.localeCompare(b.nama);
    if (nameCompare !== 0) return nameCompare;
    return b.timestamp - a.timestamp;
  });

  const rows = [];

  // Judul (nanti kita merge)
  rows.push([]);
  rows.push(["LAPORAN ABSENSI DEWAN KERJA RANTING BATULICIN"]);
  rows.push([`Periode: ${periodeText}`]);
  rows.push([]);

  // Header tabel
  rows.push(["","No", "Nama", "Kegiatan", "Tanggal", "Jam"]);

  data.forEach((item, index) => {
    const date = new Date(item.timestamp);
    rows.push([
      index,
      index + 1,
      item.nama,
      item.kegiatan,
      date.toLocaleDateString("id-ID"),
      date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    ]);
  });

  rows.push([]);
  rows.push(["","Total Data:", data.length]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Merge Judul & Periode
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }
  ];

  // Lebar kolom
  ws["!cols"] = [
    { wch: 10 },
    { wch: 5 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 10 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Laporan Absensi");
  XLSX.writeFile(wb, `Laporan_Absensi_${periodeText}.xlsx`);
}/* ================= USERS CRUD ================= */

btnTambahUser.addEventListener("click", () => {
  const nama = namaUserInput.value.trim();
  const jabatan = jabatanUserInput.value.trim();

  if (!nama) {
    alert("Nama tidak boleh kosong");
    return;
  }

  const newUserRef = push(usersRef);

  set(newUserRef, {
    nama,
    jabatan: jabatan || "-",
    aktif: true,
    dibuat: new Date().toISOString()
  });

  namaUserInput.value = "";
  jabatanUserInput.value = "";
});

function renderUsers(data) {
  listUser.innerHTML = "";

  if (!data) {
    listUser.innerHTML = "<li>Belum ada anggota</li>";
    return;
  }

  Object.keys(data).forEach(key => {
    const user = data[key];

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="user-info">
        <span class="user-name">
          ${user.nama} ${!user.aktif ? "(Nonaktif)" : ""}
        </span>
        <span class="user-role">${user.jabatan}</span>
      </div>

      <div class="user-actions">
        <button class="nonaktif-btn">
          ${user.aktif ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button class="delete-btn">Hapus</button>
      </div>
    `;

    li.querySelector(".nonaktif-btn").addEventListener("click", () => {
      update(ref(db, "users/" + key), {
        aktif: !user.aktif
      });
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("Yakin hapus anggota ini?")) {
        remove(ref(db, "users/" + key));
      }
    });

    listUser.appendChild(li);
  });
}

/* ================= FIREBASE LISTENER ================= */

onValue(absensiRef, snapshot => {

  const data = snapshot.val();

  if (!data) {
    globalAbsensi = [];
    filteredData = [];
    applyFilter();
    return;
  }

  globalAbsensi = Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  }));

  applyFilter();
});

onValue(usersRef, snapshot => {
  renderUsers(snapshot.val());
});

/* ================= EVENTS ================= */

filterBulan.addEventListener("change", applyFilter);
filterKegiatan.addEventListener("change", applyFilter);

exportBtn.addEventListener("click", () => {
  exportExcel(filteredData);
});
