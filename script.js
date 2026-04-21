let currentUser = "";


function login() {
  let name = document.getElementById("username").value;

  if (name.trim() === "") {
    alert("Digite um nome!");
    return;
  }

  currentUser = name;

  localStorage.setItem("user", name);

  entrar();
}

/

function entrar() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("welcome").innerText = "Olá, " + currentUser + " 👋";
}

/

window.onload = function () {
  let user = localStorage.getItem("user");

  if (user) {
    currentUser = user;
    entrar();
  }
};


function logout() {
  localStorage.removeItem("user");
  location.reload();
}


function send() {
  let msg = document.getElementById("msg").value;

  if (msg.trim() === "") return;

  let chat = document.getElementById("chat");

  let div = document.createElement("div");
  div.className = "message";

  div.innerText = currentUser + ": " + msg;

  chat.appendChild(div);

  document.getElementById("msg").value = "";

  chat.scrollTop = chat.scrollHeight;
}
