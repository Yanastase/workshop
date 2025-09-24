let currentUser = null;
const socket = io();

// Login
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

    // Rejoindre sa room
    socket.emit("join", currentUser.user_id);

    alert("✅ Connexion réussie !");
  } catch (err) {
    console.error(err);
    alert("Erreur de connexion");
  }
});

// Envoi de message
document.getElementById("loginBtn").addEventListener("click", async () => {
  const qr_token = document.getElementById("qrInput").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!qr_token || !password) return alert("Veuillez remplir tous les champs !");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_token, password }) // ⬅️ clé exactement comme le back
    });

    const data = await res.json();
    if (!data.ok) return alert("❌ Identifiants incorrects !");

    // connexion réussie
    currentUser = { user_id: data.user_id };
    document.getElementById("login").style.display = "none";
    document.getElementById("messaging").style.display = "block";

    // rejoindre sa room Socket.io
    socket.emit("join", currentUser.user_id);

    alert("✅ Connexion réussie !");
  } catch (err) {
    console.error(err);
    alert("Erreur de connexion");
  }
});
