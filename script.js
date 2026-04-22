const firebaseConfig = {
  apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
  authDomain: "nekohub-3dd91.firebaseapp.com",
  projectId: "nekohub-3dd91",
  storageBucket: "nekohub-3dd91.firebasestorage.app",
  messagingSenderId: "606476027160",
  appId: "1:606476027160:web:ed34a10668f358d89dca6d"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

let currentUser = "";

// LOGIN
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => console.log(err));
}

// CONTROLE DE LOGIN
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user.displayName || user.email.split("@")[0];

    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";

    document.getElementById("welcome").innerText =
      "Olá, " + currentUser + " 👋";

    startChat();
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

// LOGOUT
function logout() {
  auth.signOut();
}

// ENVIAR MENSAGEM
function send() {
  let msg = document.getElementById("msg").value;

  if (!msg.trim() || !currentUser) return;

  db.ref("messages").push({
    user: currentUser,
    text: msg,
    time: Date.now()
  });

  document.getElementById("msg").value = "";
}

// INICIAR CHAT
function startChat() {
  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  db.ref("messages").off();

  db.ref("messages").on("child_added", (snapshot) => {
    let data = snapshot.val();

    let div = document.createElement("div");
    div.className = "message";

    // 🔥 proteção contra bug de nome vazio
    let user = data.user || "Anônimo";
    let text = data.text || "";

    div.innerText = user + ": " + text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  });
} 
