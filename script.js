import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  query,
  limitToLast
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

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

const usersRef = ref(db, "users");
const absensiRef = ref(db, "absensi");

/* ================= ELEMENT ================= */

const namaSelect = document.getElementById("nama");
const kegiatanSelect = document.getElementById("kegiatan");
const btnAbsen = document.getElementById("btnAbsen");
const daftar = document.getElementById("daftar");
const statusMsg = document.getElementById("statusMsg");

/* ================= LOAD USERS ================= */

onValue(usersRef, snapshot => {

  const data = snapshot.val();

  namaSelect.innerHTML = "";

  if (!data) {
    namaSelect.innerHTML = "<option value=''>Belum ada anggota</option>";
    return;
  }

  const aktifUsers = Object.keys(data)
    .filter(key => data[key].aktif)
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

/* ================= ABSEN ================= */

btnAbsen.addEventListener("click", async () => {

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

  const absensiUserRef = ref(db, `absensi/${today}/${userId}`);

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

const lastFiveQuery = query(absensiRef, limitToLast(5));

onValue(lastFiveQuery, snapshot => {

  const data = snapshot.val();

  daftar.innerHTML = "";

  if (!data) {
    daftar.innerHTML = "<li>Belum ada absensi</li>";
    return;
  }

  const list = Object.keys(data).map(key => data[key]);

  list.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  list.forEach(item => {

    const li = document.createElement("li");

    li.textContent =
      `${item.nama} - ${item.kegiatan} (${item.tanggal} ${item.jam})`;

    daftar.appendChild(li);
  });

});
