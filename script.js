
const users = {
  "G27S72": "Gustavo 🌟",
  "S58S78": "Sarah ❤️",
  "J37L47": "Jamilly 🧒",
  "A-WI299": "André 🧑"
};

let currentUser = "";


function login() {
  let code = document.getElementById("code").value;

  if (users[code]) {
    currentUser = users[code];

    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";

    document.getElementById("user").innerText = "Bem-vindo " + currentUser;

  } else {
    document.getElementById("error").innerText = "Código inválido!";
  }
}


function send() {
  let msg = document.getElementById("msg").value;

  let chat = document.getElementById("chat");

  let p = document.createElement("p");
  p.innerText = currentUser + ": " + msg;

  chat.appendChild(p);

  document.getElementById("msg").value = "";
}
