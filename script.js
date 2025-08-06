const firebaseConfig = {
  databaseURL: "https://chatmessageis-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let username = "";
let currentPrivateUser = null;

function login() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Digite um nome!");

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("chatScreen").style.display = "block";
  document.getElementById("userDisplay").innerText = username;
  document.getElementById("privateTo").innerText = "ninguém";

  const userRef = db.ref("onlineUsers/" + username);
  userRef.set(true);
  userRef.onDisconnect().remove();

  listenPublicMessages();
  listenOnlineUsers();
  listenPrivateMessages();
}

function sendPublicMessage() {
  const input = document.getElementById("publicInput");
  const text = input.value.trim();
  if (!text) return;

  db.ref("publicMessages").push({
    from: username,
    text,
    time: new Date().toISOString()
  });

  input.value = "";
}

function listenPublicMessages() {
  const container = document.getElementById("publicMessages");
  db.ref("publicMessages").on("child_added", snap => {
    const msg = snap.val();
    const p = document.createElement("p");
    p.innerText = `[${new Date(msg.time).toLocaleTimeString()}] ${msg.from}: ${msg.text}`;
    container.appendChild(p);
    container.scrollTop = container.scrollHeight;
  });
}

function listenOnlineUsers() {
  const container = document.getElementById("onlineUsers");
  db.ref("onlineUsers").on("value", snap => {
    const users = snap.val() || {};
    container.innerHTML = "<strong>Usuários online:</strong><br>";
    Object.keys(users).forEach(user => {
      if (user === username) return;
      const btn = document.createElement("button");
      btn.innerText = user;
      btn.onclick = () => startPrivateChat(user);
      container.appendChild(btn);
    });
  });
}

function startPrivateChat(targetUser) {
  currentPrivateUser = targetUser;
  document.getElementById("privateTo").innerText = targetUser;
  document.getElementById("privateMessages").innerHTML = "";
  listenPrivateMessages();
}

function sendPrivateMessage() {
  if (!currentPrivateUser) return alert("Escolha alguém para conversar.");

  const input = document.getElementById("privateInput");
  const text = input.value.trim();
  if (!text) return;

  const path = `privateMessages/${chatId(username, currentPrivateUser)}`;
  db.ref(path).push({
    from: username,
    to: currentPrivateUser,
    text,
    time: new Date().toISOString()
  });

  input.value = "";
}

function listenPrivateMessages() {
  db.ref("privateMessages").off();
  if (!currentPrivateUser) return;

  const path = `privateMessages/${chatId(username, currentPrivateUser)}`;
  const container = document.getElementById("privateMessages");

  db.ref(path).on("child_added", snap => {
    const msg = snap.val();
    const p = document.createElement("p");
    p.innerText = `[${new Date(msg.time).toLocaleTimeString()}] ${msg.from}: ${msg.text}`;
    container.appendChild(p);
    container.scrollTop = container.scrollHeight;
  });
}

function chatId(user1, user2) {
  return [user1, user2].sort().join("_");
}
