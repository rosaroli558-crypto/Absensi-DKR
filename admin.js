// =============================
// FIREBASE IMPORT
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// =============================
// FIREBASE CONFIG (DATA KAMU)
// =============================
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

// =============================
// INIT FIREBASE
// =============================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =============================
// RENDER TABLE
// =============================
function renderTable(snapshot) {
  const tbody = document.getElementById("absenBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!snapshot.exists()) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;">
          Belum ada data absensi
        </td>
      </tr>
    `;
    return;
  }

  let no = 1;

  snapshot.forEach((child) => {
    const data = child.val() || {};

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${no++}</td>
      <td>${data.nama ?? "-"}</td>
      <td>${data.tanggal ?? "-"}</td>
      <td>${data.keterangan ?? "-"}</td>
      <td>
        <button class="btn-delete" data-id="${child.key}">
          Hapus
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// =============================
// DELETE FUNCTION
// =============================
function deleteAbsensi(id) {
  if (!id) return;

  const confirmDelete = confirm("Yakin ingin menghapus data ini?");
  if (!confirmDelete) return;

  remove(ref(db, "absensi/" + id))
    .catch(error => {
      console.error("Gagal hapus:", error);
      alert("Gagal menghapus data.");
    });
}

// =============================
// INIT ADMIN
// =============================
document.addEventListener("DOMContentLoaded", () => {

  const dataRef = ref(db, "absensi");

  onValue(dataRef, (snapshot) => {
    renderTable(snapshot);
  });

  const tbody = document.getElementById("absenBody");

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-delete")) {
        const id = e.target.getAttribute("data-id");
        deleteAbsensi(id);
      }
    });
  }

});
