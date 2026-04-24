/**
 * ============================================================================
 * NEKOHUB 🐾 - CORE ENGINE 3.0 (OPTIMIZED)
 * ============================================================================
 */

// =========================
// FIREBASE INIT
// =========================
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

// =========================
// DOM CACHE (performance)
// =========================
const DOM = {
    login: null,
    app: null,
    chat: null,
    msg: null,
    userName: null,
    userAvatar: null,
    title: null
};

// =========================
// STATE
// =========================
const State = {
    channel: "geral",
    user: null,
    listener: null,
    ref: null,
    lastScrollAtBottom: true
};

// =========================
// INIT DOM
// =========================
function initDOM() {
    DOM.login = document.getElementById("login");
    DOM.app = document.getElementById("app");
    DOM.chat = document.getElementById("chat");
    DOM.msg = document.getElementById("msg");
    DOM.userName = document.getElementById("userNameShort");
    DOM.userAvatar = document.getElementById("userAvatar");
    DOM.title = document.getElementById("currentGroupName");
}

// =========================
// AUTH
// =========================
const loginGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
};

const logout = () => auth.signOut();

auth.onAuthStateChanged((user) => {
    State.user = user;

    if (user) {
        DOM.login.hidden = true;
        DOM.app.hidden = false;

        DOM.userName.innerText = user.displayName?.split(" ")[0] || "User";
        DOM.userAvatar.src = user.photoURL || "https://via.placeholder.com/32";

        setupChannels();
        startChannel();
    } else {
        DOM.login.hidden = false;
        DOM.app.hidden = true;
        stopChannel();
    }
});

// =========================
// CHANNELS
// =========================
function setupChannels() {
    const list = document.getElementById("groupsList");

    db.ref("channels").on("value", (snap) => {
        list.innerHTML = "";

        renderChannel("geral", "geral");

        snap.forEach(child => {
            if (child.key !== "geral") {
                renderChannel(child.key, child.val().name);
            }
        });
    });
}

function renderChannel(id, name) {
    const list = document.getElementById("groupsList");

    const el = document.createElement("div");
    el.className = `group-item ${State.channel === id ? "active" : ""}`;
    el.dataset.id = id;
    el.innerHTML = `<i class="fas fa-hashtag"></i> <span>${name}</span>`;

    el.onclick = () => switchChannel(id, name);

    list.appendChild(el);
}

function switchChannel(id, name) {
    if (State.channel === id) return;

    stopChannel(); // sempre primeiro

    State.channel = id;

    DOM.title.innerText = `# ${name}`;
    DOM.msg.placeholder = `Conversar em #${name}`;

    document.querySelectorAll(".group-item").forEach(el => {
        el.classList.toggle("active", el.dataset.id === id);
    });

    startChannel();
}

// =========================
// CHAT ENGINE
// =========================
function send() {
    const text = DOM.msg.value.trim();
    const user = State.user;

    if (!text || !user) return;

    db.ref(`messages/${State.channel}`).push({
        uid: user.uid,
        user: user.displayName,
        text: text,
        time: firebase.database.ServerValue.TIMESTAMP
    });

    DOM.msg.value = "";
    DOM.msg.focus();
}

function startChannel() {
    if (!DOM.chat) return;

    DOM.chat.innerHTML = "";

    State.ref = db.ref(`messages/${State.channel}`).limitToLast(50);

    State.listener = State.ref.on("child_added", (snap) => {
        renderMessage(snap.val());
    });
}

function stopChannel() {
    if (State.ref && State.listener) {
        State.ref.off("child_added", State.listener);
        State.ref = null;
        State.listener = null;
    }
}

// =========================
// RENDER MESSAGE
// =========================
function renderMessage(data) {
    const isMe = data.uid === State.user?.uid;

    const div = document.createElement("div");
    div.className = `message ${isMe ? "sent" : "received"}`;

    div.innerHTML = `
        ${!isMe ? `<small>${escape(data.user)}</small>` : ""}
        <div class="msg-content">${escape(data.text)}</div>
    `;

    const shouldAutoScroll =
        DOM.chat.scrollTop + DOM.chat.clientHeight >= DOM.chat.scrollHeight - 80;

    DOM.chat.appendChild(div);

    if (shouldAutoScroll) {
        requestAnimationFrame(() => {
            DOM.chat.scrollTop = DOM.chat.scrollHeight;
        });
    }
}

// =========================
// SECURITY
// =========================
function escape(text) {
    return String(text).replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[m]));
}

// =========================
// EVENTS
// =========================
function initEvents() {
    document.getElementById("loginBtn").onclick = loginGoogle;
    document.getElementById("logoutBtn").onclick = logout;
    document.getElementById("sendBtn").onclick = send;

    DOM.msg.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            send();
        }
    });
}

// =========================
// BOOT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    initDOM();
    initEvents();
}); 
