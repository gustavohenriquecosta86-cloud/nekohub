<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
    authDomain: "nekohub-3dd91.firebaseapp.com",
    projectId: "nekohub-3dd91",
    storageBucket: "nekohub-3dd91.firebasestorage.app",
    messagingSenderId: "606476027160",
    appId: "1:606476027160:web:ed34a10668f358d89dca6d"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> 

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let currentUser = "";

// 🔵 LOGIN GOOGLE
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      currentUser = user.displayName || user.email.split("@")[0];

      entrar();
    });
}

// 🟢 ENTRAR NO APP
function entrar() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("welcome").innerText =
    "Olá, " + currentUser + " 👋";
}

// 🔵 AUTO LOGIN
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user.displayName || user.email.split("@")[0];
    entrar();
  }
});

// 🔴 LOGOUT
function logout() {
  auth.signOut();
  location.reload();
}

// 💬 CHAT
function send() {
  let msg = document.getElementById("msg").value;

  if (!msg.trim()) return;

  let chat = document.getElementById("chat");

  let div = document.createElement("div");
  div.className = "message";

  div.innerText = currentUser + ": " + msg;

  chat.appendChild(div);

  document.getElementById("msg").value = "";

  chat.scrollTop = chat.scrollHeight;
}
