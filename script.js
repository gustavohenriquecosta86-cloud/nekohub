/**
 * ============================================================================
 * NEKOHUB 🐾 - GLOBAL CHAT ENGINE v5.0
 * Foco: Simplicidade, Estabilidade e Chat Único
 * ============================================================================
 */

const firebaseConfig = {
    apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
    authDomain: "nekohub-3dd91.firebaseapp.com",
    projectId: "nekohub-3dd91",
    storageBucket: "nekohub-3dd91.firebasestorage.app",
    messagingSenderId: "606476027160",
    appId: "1:606476027160:web:ed34a10668f358d89dca6d"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// 1. ESTADO SIMPLIFICADO (Apenas o necessário)
const State = {
    user: null,
    dbPath: "global_messages", // Caminho único para todas as mensagens
    isSending: false
};

// 2. AUTENTICAÇÃO
auth.onAuthStateChanged((user) => {
    const loginSection = document.getElementById("login");
    const appSection = document.getElementById("app");

    if (user) {
        State.user = user;
        loginSection.hidden = true;
        appSection.hidden = false;
        
        // UI do Perfil
        document.getElementById("userNameShort").innerText = user.displayName?.split(" ")[0] || "User";
        document.getElementById("userAvatar").src = user.photoURL || "https://via.placeholder.com/32";

        startChat();
    } else {
        loginSection.hidden = false;
        appSection.hidden = true;
    }
});

// 3. ENGINE DO CHAT (O FIX PARA O ERRO DE ENVIO)
function startChat() {
    const chatDiv = document.getElementById("chat");
    chatDiv.innerHTML = ""; // Limpa lixo visual

    // Escuta as mensagens no nó global
    db.ref(State.dbPath).limitToLast(50).on("child_added", (snapshot) => {
        const data = snapshot.val();
        renderMessage(data);
    });
}

function send() {
    const input = document.getElementById("msg");
    const text = input.value.trim();

    // Validações básicas para evitar erros
    if (!text || !State.user || State.isSending) return;

    State.isSending = true;

    // Envio direto para o nó GLOBAL
    db.ref(State.dbPath).push({
        uid: State.user.uid,
        user: State.user.displayName || "Anônimo",
        text: text,
        time: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = "";
        input.focus();
    }).catch(err => {
        console.error("Erro ao enviar:", err);
        alert("Erro ao enviar mensagem!");
    }).finally(() => {
        State.isSending = false;
    });
}

// 4. RENDERIZAÇÃO (Focada na sua nova UI)
function renderMessage(data) {
    const chat = document.getElementById("chat");
    const isMe = data.uid === State.user?.uid;

    const div = document.createElement("div");
    div.className = `message ${isMe ? "sent" : "received"}`;

    // Escapa HTML para segurança
    const cleanText = data.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    div.innerHTML = `
        ${!isMe ? `<small class="message-author">${data.user}</small>` : ""}
        <div class="msg-content">${cleanText}</div>
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// 5. INICIALIZAÇÃO E EVENTOS
document.getElementById("loginBtn").onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
};

document.getElementById("logoutBtn").onclick = () => auth.signOut();
document.getElementById("sendBtn").onclick = send;

document.getElementById("msg").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        send();
    }
});
