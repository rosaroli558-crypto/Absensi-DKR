import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  push,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
const logLokasiRef = ref(db, "logLokasi");
const tabelLokasi = document.getElementById("tabelLokasi");

/* ================= LOAD USERS ================= */

const tabelUser = document.getElementById("tabelUser");

onValue(ref(db, "users"), snapshot => {
  tabelUser.innerHTML = "";
  if (!snapshot.exists()) return;

  const users = snapshot.val();

  Object.keys(users).forEach(uid => {
    tabelUser.innerHTML += `
      <tr>
        <td>${users[uid].nama}</td>
        <td>
          <button onclick="hapusUser('${uid}')">Hapus</button>
        </td>
      </tr>
    `;
  });
});

/* ================= TAMBAH USER ================= */

window.tambahUser = function () {
  const namaInput = document.getElementById("namaUser");
  const nama = namaInput.value.trim();
  if (!nama) return alert("Isi nama dulu");

  const newUserRef = push(ref(db, "users"));
  set(newUserRef, {
    nama,
    aktif: true
  });

  namaInput.value = "";
};

window.hapusUser = function (uid) {
  remove(ref(db, "users/" + uid));
};

/* ================= LOKASI ================= */

onValue(logLokasiRef, snapshot => {

  const data = snapshot.val();
  tabelLokasi.innerHTML = "";

  if (!data) {
    tabelLokasi.innerHTML = "<tr><td colspan='4'>Belum ada data lokasi</td></tr>";
    return;
  }

  const entries = Object.entries(data)
    .sort((a, b) => b[0] - a[0]); // urut terbaru

  entries.forEach(([key, item]) => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.waktu}</td>
      <td>${item.latitude}</td>
      <td>${item.longitude}</td>
      <td>
        <a href="https://www.google.com/maps?q=${item.latitude},${item.longitude}" target="_blank">
          Lihat
        </a>
      </td>
    `;

    tabelLokasi.appendChild(row);

  });

});

/* ================= FILTER ABSENSI ================= */

const tabelAbsensi = document.getElementById("tabelAbsensi");

window.handleFilter = async function () {
  const tanggal = document.getElementById("filterTanggal").value;
  if (!tanggal) return alert("Pilih tanggal");

  const bulan = tanggal.substring(0, 7);
  const snapshot = await get(ref(db, `absensi/${bulan}/${tanggal}`));
  tabelAbsensi.innerHTML = "";

  if (!snapshot.exists()) return;

  const data = snapshot.val();
  const usersSnapshot = await get(ref(db, "users"));
  const users = usersSnapshot.val();

  Object.keys(data).forEach(uid => {
    tabelAbsensi.innerHTML += `
      <tr>
        <td>${users[uid]?.nama || "-"}</td>
        <td>${tanggal}</td>
        <td>
          <button onclick="hapusAbsen('${tanggal}','${uid}')">Hapus</button>
        </td>
      </tr>
    `;
  });
};

window.hapusAbsen = async function (tanggal, uid) {

  const bulan = tanggal.substring(0, 7);

  await remove(ref(db, `absensi/${bulan}/${tanggal}/${uid}`));

  handleFilter(); // refresh ulang tabel
};

/* ================= VALIDASI BULANAN ================= */

window.handleValidasi = async function () {
  const bulan = document.getElementById("bulanValidasi").value;
  if (!bulan) return alert("Pilih bulan");

  const absSnapshot = await get(ref(db, "absensi/" + bulan));
  const userSnapshot = await get(ref(db, "users"));

  if (!absSnapshot.exists() || !userSnapshot.exists()) return;

  const absData = absSnapshot.val();
  const users = userSnapshot.val();
  const tabel = document.getElementById("tabelValidasi");
  tabel.innerHTML = "";

  Object.keys(users).forEach(uid => {

  let total = 0;

  if (absData) {
    Object.keys(absData).forEach(tanggal => {
      if (absData[tanggal][uid]) {
        total++;
      }
    });
  }

  let status =
    total >= 4 ? "Lengkap" :
    total > 0 ? "Kurang" :
    "Tidak Absen";

    tabel.innerHTML += `
      <tr>
        <td>${users[uid].nama}</td>
        <td>${total}</td>
        <td>${status}</td>
      </tr>
    `;
  });
};

/* ================= LOCK JAM ================= */

window.setJam = function () {
  const mulai = document.getElementById("jamMulai").value;
  const selesai = document.getElementById("jamSelesai").value;

  if (!mulai || !selesai) return alert("Isi jam mulai & selesai");

    set(ref(db, "settings/jamAbsen"), {
      mulai: Number(mulai),
      selesai: Number(selesai)
    });

  alert("Jam berhasil disimpan");
};

// ADMIN.JS

// ===== EXPORT TO EXCEL =====

// ================= EXPORT EXCEL =================

window.handleExport = async function () {

  const bulan = document.getElementById("bulanExport").value;
  if (!bulan) return alert("Pilih bulan dulu");

  const absSnapshot = await get(ref(db, "absensi/" + bulan));
  const userSnapshot = await get(ref(db, "users"));

  if (!absSnapshot.exists() || !userSnapshot.exists()) {
    alert("Data tidak ditemukan");
    return;
  }

  const absData = absSnapshot.val();
  const users = userSnapshot.val();

  const rekap = {};

    Object.keys(absData).forEach(tanggal => {
      Object.keys(absData[tanggal]).forEach(uid => {
        
        const item = absData[tanggal][uid];
        
        if (!rekap[uid]) {
          rekap[uid] = {
            nama: users[uid]?.nama || "-",
            list: []
          };
        }
        
        rekap[uid].list.push({
          keterangan: item.keterangan || "Hadir",
          timestamp: item.timestamp
        });
      });
    });
  // ⬅️ PINDAH KE SINI
  exportToExcel(rekap, bulan);
};

function exportToExcel(rekap, periodeText) {

    const wb = XLSX.utils.book_new();

    const rows = [];

    rows.push([]);
    rows.push(["", "LAPORAN ABSENSI DEWAN KERJA RANTING BATULICIN"]);
    rows.push(["", "Periode: " + periodeText]);
    rows.push([]);
    rows.push(["", "No", "Nama", "Kegiatan", "Tanggal", "Jam"]);
  
  let no = 1;
  Object.keys(rekap)
    .sort((a, b) => rekap[a].nama.localeCompare(rekap[b].nama))
    .forEach(uid => {
      
      const user = rekap[uid];

    // urutkan berdasarkan waktu
    user.list.sort((a, b) => a.timestamp - b.timestamp);
    
    const keter = [];
    const tanggal = [];
    const jam = [];

    const format2Baris = (arr) => {
      const baris1 = arr.slice(0, 2).join(" | ");
      const baris2 = arr.slice(2, 4).join(" | ");
      return [baris1, baris2].filter(Boolean).join("\n");
    };

    user.list.slice(0, 4).forEach(item => {
      
      const date = new Date(item.timestamp);
      
      keter.push(item.keterangan);
      
      tanggal.push(
        date.toLocaleDateString("id-ID", {
          timeZone: "Asia/Makassar"
        })
      );
      
      jam.push(
        date.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Makassar"
        })
      );
    });
    
    rows.push([
      "",
      no++,
      user.nama,
      format2Baris(keter),
      format2Baris(tanggal),
      format2Baris(jam)
    ]);
  });

    const ws = XLSX.utils.aoa_to_sheet(rows);
  
    ws["!rows"] = rows.map(() => ({ hpt: 40 }));
    // MERGE JUDUL
    ws["!merges"] = [
        { s: { r: 1, c: 1 }, e: { r: 1, c: 5 } },
        { s: { r: 2, c: 1 }, e: { r: 2, c: 5 } }
    ];

    // LEBAR KOLOM
    ws["!cols"] = [
        { wch: 5 },
        { wch: 3 },
        { wch: 35 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 }
    ];

    const range = XLSX.utils.decode_range(ws["!ref"]);

    // BORDER + CENTER
  for (let R = 4; R <= range.e.r; ++R) {
    for (let C = 1; C <= 5; ++C) {
      
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell]) continue;

      ws[cell].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true
        },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      };
    }
  }

    // STYLE JUDUL
    ws["B2"].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: "center", vertical: "center" }
    };

    ws["B3"].s = {
        font: { bold: true, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" }
    };

    // HEADER STYLE
    const headerRow = 4;
    for (let col = 1; col <= 5; col++) {
        const cell = XLSX.utils.encode_cell({ r: headerRow, c: col });
        if (!ws[cell]) continue;

        ws[cell].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
            fill: {
                patternType: "solid",
                fgColor: { rgb: "DDDDDD" }
            },
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };
    }
  
    for (let R = 0; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {

        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
      
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          alignment: {
            horizontal: "center",
            vertical: "center"
          }
        };
      }
    }
  
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Absensi");
    XLSX.writeFile(wb, `Laporan_Absensi_${periodeText}.xlsx`);
}
