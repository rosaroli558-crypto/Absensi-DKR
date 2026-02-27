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
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth = getAuth(app);


/* ================= LOAD USERS ================= */

const tabelUser = document.getElementById("tabelUser");

onValue(ref(db, "users"), snapshot => {
  tabelUser.innerHTML = "";

  if (!snapshot.exists()) {
    tabelUser.innerHTML = `<tr><td colspan="2">Belum ada anggota</td></tr>`;
    return;
  }

  const users = snapshot.val();

  Object.keys(users).forEach(uid => {
    tabelUser.innerHTML += `
      <tr>
        <td>${users[uid]?.nama || "-"}</td>
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

/* ================= FILTER ABSENSI ================= */

const tabelAbsensi = document.getElementById("tabelAbsensi");

window.handleFilter = async function () {

  const tanggal = document.getElementById("filterTanggal").value;
  if (!tanggal) return alert("Pilih tanggal");

  const bulan = tanggal.substring(0, 7);

  const snapshot = await get(ref(db, `absensi/${bulan}/${tanggal}`));
  const usersSnapshot = await get(ref(db, "users"));

  tabelAbsensi.innerHTML = "";

  if (!snapshot.exists()) {
    tabelAbsensi.innerHTML = `
      <tr>
        <td colspan="5">Tidak ada data</td>
      </tr>
    `;
    return;
  }

  const data = snapshot.val();
  const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

  Object.keys(data).forEach(uid => {

    const absen = data[uid];

    /* ===== SAFE TIMESTAMP ===== */
    const rawTime = absen.timestamp || absen.waktu || null;

    let tanggalLengkap = "-";

    if (rawTime) {
      const waktuObj = new Date(rawTime);
      if (!isNaN(waktuObj.getTime())) {
        tanggalLengkap = waktuObj.toLocaleString("id-ID", {
          timeZone: "Asia/Makassar",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    }

    const lat = absen.latitude;
    const lng = absen.longitude;

    const mapLink = lat && lng
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

    tabelAbsensi.innerHTML += `
      <tr>
        <td>${users[uid]?.nama || absen.nama || "-"}</td>
        <td>${tanggalLengkap}</td>
        <td>${absen.keterangan || "-"}</td>
        <td>
          ${mapLink ? `<a href="${mapLink}" target="_blank">Lihat</a>` : "-"}
        </td>
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

  handleFilter();
};

/* ================= VALIDASI BULANAN ================= */

window.handleValidasi = async function () {

  const bulan = document.getElementById("bulanValidasi").value;
  if (!bulan) return alert("Pilih bulan");

  const absSnapshot = await get(ref(db, "absensi/" + bulan));
  const userSnapshot = await get(ref(db, "users"));

  if (!absSnapshot.exists() || !userSnapshot.exists()) {
    alert("Data tidak ditemukan");
    return;
  }

  const absData = absSnapshot.val();
  const users = userSnapshot.val();
  const tabel = document.getElementById("tabelValidasi");

  tabel.innerHTML = "";

  Object.keys(users).forEach(uid => {

    let total = 0;

    Object.keys(absData).forEach(tanggal => {
      if (absData[tanggal] && absData[tanggal][uid]) {
        total++;
      }
    });

    let status =
      total >= 4 ? "Lengkap" :
      total > 0 ? "Kurang" :
      "Tidak Absen";

    tabel.innerHTML += `
      <tr>
        <td>${users[uid]?.nama || "-"}</td>
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

/* ================= EXPORT EXCEL ================= */

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
      const rawTime = item.timestamp || item.waktu || null;

      if (!rekap[uid]) {
        rekap[uid] = {
          nama: users[uid]?.nama || "-",
          list: []
        };
      }

      rekap[uid].list.push({
        keterangan: item.keterangan || "Hadir",
        waktu: rawTime
      });
    });
  });

  exportToExcel(rekap, bulan);
};

function exportToExcel(rekap, periodeText) {

  const wb = XLSX.utils.book_new();
  const rows = [];

  rows.push([]);
  rows.push(["", "LAPORAN ABSENSI DEWAN KERJA RANTING BATULICIN"]);
  rows.push(["", "Periode: " + periodeText]);
  rows.push([]);
  rows.push(["", "No", "Nama", "Keterangan", "Tanggal", "Jam"]);

  let no = 1;

  Object.keys(rekap)
    .sort((a, b) => rekap[a].nama.localeCompare(rekap[b].nama))
    .forEach(uid => {

      const user = rekap[uid];

      user.list.sort((a, b) => (a.waktu || 0) - (b.waktu || 0));

      const keter = [];
      const tanggal = [];
      const jam = [];

      user.list.slice(0, 4).forEach(item => {

        if (!item.waktu) return;

        const date = new Date(item.waktu);

        if (isNaN(date.getTime())) return;

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
        keter.join(" | "),
        tanggal.join(" | "),
        jam.join(" | ")
      ]);
    });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Absensi");
  XLSX.writeFile(wb, `Laporan_Absensi_${periodeText}.xlsx`);
}
