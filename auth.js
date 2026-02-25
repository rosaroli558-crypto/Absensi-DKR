import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth = getAuth(app);
const ADMIN_EMAIL = "admin.dkr@2025.local";

/* ================= LOGIN ================= */

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => window.location.href = "admin.html")
      .catch(err => alert("Login gagal: " + err.message));
  });
}

/* ================= PROTEKSI GLOBAL ================= */

onAuthStateChanged(auth, (user) => {

  const isLoginPage = window.location.pathname.includes("login.html");

  // Belum login dan bukan di login page
  if (!user && !isLoginPage) {
    window.location.href = "login.html";
    return;
  }

  // Sudah login tapi bukan admin
  if (user && user.email !== ADMIN_EMAIL) {
    alert("Anda bukan admin.");
    signOut(auth);
    return;
  }

  // Sudah login dan admin tapi masih di login page
  if (user && user.email === ADMIN_EMAIL && isLoginPage) {
    window.location.href = "admin.html";
  }

});

/* ================= LOGOUT ================= */

window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
