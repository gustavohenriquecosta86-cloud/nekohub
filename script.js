/**
 * ============================================================================
 * NEKOHUB 🐾 - CORE ENGINE 4.0 (PRODUCTION READY)
 * ============================================================================
 * @description Chat em tempo real com Firebase, multi-canais e segurança
 * @version 4.0.0
 */

// =========================
// CONFIG & CONSTANTS
// =========================
const CONFIG = {
    firebase: {
        apiKey: "AIzaSyDpIgKw6YiLwmrGwrtnSIuGlJBmyjwfHcc",
        authDomain: "nekohub-3dd91.firebaseapp.com",
        projectId: "nekohub-3dd91",
        storageBucket: "nekohub-3dd91.firebasestorage.app",
        messagingSenderId: "606476027160",
        appId: "1:606476027160:web:ed34a10668f358d89dca6d"
    },
    limits: {
        messagesPerChannel: 50,
        autoScrollThreshold: 80,
        debounceDelay: 300
    },
    ui: {
        defaultAvatar: "https://via.placeholder.com/32",
        defaultUserName: "User"
    }
};

// =========================
// FIREBASE INIT
// =========================
if (!firebase.apps.length) {
    firebase.initializeApp(CONFIG.firebase);
}

const auth = firebase.auth();
const db = firebase.database();

// =========================
// DOM CACHE (Performance)
// =========================
const DOM = {
    login: null,
    app: null,
    chat: null,
    msgInput: null,
    userName: null,
    userAvatar: null,
    title: null,
    groupsList: null,
    sendBtn: null,
    loginBtn: null,
    logoutBtn: null,

    // Inicializa referências do DOM
    init() {
        this.login = document.getElementById("login");
        this.app = document.getElementById("app");
        this.chat = document.getElementById("chat");
        this.msgInput = document.getElementById("msg");
        this.userName = document.getElementById("userNameShort");
        this.userAvatar = document.getElementById("userAvatar");
        this.title = document.getElementById("currentGroupName");
        this.groupsList = document.getElementById("groupsList");
        this.sendBtn = document.getElementById("sendBtn");
        this.loginBtn = document.getElementById("loginBtn");
        this.logoutBtn = document.getElementById("logoutBtn");

        this.validateInit();
    },

    // Valida se todos os elementos foram encontrados
    validateInit() {
        const required = ["login", "app", "chat", "msgInput", "sendBtn", "loginBtn", "logoutBtn"];
        const missing = required.filter(key => !this[key]);

        if (missing.length > 0) {
            Logger.error(`DOM elements missing: ${missing.join(", ")}`);
        }
    }
};

// =========================
// STATE MANAGEMENT
// =========================
const State = {
    channel: "geral",
    user: null,
    ref: null,
    listener: null,
    isLoading: false,
    typingTimeout: null,

    // Trocar canal com validações
    switchChannel(id, name) {
        if (this.channel === id) return;
        this.stopListening();
        this.channel = id;
        return { id, name };
    },

    // Parar de ouvir mensagens
    stopListening() {
        if (this.ref && this.listener) {
            this.ref.off("child_added", this.listener);
            this.ref = null;
            this.listener = null;
        }
    },

    // Reset completo do estado
    reset() {
        this.stopListening();
        this.channel = "geral";
        this.user = null;
        this.isLoading = false;
    }
};

// =========================
// LOGGER (Debug & Errors)
// =========================
const Logger = {
    isDev: true, // Mude para false em produção

    log(...args) {
        if (this.isDev) console.log("🐾 [NekoHub]", ...args);
    },

    warn(...args) {
        console.warn("⚠️ [NekoHub]", ...args);
    },

    error(...args) {
        console.error("❌ [NekoHub]", ...args);
    },

    success(...args) {
        if (this.isDev) console.log("✅ [NekoHub]", ...args);
    }
};

// =========================
// SECURITY & VALIDATION
// =========================
const Security = {
    // Escapar HTML para prevenir XSS
    escape(text) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    },

    // Validar mensagem antes de enviar
    validateMessage(text) {
        if (!text) return { valid: false, error: "Mensagem vazia" };
        if (text.length > 2000) return { valid: false, error: "Mensagem muito longa (máx 2000)" };
        if (text.trim().length === 0) return { valid: false, error: "Apenas espaços em branco" };
        return { valid: true };
    },

    // Validar canal
    validateChannel(id) {
        if (!id || typeof id !== "string") return false;
        if (id.length > 50) return false;
        return /^[a-z0-9_-]+$/.test(id);
    },

    // Sanitizar dados do Firebase
    sanitizeMessage(data) {
        return {
            uid: String(data.uid || ""),
            user: this.escape(data.user || "Anônimo"),
            text: this.escape(data.text || ""),
            time: Number(data.time || Date.now())
        };
    }
};

