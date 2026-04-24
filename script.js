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

// --- LOGIN ---
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => console.error("Erro ao logar:", err));
}

function logout() {
  auth.signOut();
}

// --- CONTROLE DE INTERFACE (VIGIA) ---
auth.onAuthStateChanged((user) => {
  const loginSection = document.getElementById("login");
  const appSection = document.getElementById("app");

  if (user) {
    currentUser = user.displayName || user.email.split("@")[0];
    
    // Ajuste para o HTML novo (usando o atributo hidden)
    loginSection.hidden = true;
    appSection.hidden = false;

    document.getElementById("welcome").innerText = "Olá, " + currentUser + " 👋";
    startChat();
  } else {
    loginSection.hidden = false;
    appSection.hidden = true;
  }
});

// --- ENVIAR MENSAGEM ---
function send() {
  const input = document.getElementById("msg");
  const msg = input.value;

  if (!msg.trim() || !currentUser) return;

  db.ref("messages").push({
    user: currentUser,
    text: msg,
    time: Date.now()
  });

  input.value = "";
  input.focus(); // Mantém o foco no campo após enviar
}

// --- INICIAR CHAT ---
function startChat() {
  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  db.ref("messages").off();
  db.ref("messages").on("child_added", (snapshot) => {
    let data = snapshot.val();
    let div = document.createElement("div");
    
    // Define se a mensagem é minha ou de outro (para o CSS novo)
    const isMe = data.user === currentUser;
    div.className = `message ${isMe ? 'sent' : 'received'}`;

    div.innerHTML = `
      <small>${data.user}</small>
      <p>${data.text}</p>
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  });
}

// --- LIGAÇÃO DOS BOTÕES (O QUE ESTAVA FALTANDO!) ---
// Como o HTML não tem mais 'onclick', precisamos ligar aqui:
document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (sendBtn) sendBtn.addEventListener("click", send);
  if (loginBtn) loginBtn.addEventListener("click", loginGoogle);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
