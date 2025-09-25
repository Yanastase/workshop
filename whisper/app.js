let currentUser = null;
const socket = io();

// ---------- LOGIN ----------
document.getElementById("loginBtn").addEventListener("click", async () => {
  const qr_token = document.getElementById("qrInput").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!qr_token || !password) return alert("Veuillez remplir tous les champs !");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_token, password })
    });

    const data = await res.json();
    if (!data.ok) return alert("❌ Identifiants incorrects !");

    currentUser = { user_id: data.user_id };
    document.getElementById("login").style.display = "none";
    document.getElementById("messaging").style.display = "block";

    socket.emit("join", currentUser.user_id);

    alert("✅ Connexion réussie !");
  } catch (err) {
    console.error(err);
    alert("Erreur de connexion");
  }
});

// ---------- ENVOI DE MESSAGE ----------
document.getElementById("sendBtn").addEventListener("click", async () => {
  if (!currentUser) return alert("Vous devez être connecté !");

  const to = document.getElementById("recipient").value.trim();
  const text = document.getElementById("messageText").value.trim();

  if (!to || !text) return alert("Veuillez remplir tous les champs !");

  try {
    await fetch("/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: currentUser.user_id, to, text })
    });

    //Message visible pour l’expéditeur
    displayMessage({
      id: Date.now(),
      from: currentUser.user_id,
      to,
      text
    });

    document.getElementById("messageText").value = "";
  } catch (err) {
    console.error(err);
  }
});

// ---------- RÉCEPTION DES MESSAGES ----------
socket.on("message", message => displayMessage(message));
socket.on("delete-message", id => {
  const msgDiv = document.getElementById(id);
  if (msgDiv) msgDiv.remove();
});

// ---------- AFFICHAGE D’UN MESSAGE ----------
function displayMessage(message) {
  const container = document.getElementById("inbox");
  const div = document.createElement("div");
  div.className = "chat-bubble";
  div.id = message.id;
    
    if (currentUser && message.from === currentUser.user_id) {
      div.classList.add("sent");
      div.innerHTML = `<span class="chat-meta">Moi → ${message.to}</span><br><span class="chat-text">${message.text}</span>`;
    } else {
      div.classList.add("received");
      div.innerHTML = `<span class="chat-meta">${message.from} → Moi</span><br><span class="chat-text">${message.text}</span>`;
    }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
    setTimeout(() => div.remove(), 60000); // 1 minute
}
