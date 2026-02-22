import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  push,
  set,
  update,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ================= VALIDASI BULANAN ================= */

async function validasiBulanan(bulan) {

  const absSnapshot = await get(ref(db, "absensi"));
  const userSnapshot = await get(ref(db, "users"));

  if (!absSnapshot.exists() || !userSnapshot.exists()) return;

  const absData = absSnapshot.val();
  const users = userSnapshot.val();

  let rekap = {};

  // set semua user = 0
  Object.keys(users).forEach(uid => {
    rekap[uid] = 0;
  });

  // hitung absensi per bulan
  Object.keys(absData).forEach(tanggal => {

    if (tanggal.startsWith(bulan)) {

      Object.keys(absData[tanggal]).forEach(uid => {

        if (rekap[uid] !== undefined) {
          rekap[uid]++;
        }

      });

    }

  });

  tampilkanValidasi(rekap, users);
}

/* ================= TAMPILKAN ================= */

function tampilkanValidasi(rekap, users) {

  const tabel = document.getElementById("tabelValidasi");
  tabel.innerHTML = "";

  Object.keys(users).forEach(uid => {

    const jumlah = rekap[uid];
    let status = "";

    if (jumlah >= 4) status = "Lengkap";
    else if (jumlah > 0) status = "Kurang";
    else status = "Tidak Absen";

    tabel.innerHTML += `
      <tr>
        <td>${users[uid].nama}</td>
        <td>${jumlah}</td>
        <td>${status}</td>
      </tr>
    `;

  });

}

/* ================= BUTTON EVENT ================= */

document.getElementById("btnValidasi")
  .addEventListener("click", () => {

    const bulan = document.getElementById("bulanValidasi").value;

    if (!bulan) {
      alert("Pilih bulan dulu");
      return;
    }

    validasiBulanan(bulan);

  });