// =========================
// UI HELPERS
// =========================
const UI = {
    // Mostrar/ocultar seções
    toggleSection(showElement, hideElements = []) {
        if (showElement) showElement.hidden = false;
        hideElements.forEach(el => {
            if (el) el.hidden = true;
        });
    },

    // Atualizar informações do usuário
    updateUserInfo(user) {
        if (!user) return;

        const firstName = user.displayName?.split(" ")[0] || CONFIG.ui.defaultUserName;
        const avatar = user.photoURL || CONFIG.ui.defaultAvatar;

        DOM.userName.innerText = firstName;
        DOM.userAvatar.src = avatar;
        DOM.userAvatar.alt = firstName;

        Logger.success(`Usuário atualizado: ${firstName}`);
    },

    // Mostrar indicador de carregamento
    setLoading(isLoading) {
        State.isLoading = isLoading;
        if (DOM.sendBtn) {
            DOM.sendBtn.disabled = isLoading;
            DOM.sendBtn.innerHTML = isLoading ? "⏳ Enviando..." : "Enviar";
        }
    },

    // Exibir notificação (toast)
    notify(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: ${type === "error" ? "#ff4444" : "#44aa44"};
            color: white;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// =========================
// AUTHENTICATION
// =========================
const Auth = {
    // Login com Google
    async loginGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            await auth.signInWithPopup(provider);
            Logger.success("Login realizado com sucesso");
        } catch (error) {
            Logger.error("Erro no login:", error.message);
            UI.notify("Erro ao fazer login", "error");
        }
    },

    // Logout
    async logout() {
        try {
            await auth.signOut();
            State.reset();
            Logger.success("Logout realizado");
        } catch (error) {
            Logger.error("Erro ao fazer logout:", error);
        }
    },

    // Monitorar mudanças de autenticação
    onAuthStateChanged() {
        auth.onAuthStateChanged((user) => {
            State.user = user;

            if (user) {
                this.handleLogin(user);
            } else {
                this.handleLogout();
            }
        });
    },

    handleLogin(user) {
        UI.toggleSection(DOM.app, [DOM.login]);
        UI.updateUserInfo(user);
        Channels.setup();
        Chat.startChannel();
        Logger.success("App inicializado");
    },

    handleLogout() {
        UI.toggleSection(DOM.login, [DOM.app]);
        Chat.stopChannel();
        DOM.chat.innerHTML = "";
        Logger.log("Usuário desconectado");
    }
};

// =========================
// CHANNELS MANAGEMENT
// =========================
const Channels = {
    // Configurar lista de canais
    async setup() {
        try {
            const list = DOM.groupsList;
            if (!list) return;

            db.ref("channels").on("value", (snap) => {
                list.innerHTML = "";
                this.renderChannel("geral", "🏠 Geral");

                snap.forEach(child => {
                    if (child.key !== "geral") {
                        this.renderChannel(child.key, child.val().name);
                    }
                });

                this.highlightActive();
            });
        } catch (error) {
            Logger.error("Erro ao carregar canais:", error);
        }
    },

    // Renderizar item de canal
    renderChannel(id, name) {
        if (!Security.validateChannel(id)) return;

        const list = DOM.groupsList;
        const el = document.createElement("div");

        el.className = "group-item";
        el.dataset.id = id;
        el.innerHTML = `
            <i class="fas fa-hashtag"></i>
            <span>${Security.escape(name)}</span>
        `;

        el.addEventListener("click", () => this.switchTo(id, name), { once: false });
        list.appendChild(el);
    },

    // Mudar para canal
    switchTo(id, name) {
        const channel = State.switchChannel(id, name);
        if (!channel) return;

        DOM.title.innerText = `# ${Security.escape(name)}`;
        DOM.msgInput.placeholder = `Conversar em #${Security.escape(name)}`;

        this.highlightActive();
        Chat.startChannel();
    },

    // Destacar canal ativo
    highlightActive() {
        document.querySelectorAll(".group-item").forEach(el => {
            el.classList.toggle("active", el.dataset.id === State.channel);
        });
    }
};

