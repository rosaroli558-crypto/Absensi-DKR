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

/* ================= EXPORT ================= */

window.exportExcel = async function () {

  const bulan = document.getElementById("bulanExport").value;
  if (!bulan) return alert("Pilih bulan dulu");

  const snapshot = await get(ref(db, `absensi/${bulan}`));
  const usersSnapshot = await get(ref(db, "users"));

  if (!usersSnapshot.exists()) {
    return alert("Data user kosong");
  }

  const users = usersSnapshot.val();
  const absensi = snapshot.exists() ? snapshot.val() : {};

  let rekap = {};

  // siapkan semua user
  Object.keys(users).forEach(uid => {
    rekap[uid] = {
      nama: users[uid].nama,
      keterangan: [],
      tanggal: [],
      totalHadir: 0
    };
  });

  // ambil data absensi bulan itu
  Object.keys(absensi).forEach(tanggal => {
    Object.keys(absensi[tanggal]).forEach(uid => {

      const dataUser = absensi[tanggal][uid];
      const status = dataUser.kegiatan;

      if (rekap[uid]) {

        rekap[uid].keterangan.push(status);
        rekap[uid].tanggal.push(tanggal.split("-")[2]); // ambil tanggal saja

        if (status?.toLowerCase() === "hadir") {
          rekap[uid].totalHadir++;
        }

      }

    });
  });

  // buat CSV
  let csv = "";
  csv += "ABSENSI DKR BATULICIN\n";
  csv += `Periode: ${bulan}\n\n`;
  csv += "No,Nama,Keterangan (4),Tanggal Absen (4),Total Hadir\n";

  let no = 1;

  Object.values(rekap).forEach(user => {

    const ket = user.keterangan.join(" | ");
    const tgl = user.tanggal.join(" | ");

    csv += `${no},${user.nama},${ket},${tgl},${user.totalHadir}\n`;
    no++;

  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Rekap Absensi DKR ${bulan}.csv`;
  a.click();
};
