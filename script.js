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

// CONTROLE TOTAL DO LOGIN
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

// ENVIAR
function send() {
  let msg = document.getElementById("msg").value;

  if (!msg.trim()) return;

  db.ref("messages").push({
    user: currentUser,
    text: msg,
    time: Date.now()
  });

  document.getElementById("msg").value = "";
}

// CHAT TEMPO REAL
function startChat() {
  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  db.ref("messages").off(); // limpa duplicação

  db.ref("messages").on("child_added", (snapshot) => {
    let data = snapshot.val();

    let div = document.createElement("div");
    div.className = "message";
    div.innerText = data.user + ": " + data.text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  });
}

// ÚNICO ponto de controle de autenticação
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user.displayName || user.email.split("@")[0];
    entrar();
  } else {
    // Usuário deslogado - voltar ao login
    document.getElementById("login").style.display = "block";
    document.getElementById("app").style.display = "none";
    stopMessagesListener();
    document.getElementById("chat").innerHTML = ""; // Limpar chat
  }
}); 

function logout() {
  auth.signOut();
}

function send() {
  let msg = document.getElementById("msg").value;

  if (!msg.trim()) return;

  db.ref("messages").push({
    user: currentUser,
    text: msg,
    time: Date.now()
  });

  document.getElementById("msg").value = "";
}

// INICIAR LISTENER APENAS APÓS AUTENTICAÇÃO
function startMessagesListener() {
  if (messagesListener) return; // Evitar listeners duplicados
  
  document.getElementById("chat").innerHTML = ""; // Limpar antes de iniciar
  
  messagesListener = db.ref("messages").on("child_added", (snapshot) => {
    let data = snapshot.val();
    let chat = document.getElementById("chat");

    let div = document.createElement("div");
    div.className = "message";
    div.innerText = data.user + ": " + data.text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  });
}

function stopMessagesListener() {
  if (messagesListener) {
    db.ref("messages").off("child_added", messagesListener);
    messagesListener = null;
  }
}
