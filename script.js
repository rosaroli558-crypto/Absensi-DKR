// ==========================
// FIREBASE CONFIG
// ==========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "absensi-dkr-default.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr-default",
  storageBucket: "absensi-dkr-default.appspot.com",
  messagingSenderId: "MESSAGING_ID_KAMU",
  appId: "APP_ID_KAMU"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================
// USER MANAGEMENT
// ==========================

const userRef = ref(db, "users");

function renderUsers(snapshot) {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  snapshot.forEach(child => {
    const li = document.createElement("li");
    li.className = "user-item";

    li.innerHTML = `
      ${child.val().name}
      <button onclick="deleteUser('${child.key}')" class="btn-delete">X</button>
    `;

    userList.appendChild(li);
  });
}

onValue(userRef, snapshot => {
  renderUsers(snapshot);
});

window.addUser = function() {
  const input = document.getElementById("newUser");
  const name = input.value.trim();

  if (!name) return alert("Nama kosong");

  push(userRef, { name });
  input.value = "";
}

window.deleteUser = function(id) {
  remove(ref(db, "users/" + id));
}

// ==========================
// ABSENSI TABLE
// ==========================

const absenRef = ref(db, "absensi");

function renderTable(snapshot) {
  const tbody = document.getElementById("absenBody");
  tbody.innerHTML = "";

  let no = 1;

  snapshot.forEach(child => {
    const data = child.val();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${no++}</td>
      <td>${data.nama}</td>
      <td>${data.tanggal}</td>
      <td>${data.keterangan}</td>
      <td>
        <button onclick="deleteAbsensi('${child.key}')" class="btn-delete">
          Hapus
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

onValue(absenRef, snapshot => {
  renderTable(snapshot);
});

window.deleteAbsensi = function(id) {
  remove(ref(db, "absensi/" + id));
}