// =========================
// CHAT ENGINE
// =========================
const Chat = {
    // Enviar mensagem
    async send() {
        const text = DOM.msgInput.value.trim();
        const validation = Security.validateMessage(text);

        if (!validation.valid) {
            Logger.warn(validation.error);
            return;
        }

        if (!State.user) {
            UI.notify("Faça login para enviar mensagens", "error");
            return;
        }

        UI.setLoading(true);

        try {
            await db.ref(`messages/${State.channel}`).push({
                uid: State.user.uid,
                user: State.user.displayName || "Anônimo",
                text: text,
                time: firebase.database.ServerValue.TIMESTAMP
            });

            DOM.msgInput.value = "";
            DOM.msgInput.focus();
            Logger.success("Mensagem enviada");
        } catch (error) {
            Logger.error("Erro ao enviar mensagem:", error);
            UI.notify("Erro ao enviar mensagem", "error");
        } finally {
            UI.setLoading(false);
        }
    },

    // Iniciar escuta de mensagens
    startChannel() {
        try {
            if (!DOM.chat) return;

            DOM.chat.innerHTML = "";
            this.stopChannel();

            State.ref = db.ref(`messages/${State.channel}`).limitToLast(CONFIG.limits.messagesPerChannel);

            State.listener = State.ref.on("child_added", (snap) => {
                this.renderMessage(snap.val());
            });

            Logger.log(`Escutando canal: ${State.channel}`);
        } catch (error) {
            Logger.error("Erro ao iniciar canal:", error);
        }
    },

    // Parar de escutar
    stopChannel() {
        State.stopListening();
        Logger.log("Escuta de canal parada");
    },

    // Renderizar mensagem no chat
    renderMessage(data) {
        if (!data || !data.text) return;

        const sanitized = Security.sanitizeMessage(data);
        const isMe = sanitized.uid === State.user?.uid;

        const div = document.createElement("div");
        div.className = `message ${isMe ? "sent" : "received"}`;
        div.setAttribute("data-uid", sanitized.uid);

        div.innerHTML = `
            ${!isMe ? `<small class="message-author">${sanitized.user}</small>` : ""}
            <div class="msg-content">${sanitized.text}</div>
            <tiny class="message-time">${this.formatTime(sanitized.time)}</tiny>
        `;

        DOM.chat.appendChild(div);
        this.autoScroll();
    },

    // Auto-scroll inteligente
    autoScroll() {
        const shouldScroll =
            DOM.chat.scrollTop + DOM.chat.clientHeight >=
            DOM.chat.scrollHeight - CONFIG.limits.autoScrollThreshold;

        if (shouldScroll) {
            requestAnimationFrame(() => {
                DOM.chat.scrollTop = DOM.chat.scrollHeight;
            });
        }
    },

    // Formatar timestamp
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "agora";
        if (minutes < 60) return `${minutes}m`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;

        const date = new Date(timestamp);
        return date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
};

// =========================
// EVENT LISTENERS
// =========================
const Events = {
    init() {
        this.attachButtons();
        this.attachInput();
        this.attachKeyboard();
    },

    attachButtons() {
        DOM.loginBtn?.addEventListener("click", () => Auth.loginGoogle());
        DOM.logoutBtn?.addEventListener("click", () => Auth.logout());
        DOM.sendBtn?.addEventListener("click", () => Chat.send());
    },

    attachInput() {
        if (DOM.msgInput) {
            DOM.msgInput.addEventListener("focus", () => {
                DOM.msgInput.parentElement.classList.add("focused");
            });

            DOM.msgInput.addEventListener("blur", () => {
                DOM.msgInput.parentElement.classList.remove("focused");
            });
        }
    },

    attachKeyboard() {
        DOM.msgInput?.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                Chat.send();
            }
            // Shift+Enter para quebra de linha
        });
    }
};

// =========================
// INITIALIZATION
// =========================
const App = {
    async init() {
        try {
            Logger.log("🚀 Inicializando NekoHub 4.0...");

            // 1. Carregar DOM
            DOM.init();

            // 2. Inicializar eventos
            Events.init();

            // 3. Configurar autenticação
            Auth.onAuthStateChanged();

            Logger.success("NekoHub inicializado com sucesso!");
        } catch (error) {
            Logger.error("Erro fatal na inicialização:", error);
            UI.notify("Erro ao carregar a aplicação", "error");
        }
    }
};

// =========================
// BOOT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});

// Cleanup ao descarregar página
window.addEventListener("beforeunload", () => {
    State.reset();
});
