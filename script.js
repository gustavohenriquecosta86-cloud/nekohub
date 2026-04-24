/**
 * ============================================================================
 * NEKOHUB 🐾 - SCRIPT CORE v5.1 (GLOBAL CHAT ONLY)
 * ============================================================================
 */

// 1. CONFIGURAÇÃO FIREBASE (COM O ENDEREÇO CORRETO!)
const firebaseConfig = {
  apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
  authDomain: "nekohub-3dd91.firebaseapp.com",
  databaseURL: "https://nekohub-3dd91-default-rtdb.firebaseio.com",
  projectId: "nekohub-3dd91",
  storageBucket: "nekohub-3dd91.firebasestorage.app",
  messagingSenderId: "606476027160",
  appId: "1:606476027160:web:ed34a10668f358d89dca6d"
};

// Inicialização segura
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// 2. ESTADO DO APP
const State = {
    user: null,
    dbPath: "global_messages"
};

// 3. MONITOR DE AUTENTICAÇÃO
auth.onAuthStateChanged((user) => {
    const loginSection = document.getElementById("login");
    const appSection = document.getElementById("app");

    if (user) {
        State.user = user;
        loginSection.hidden = true;
        appSection.hidden = false;
        
        // Atualiza Perfil na UI
        document.getElementById("userAvatar").src = user.photoURL || "https://via.placeholder.com/30";
        document.getElementById("userNameShort").innerText = user.displayName.split(" ")[0];
        
        startChat(); // Inicia o chat assim que logar
    } else {
        State.user = null;
        loginSection.hidden = false;
        appSection.hidden = true;
    }
});

// 4. LÓGICA DE LOGIN / LOGOUT
document.getElementById("loginBtn").onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => console.error("Erro Login:", e));
};

document.getElementById("logoutBtn").onclick = () => {
    auth.signOut();
};

// 5. FUNÇÃO DE ENVIAR MENSAGEM
function sendMessage() {
    const input = document.getElementById("msg");
    const text = input.value.trim();

    if (!text || !State.user) return;

    db.ref(State.dbPath).push({
        user: State.user.displayName,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        input.value = ""; // Limpa o campo
    })
    .catch((error) => {
        console.error("Erro ao enviar:", error);
        alert("Erro ao enviar: Verifique as regras do Firebase.");
    });
}

// Escutas de Eventos (Botão e Tecla Enter)
document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("msg").onkeypress = (e) => {
    if (e.key === "Enter") sendMessage();
};

// 6. INICIAR E RENDERIZAR CHAT
function startChat() {
    const chatDiv = document.getElementById("chat");
    chatDiv.innerHTML = ""; // Limpa antes de carregar

    // Escuta novas mensagens (Removido o limitToLast para evitar inconsistência)
    db.ref(State.dbPath).on("child_added", (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);
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
    
    // Rola para o final automaticamente
    chatDiv.scrollTop = chatDiv.scrollHeight;
}
 
 
