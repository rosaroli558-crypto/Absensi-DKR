import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Konfigurasi Firebase
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

const daftarRef = ref(db, "absensi/");

onValue(daftarRef, (snapshot) => {

  const data = snapshot.val();
  const daftar = document.getElementById("daftarAdmin");
  const total = document.getElementById("total");

  daftar.innerHTML = "";

  if (!data) {
    total.textContent = 0;
    return;
  }

  const keys = Object.keys(data);
  total.textContent = keys.length;

  keys.forEach((id) => {

    const li = document.createElement("li");

    li.textContent =
      data[id].nama +
      " | " +
      data[id].kegiatan +
      " | " +
      data[id].waktu;

    const btn = document.createElement("button");
    btn.textContent = "Hapus";
    btn.style.marginLeft = "10px";

    btn.onclick = function() {
      remove(ref(db, "absensi/" + id));
    };

    li.appendChild(btn);
    daftar.appendChild(li);

  });

});
