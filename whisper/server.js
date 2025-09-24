const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
console.log("Utilisateurs chargés :", users);
let messages = [];

// Connexion utilisateur
app.post("/login", (req, res) => {
  const { qr_token, password } = req.body;
  const user = users.find(u => u.qr_token === qr_token && u.password === password);
  if (!user) return res.status(401).json({ error: "Identifiants invalides" });
  res.json({ ok: true, user_id: user.user_id });
});

// Envoi d’un message éphémère
app.post("/send-message", (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text) return res.status(400).json({ error: "from, to, text requis" });

  const message = { id: Date.now(), from, to, text };
  messages.push(message);

  io.to(to).emit("message", message);

  // Suppression après 10s côté serveur
  setTimeout(() => {
    messages = messages.filter(m => m.id !== message.id);
    io.to(to).emit("delete-message", message.id);
  }, 10000);

  res.json({ ok: true });
});

// Socket.io pour temps réel
io.on("connection", socket => {
  console.log("Utilisateur connecté :", socket.id);

  // Rejoindre un "room" correspondant à l'ID utilisateur
  socket.on("join", user_id => {
    socket.join(user_id);
  });
});

server.listen(3000, () => console.log("🚀 Serveur démarré sur http://localhost:3000"));
