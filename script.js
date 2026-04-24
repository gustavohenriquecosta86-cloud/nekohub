/**
 * ============================================================================
 * NEKOHUB 🐾 - SCRIPT CORE (GLOBAL CHAT - MODO SÉRIO)
 * ============================================================================
 */

// 1. CONFIGURAÇÃO OFICIAL DO FIREBASE (Com a URL certa!)
const firebaseConfig = {
    apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
    authDomain: "nekohub-3dd91.firebaseapp.com",
    databaseURL: "https://nekohub-3dd91-default-rtdb.firebaseio.com",
    projectId: "nekohub-3dd91",
    storageBucket: "nekohub-3dd91.firebasestorage.app",
    messagingSenderId: "606476027160",
    appId: "1:606476027160:web:ed34a10668f358d89dca6d"
};

// 2. INICIALIZAÇÃO SEGURA
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// 3. ESTADO DO APP
const State = { 
    user: null, 
    dbPath: "chat_geral_global" // Mudei o caminho só pra começar um banco limpinho
};

// ==========================================
// CONTROLE DE TELAS (ONDE DAVA O ERRO BOBO)
// ==========================================
auth.onAuthStateChanged((user) => {
    const loginSection = document.getElementById("login");
    const appSection = document.getElementById("app");

    if (user) {
        // USUÁRIO LOGADO: Força a tela de login a sumir e o app a aparecer
        State.user = user;
        
        if (loginSection) loginSection.style.setProperty("display", "none", "important");
        if (appSection) {
            appSection.style.setProperty("display", "flex", "important");
            appSection.hidden = false;
        }

        // Carrega foto e nome no topo do chat
        document.getElementById("userAvatar").src = user.photoURL || "https://via.placeholder.com/30";
        document.getElementById("userNameShort").innerText = user.displayName.split(" ")[0];

        // Inicia a escuta das mensagens
        startChat();
    } else {
        // NINGUÉM LOGADO: Mostra só o login
        State.user = null;
        if (loginSection) loginSection.style.setProperty("display", "flex", "important");
        if (appSection) appSection.style.setProperty("display", "none", "important");
    }
});

// ==========================================
// BOTÕES DE LOGIN E LOGOUT
// ==========================================
document.getElementById("loginBtn").onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((error) => {
        console.error("Erro ao fazer login:", error);
        alert("Erro no login. Tente novamente.");
    });
};

document.getElementById("logoutBtn").onclick = () => {
    auth.signOut();
};

// ==========================================
// SISTEMA DE ENVIAR MENSAGENS
// ==========================================
function sendMessage() {
    const input = document.getElementById("msg");
    const text = input.value.trim();

    // Se o texto estiver vazio ou não tiver usuário, não faz nada
    if (!text || !State.user) return;

    // Envia pro Firebase
    db.ref(State.dbPath).push({
        user: State.user.displayName,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = ""; // Limpa a barra depois de enviar
        input.focus();    // Mantém o teclado aberto
    }).catch((error) => {
        console.error("Erro ao enviar:", error);
        alert("Erro ao enviar a mensagem. Verifique as regras do Firebase.");
    });
}

// Clicar no botão ou apertar Enter envia a mensagem
document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("msg").onkeypress = (e) => {
    if (e.key === "Enter") sendMessage();
};

// ==========================================
// RENDERIZAR O CHAT NA TELA
// ==========================================
function startChat() {
    const chatDiv = document.getElementById("chat");
    chatDiv.innerHTML = ""; // Limpa o chat antes de carregar pra não duplicar

    // Desliga escutas antigas e liga uma nova
    db.ref(State.dbPath).off();
    db.ref(State.dbPath).on("child_added", (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);
    });
}

function renderMessage(data) {
    const chatDiv = document.getElementById("chat");
    const msgEl = document.createElement("div");
    msgEl.className = "message";

    // Estrutura da mensagem igual ao Discord
    msgEl.innerHTML = `
        <span class="msg-user">${data.user}</span>
        <span class="msg-text">${data.text}</span>
    `;

    chatDiv.appendChild(msgEl);
    
    // Força a barra de rolagem descer para a última mensagem
    chatDiv.scrollTop = chatDiv.scrollHeight;
}
