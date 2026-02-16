import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 🔥 Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC88eNtWMuOQ4eezVriirq_sjjVOkfl8K8",
  authDomain: "absensi-dkr.firebaseapp.com",
  databaseURL: "https://absensi-dkr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-dkr",
  storageBucket: "absensi-dkr.firebasestorage.app",
  messagingSenderId: "824325578551",
  appId: "1:824325578551:web:3fa855eab199686e5d84b2"
};

// 🔥 Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const daftarRef = ref(db, "absensi/");
  const daftarBody = document.querySelector("#daftarAdmin tbody");
  const totalSpan = document.getElementById("total");

  onValue(daftarRef, (snapshot) => {
    const data = snapshot.val();
    daftarBody.innerHTML = "";

    if (!data) {
      totalSpan.textContent = 0;
      return;
    }

    const sortedData = Object.entries(data).sort((a,b) => new Date(b[1].waktu) - new Date(a[1].waktu));

    totalSpan.textContent = sortedData.length;

    sortedData.forEach(([id, peserta]) => {
      const tr = document.createElement("tr");

      // warna baris berdasarkan status
      let bgColor = "";
      switch(peserta.kegiatan){
        case "Hadir": bgColor = "#d4edda"; break;
        case "Izin": bgColor = "#fff3cd"; break;
        case "Sakit":
        case "Alfa": bgColor = "#f8d7da"; break;
      }
      tr.style.backgroundColor = bgColor;

      tr.innerHTML = `
        <td>${peserta.nama}</td>
        <td>${peserta.kegiatan}</td>
        <td>${peserta.waktu}</td>
        <td><button class="delete-btn">Hapus</button></td>
      `;

      // tombol hapus
      tr.querySelector(".delete-btn").onclick = () => {
        remove(ref(db, "absensi/" + id));
      };

      daftarBody.appendChild(tr);
    });
  });
});
