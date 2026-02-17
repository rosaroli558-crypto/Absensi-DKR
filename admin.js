// ===============================
// INIT DATA
// ===============================

let users = JSON.parse(localStorage.getItem("users")) || [];
let absensi = JSON.parse(localStorage.getItem("absensi")) || [];

// ===============================
// SAVE FUNCTION
// ===============================

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("absensi", JSON.stringify(absensi));
}

// ===============================
// RENDER USER LIST (KIRI)
// ===============================

function renderUsers() {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  users.forEach((user, index) => {
    const li = document.createElement("li");
    li.className = "user-item";

    li.innerHTML = `
      ${user}
      <button onclick="deleteUser(${index})" class="btn-delete">X</button>
    `;

    userList.appendChild(li);
  });
}

// ===============================
// TAMBAH USER
// ===============================

function addUser() {
  const input = document.getElementById("newUser");
  const name = input.value.trim();

  if (!name) return alert("Nama tidak boleh kosong");

  if (users.includes(name)) {
    alert("User sudah ada");
    return;
  }

  users.push(name);
  saveData();
  renderUsers();
  input.value = "";
}

// ===============================
// HAPUS USER
// ===============================

function deleteUser(index) {
  if (!confirm("Hapus user ini?")) return;

  const deletedUser = users[index];

  // hapus semua absensi user itu juga
  absensi = absensi.filter(a => a.nama !== deletedUser);

  users.splice(index, 1);
  saveData();
  renderUsers();
  renderTable();
}

// ===============================
// RENDER TABEL ABSENSI (KANAN)
// ===============================

function renderTable(data = absensi) {
  const tbody = document.getElementById("absenBody");
  tbody.innerHTML = "";

  data.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.nama}</td>
      <td>${item.tanggal}</td>
      <td>${item.keterangan}</td>
      <td>
        <button onclick="deleteAbsensi(${index})" class="btn-delete">
          Hapus
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===============================
// HAPUS PER ABSENSI
// ===============================

function deleteAbsensi(index) {
  if (!confirm("Hapus data absensi ini?")) return;

  absensi.splice(index, 1);
  saveData();
  renderTable();
}

// ===============================
// FILTER DATA
// ===============================

function filterData() {
  const cariNama = document.getElementById("searchNama").value.toLowerCase();
  const tanggal = document.getElementById("searchTanggal").value;
  const status = document.getElementById("searchStatus").value;

  let filtered = absensi.filter(item => {
    return (
      item.nama.toLowerCase().includes(cariNama) &&
      (tanggal === "" || item.tanggal === tanggal) &&
      (status === "Semua" || item.keterangan === status)
    );
  });

  renderTable(filtered);
}

function resetFilter() {
  document.getElementById("searchNama").value = "";
  document.getElementById("searchTanggal").value = "";
  document.getElementById("searchStatus").value = "Semua";
  renderTable();
}

// ===============================
// AUTO LOAD SAAT HALAMAN DIBUKA
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  renderUsers();
  renderTable();
});
