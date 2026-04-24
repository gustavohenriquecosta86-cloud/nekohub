/**
 * ============================================================================
 * NEKOHUB 🐾 - SCRIPT CORE v5.1 (GLOBAL CHAT ONLY)
 * ============================================================================
 */

// 1. CONFIGURAÇÃO (Mantendo seus dados originais)
const firebaseConfig = {
    apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
    authDomain: "nekohub-3dd91.firebaseapp.com",
    projectId: "nekohub-3dd91",
    storageBucket: "nekohub-3dd91.firebasestorage.app",
    messagingSenderId: "606476027160",
    appId: "1:606476027160:web:ed34a10668f358d89dca6d"
};

// Inicializa Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 2. ESTADO DO APP
const State = {
    user: null,
    dbPath: "global_messages" // Caminho único no Firebase para não dar erro
};

// 3. MONITOR DE AUTENTICAÇÃO
auth.onAuthStateChanged((user) => {
    const loginSection = document.getElementById("login");
    const appSection = document.getElementById("app");

    if (user) {
        State.user = user;
        loginSection.hidden = true;
        appSection.hidden = false;
        
        // Atualiza UI do Perfil
        document.getElementById("userNameShort").innerText = user.displayName?.split(" ")[0] || "User";
        document.getElementById("userAvatar").src = user.photoURL || "https://via.placeholder.com/32";

        startChat(); // Começa a ouvir as mensagens
    } else {
        State.user = null;
        loginSection.hidden = false;
        appSection.hidden = true;
    }
});

// 4. LOGICA DO CHAT
function startChat() {
    const chatDiv = document.getElementById("chat");
    
    // Remove qualquer escuta antiga para não duplicar mensagens
    db.ref(State.dbPath).off();

    // Escuta as últimas 50 mensagens
    db.ref(State.dbPath).limitToLast(50).on("child_added", (snapshot) => {
        renderMessage(snapshot.val());
    });
}

// FUNÇÃO DE ENVIAR (Onde estava dando erro)
function sendMessage() {
    const input = document.getElementById("msg");
    const text = input.value.trim();

    // Se não tiver texto ou usuário não estiver logado, para aqui
    if (!text || !State.user) return;

    // Envia para o Firebase
    db.ref(State.dbPath).push({
        uid: State.user.uid,
        user: State.user.displayName || "Anônimo",
        text: text,
        time: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        input.value = ""; // Limpa o campo
        input.focus();    // Devolve o foco para o teclado
    })
    .catch((error) => {
        console.error("Erro ao enviar:", error);
        alert("Erro ao enviar! Verifique sua conexão.");
    });
}

// 5. RENDERIZAÇÃO NA TELA
function renderMessage(data) {
    const chat = document.getElementById("chat");
    const isMe = data.uid === State.user?.uid;

    const div = document.createElement("div");
    div.className = `message ${isMe ? "sent" : "received"}`;

    // Proteção contra XSS (Script injetado)
    const safeText = data.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    div.innerHTML = `
        ${!isMe ? `<small class="message-author">${data.user}</small>` : ""}
        <div class="msg-content">${safeText}</div>
    `;

    chat.appendChild(div);
    
    // Auto-scroll para a última mensagem
    chat.scrollTop = chat.scrollHeight;
}

// 6. EVENTOS (Botões e Teclado)
document.getElementById("loginBtn").onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
};

document.getElementById("logoutBtn").onclick = () => auth.signOut();

document.getElementById("sendBtn").onclick = (e) => {
    e.preventDefault();
    sendMessage();
};

// Enviar ao apertar ENTER
document.getElementById("msg").onkeydown = (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
};
 
