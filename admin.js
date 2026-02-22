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
const jamRef = ref(db, "settings/jamAbsen");

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

const jamMulaiInput = document.getElementById("jamMulai");
const jamSelesaiInput = document.getElementById("jamSelesai");
const btnSimpanJam = document.getElementById("btnSimpanJam");
const statusJam = document.getElementById("statusJam");

const btnValidasi = document.getElementById("btnValidasi");

/* ================= STATE ================= */

let globalAbsensi = [];
let filteredData = [];

/* ================= SORT ================= */

function sortData(data) {
  return data.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );
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
    .sort((a, b) => a.localeCompare(b, "id"));

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
      </p><hr>
    `;
  });

  rekapBox.innerHTML = html || "Belum ada data";
}

/* ================= FILTER ================= */

function applyFilter() {

  let data = [...globalAbsensi];

  const bulan = filterBulan.value;
  const kegiatan = filterKegiatan.value;

  if (bulan) {
    data = data.filter(item => {
      const date = new Date(item.timestamp);
      const ym =
        date.getFullYear() + "-" +
        (date.getMonth() + 1).toString().padStart(2, "0");
      return ym === bulan;
    });
  }

  if (kegiatan) {
    data = data.filter(item => item.kegiatan === kegiatan);
  }

  filteredData = sortData(data);
  renderTable(filteredData);
  renderRekap(filteredData);
}

filterBulan?.addEventListener("change", applyFilter);
filterKegiatan?.addEventListener("change", applyFilter);

/* ================= VALIDASI BULANAN ================= */

async function validasiBulanan(bulan) {

  const absSnapshot = await get(absensiRef);
  const userSnapshot = await get(usersRef);

  if (!absSnapshot.exists() || !userSnapshot.exists()) return;

  const absData = absSnapshot.val();
  const users = userSnapshot.val();

  let rekap = {};

  Object.keys(users).forEach(uid => {
    rekap[uid] = 0;
  });

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

btnValidasi?.addEventListener("click", () => {

  const bulan = document.getElementById("bulanValidasi").value;

  if (!bulan) {
    alert("Pilih bulan dulu");
    return;
  }

  validasiBulanan(bulan);
});

/* ================= FIREBASE LISTENER ================= */

onValue(absensiRef, snapshot => {

  const data = snapshot.val();
  globalAbsensi = [];

  if (!data) {
    applyFilter();
    return;
  }

  Object.keys(data).forEach(tanggal => {

    const users = data[tanggal];

    Object.keys(users).forEach(uid => {

      const item = users[uid];

      globalAbsensi.push({
        id: `${tanggal}/${uid}`,
        nama: item.nama,
        kegiatan: item.kegiatan,
        tanggal,
        jam: item.jam,
        timestamp: item.timestamp
      });

    });

  });

  applyFilter();
});

/* ================= LOAD USERS ================= */

onValue(usersRef, snapshot => {
  renderUsers(snapshot.val());
});

/* ================= USERS CRUD ================= */

btnTambahUser?.addEventListener("click", () => {

  const nama = namaUserInput.value.trim();
  const jabatan = jabatanUserInput.value.trim();

  if (!nama) return alert("Nama tidak boleh kosong");

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
      ${user.nama} (${user.jabatan})
      <button class="toggle">${user.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
      <button class="hapus">Hapus</button>
    `;

    li.querySelector(".toggle").addEventListener("click", () => {
      update(ref(db, "users/" + key), {
        aktif: !user.aktif
      });
    });

    li.querySelector(".hapus").addEventListener("click", () => {
      if (confirm("Yakin hapus anggota ini?")) {
        remove(ref(db, "users/" + key));
      }
    });

    listUser.appendChild(li);
  });
}

/* ================= LOCK JAM ================= */

onValue(jamRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;
  jamMulaiInput.value = data.mulai;
  jamSelesaiInput.value = data.selesai;
});

btnSimpanJam?.addEventListener("click", () => {

  const mulai = parseInt(jamMulaiInput.value);
  const selesai = parseInt(jamSelesaiInput.value);

  if (isNaN(mulai) || isNaN(selesai) || mulai >= selesai) {
    statusJam.textContent = "Jam tidak valid";
    statusJam.style.color = "red";
    return;
  }

  set(jamRef, { mulai, selesai });

  statusJam.textContent = "Jam disimpan";
  statusJam.style.color = "green";
});
