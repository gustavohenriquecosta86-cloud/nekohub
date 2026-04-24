// CONFIGURAÇÃO
const firebaseConfig = {
  apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
  authDomain: "nekohub-3dd91.firebaseapp.com",
  projectId: "nekohub-3dd91",
  storageBucket: "nekohub-3dd91.firebasestorage.app",
  messagingSenderId: "606476027160",
  appId: "1:606476027160:web:ed34a10668f358d89dca6d"
};

// Inicialização
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// --- FUNÇÕES DE AUTH ---
const loginGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => console.error("Erro Login:", err));
};

const logout = () => auth.signOut();

// --- VIGIA DE ESTADO ---
auth.onAuthStateChanged((user) => {
  const loginSection = document.getElementById("login");
  const appSection = document.getElementById("app");
  const welcomeText = document.getElementById("welcome");

  if (user) {
    console.log("Usuário logado:", user.displayName);
    loginSection.hidden = true;
    appSection.hidden = false;
    welcomeText.innerText = `Olá, ${user.displayName.split(' ')[0]} 👋`;
    startChat();
  } else {
    loginSection.hidden = false;
    appSection.hidden = true;
  }
});

// --- ENVIAR MENSAGEM (VERSÃO BLINDADA) ---
function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  const user = auth.currentUser; // Pega o usuário direto do Firebase, sem erro de variável global

  if (!text) return; // Se não tem texto, não faz nada
  
  if (!user) {
    console.error("Erro: Nenhum usuário autenticado encontrado!");
    return;
  }

  console.log("Tentando enviar:", text);

  db.ref("messages").push({
    user: user.displayName,
    uid: user.uid, // Guardamos o ID único por segurança
    text: text,
    time: Date.now()
  })
  .then(() => {
    console.log("Mensagem enviada com sucesso!");
    input.value = "";
    input.focus();
  })
  .catch((error) => {
    console.error("Erro ao gravar no Firebase:", error);
    alert("Erro ao enviar! Verifique o console.");
  });
}

// --- ESCUTAR MENSAGENS ---
function startChat() {
  const chat = document.getElementById("chat");
  
  db.ref("messages").off(); // Limpa escutas antigas
  db.ref("messages").limitToLast(30).on("child_added", (snapshot) => {
    const data = snapshot.val();
    const div = document.createElement("div");
    
    // Identifica se a mensagem é minha usando o UID (mais seguro que o nome)
    const isMe = data.uid === auth.currentUser?.uid;
    div.className = `message ${isMe ? 'sent' : 'received'}`;

    div.innerHTML = `
      <small style="display:block; font-size:10px; opacity:0.6">${data.user}</small>
      <span>${data.text}</span>
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  });
}

// --- LIGAÇÃO DOS EVENTOS (SEM ERRO DE CARREGAMENTO) ---
// Usamos uma função que roda assim que o script carrega para garantir os cliques
function setupEventListeners() {
    const btnSend = document.getElementById("sendBtn");
    const btnLogin = document.getElementById("loginBtn");
    const btnLogout = document.getElementById("logoutBtn");
    const inputMsg = document.getElementById("msg");

    if (btnSend) btnSend.onclick = send;
    if (btnLogin) btnLogin.onclick = loginGoogle;
    if (btnLogout) btnLogout.onclick = logout;
    
    if (inputMsg) {
        inputMsg.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); // Evita quebra de linha
                send();
            }
        };
    }
}

// Inicia os ouvintes de clique
setupEventListeners();
 
