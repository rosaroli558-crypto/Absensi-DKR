import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  push,
  set,
  get
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
        <td><button onclick="hapusUser('${uid}')">Hapus</button></td>
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
  set(newUserRef, { nama });

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

  const snapshot = await get(ref(db, "absensi/" + tanggal));
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
        <td><button onclick="hapusAbsen('${tanggal}','${uid}')">Hapus</button></td>
      </tr>
    `;
  });
};

window.hapusAbsen = function (tanggal, uid) {
  remove(ref(db, "absensi/" + tanggal + "/" + uid));
};

/* ================= VALIDASI BULANAN ================= */

window.handleValidasi = async function () {
  const bulan = document.getElementById("bulanValidasi").value;
  if (!bulan) return alert("Pilih bulan");

  const absSnapshot = await get(ref(db, "absensi"));
  const userSnapshot = await get(ref(db, "users"));

  if (!absSnapshot.exists() || !userSnapshot.exists()) return;

  const absData = absSnapshot.val();
  const users = userSnapshot.val();
  const tabel = document.getElementById("tabelValidasi");
  tabel.innerHTML = "";

  Object.keys(users).forEach(uid => {
    let total = 0;

    Object.keys(absData).forEach(tanggal => {
      if (tanggal.startsWith(bulan) && absData[tanggal][uid]) {
        total++;
      }
    });

    let status = total >= 4 ? "Lengkap" :
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

  set(ref(db, "pengaturanJam"), {
    mulai,
    selesai
  });

  alert("Jam berhasil disimpan");
};

/* ================= EXPORT ================= */

window.exportExcel = async function () {
  const snapshot = await get(ref(db, "absensi"));
  if (!snapshot.exists()) return;

  const data = snapshot.val();
  let csv = "Tanggal,UID\n";

  Object.keys(data).forEach(tanggal => {
    Object.keys(data[tanggal]).forEach(uid => {
      csv += `${tanggal},${uid}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "absensi.csv";
  a.click();
};
