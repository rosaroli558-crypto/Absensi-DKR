import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  query,
  limitToLast
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

/* ================= REFERENCES ================= */

const usersRef = ref(db, "users");
const absensiRef = ref(db, "absensi");
const jamRef = ref(db, "settings/jamAbsen");

let jamMulai = 16;
let jamSelesai = 18;

/* ================= ELEMENT ================= */

const namaSelect = document.getElementById("nama");
const kegiatanSelect = document.getElementById("kegiatan");
const btnAbsen = document.getElementById("btnAbsen");
const daftar = document.getElementById("daftar");
const statusMsg = document.getElementById("statusMsg");

/* ================= LOCK JAM ABSEN ================= */

function checkJamAbsen() {

  const now = new Date();

  const totalMenitSekarang = now.getHours() * 60 + now.getMinutes();
  const totalMenitMulai = jamMulai * 60;
  const totalMenitSelesai = jamSelesai * 60;

  if (totalMenitSekarang >= totalMenitMulai &&
      totalMenitSekarang < totalMenitSelesai) {

    btnAbsen.disabled = false;
    statusMsg.textContent = "";
    return true;

  } else {

    btnAbsen.disabled = true;

    statusMsg.textContent =
      `⛔ ABSENSI DIBUKA PUKUL ${jamMulai}:00 - ${jamSelesai}:00`;

    statusMsg.style.color = "#b30000";
    statusMsg.style.fontSize = "20px";
    statusMsg.style.fontWeight = "bold";
    statusMsg.style.textAlign = "center";
    statusMsg.style.marginTop = "15px";

    return false;
  }
}

// cek saat pertama load
onValue(jamRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;

  jamMulai = data.mulai;
  jamSelesai = data.selesai;

  checkJamAbsen();
});

// cek ulang setiap 30 detik
setInterval(checkJamAbsen, 30000);
/* ================= LOAD USERS ================= */

onValue(usersRef, snapshot => {

  const data = snapshot.val();

  namaSelect.innerHTML = "";

  if (!data) {
    namaSelect.innerHTML = "<option value=''>Belum ada anggota</option>";
    return;
  }

  const aktifUsers = Object.keys(data)
  .filter(key => data[key].aktif !== false)
  .map(key => ({
    id: key,
    nama: data[key].nama
  }))
  .sort((a, b) =>
    a.nama.localeCompare(b.nama, "id", { sensitivity: "base" })
  );

  if (!aktifUsers.length) {
    namaSelect.innerHTML = "<option value=''>Tidak ada anggota aktif</option>";
    return;
  }

  namaSelect.innerHTML = "<option value=''>Pilih Nama</option>";

  aktifUsers.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.nama;
    namaSelect.appendChild(option);
  });

});

/* ================= CEK JUMLAH BULANAN ================= */

async function cekJumlahBulanan(userId) {

  const now = new Date();
  const bulan = now.toISOString().substring(0, 7); // 2026-02

  const snapshot = await get(ref(db, `absensi/${bulan}`));

  if (!snapshot.exists()) return 0;

  const data = snapshot.val();
  let total = 0;

  Object.keys(data).forEach(tanggal => {
    if (data[tanggal][userId]) {
      total++;
    }
  });

  return total;
}

/* ================= ABSEN ================= */

btnAbsen.addEventListener("click", async () => {

  if (!checkJamAbsen()) return;

  const userId = namaSelect.value;
  const kegiatan = kegiatanSelect.value;

  if (!userId) {
    statusMsg.textContent = "Pilih nama terlebih dahulu.";
    statusMsg.style.color = "red";
    return;
  }

  const userName =
    namaSelect.options[namaSelect.selectedIndex].text;

  const now = new Date();

  const today = now.toISOString().split("T")[0]; // format 2026-02-21

  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
  
namaSelect.addEventListener("change", async () => {
  const userId = namaSelect.value;
  if (!userId) return;

  const total = await cekJumlahBulanan(userId);

  if (total >= 4) {
    btnAbsen.disabled = true;
    statusMsg.textContent = "Batas 4x bulan ini sudah tercapai.";
    statusMsg.style.color = "red";
  } else {
    checkJamAbsen();
  }
});
  
  const bulan = today.substring(0, 7);
  const absensiUserRef = ref(db, `absensi/${bulan}/${today}/${userId}`);

  const snapshot = await get(absensiUserRef);

  if (snapshot.exists()) {
    statusMsg.textContent = "User ini sudah absen hari ini.";
    statusMsg.style.color = "red";
    return;
  }
  
  await set(absensiUserRef, {
    nama: userName,
    kegiatan,
    jam,
    timestamp: now.toISOString()
  });

  statusMsg.textContent = "Absensi berhasil dicatat.";
  statusMsg.style.color = "green";

  namaSelect.value = "";
});

/* ================= 5 DATA TERAKHIR ================= */

onValue(absensiRef, snapshot => {

  const data = snapshot.val();
  daftar.innerHTML = "";

  if (!data) {
    daftar.innerHTML = "<li>Belum ada absensi</li>";
    return;
  }

  let allData = [];

  Object.keys(data).forEach(bulan => {

    Object.keys(data[bulan]).forEach(tanggal => {

      Object.keys(data[bulan][tanggal]).forEach(uid => {

        const item = data[bulan][tanggal][uid];

        allData.push({
          nama: item.nama,
          kegiatan: item.kegiatan,
          jam: item.jam,
          tanggal: tanggal,
          timestamp: item.timestamp
        });

      });

    });

  });

  // Urutkan terbaru
  allData.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const lastFive = allData.slice(0, 5);

  lastFive.forEach(item => {

    const li = document.createElement("li");

    li.textContent =
      `${item.nama} - ${item.kegiatan} (${item.tanggal} ${item.jam})`;

    daftar.appendChild(li);

  });

});
