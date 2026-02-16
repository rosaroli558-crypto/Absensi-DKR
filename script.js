// Kirim data
window.absen = function() {
  const nama = document.getElementById("nama").value.trim();

  if (nama === "") {
    alert("Nama wajib diisi");
    return;
  }

  push(ref(db, "absensi/"), {
    nama: nama,
    waktu: new Date().toLocaleString()
  });

  document.getElementById("nama").value = "";
};

// Ambil & tampilkan data realtime
const daftarRef = ref(db, "absensi/");
onValue(daftarRef, (snapshot) => {
  const data = snapshot.val();
  const daftar = document.getElementById("daftar");

  daftar.innerHTML = "";

  if (!data) return; // 🔥 cegah error kalau kosong

  for (let id in data) {
    const li = document.createElement("li");
    li.textContent = data[id].nama + " - " + data[id].waktu;
    daftar.appendChild(li);
  }
});
