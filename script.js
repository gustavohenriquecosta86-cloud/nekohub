/**
 * NEKOHUB 🐾 - SCRIPT CORE v5.2
 */

const firebaseConfig = {
  apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
  authDomain: "nekohub-3dd91.firebaseapp.com",
  databaseURL: "https://nekohub-3dd91-default-rtdb.firebaseio.com",
  projectId: "nekohub-3dd91",
  storageBucket: "nekohub-3dd91.firebasestorage.app",
  messagingSenderId: "606476027160",
  appId: "1:606476027160:web:ed34a10668f358d89dca6d"
};

// Inicialização
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const State = { user: null, dbPath: "global_messages" };

// --- MONITOR DE LOGIN ---
auth.onAuthStateChanged((user) => {
    console.log("Status da conta mudou. Usuário:", user ? user.displayName : "Ninguém");
    
    const loginSection = document.getElementById("login");
    const appSection = document.getElementById("app");

    if (user) {
        State.user = user;
        // ESCONDE LOGIN E MOSTRA APP
        if(loginSection) loginSection.style.display = "none";
        if(appSection) {
            appSection.hidden = false;
            appSection.style.display = "flex";
        }
        
        // Dados do Usuário
        document.getElementById("userAvatar").src = user.photoURL || "";
        document.getElementById("userNameShort").innerText = user.displayName.split(" ")[0];
        
        console.log("Entrando no chat...");
        startChat();
    } else {
        // MOSTRA LOGIN E ESCONDE APP
        if(loginSection) loginSection.style.display = "flex";
        if(appSection) appSection.style.display = "none";
    }
});

// --- BOTÕES ---
document.getElementById("loginBtn").onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert("Erro no Login: " + e.message));
};

document.getElementById("logoutBtn").onclick = () => auth.signOut();

function sendMessage() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (!text || !State.user) return;

    db.ref(State.dbPath).push({
        user: State.user.displayName,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = "";
    });
}

document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("msg").onkeypress = (e) => { if (e.key === "Enter") sendMessage(); };

// --- LOGICA DO CHAT ---
function startChat() {
    const chatDiv = document.getElementById("chat");
    db.ref(State.dbPath).off();
    db.ref(State.dbPath).on("child_added", (snap) => {
        renderMessage(snap.val());
    });
}

function renderMessage(data) {
    const chatDiv = document.getElementById("chat");
    const msgEl = document.createElement("div");
    msgEl.className = "message";
    msgEl.innerHTML = `
        <span class="msg-user">${data.user}</span>
        <span class="msg-text">${data.text}</span>
    `;
    chatDiv.appendChild(msgEl);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}
 
