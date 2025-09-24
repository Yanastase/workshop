# generator.py
import json
import random
import string
import qrcode
import os
from pathlib import Path

os.makedirs("qrcodes", exist_ok=True)

def generate_password(length=10):
    # lettres + chiffres + ponctuation minimale pour complexité
    alphabet = string.ascii_letters + string.digits
    return ''.join(random.choice(alphabet) for _ in range(length))

def generate_token(name, existing_tokens):
    # ABC-1234 format (3 letters from name + 4 digits)
    prefix = (name[:3] if len(name) >= 3 else name).upper()
    for _ in range(100):
        token = f"{prefix}-{random.randint(1000, 9999)}"
        if token not in existing_tokens:
            return token
    # fallback
    return f"{prefix}-{random.randint(1000, 9999)}"

new_users = ["aya", "noam", "lea", "amine", "khaled", "samira"]

users_file = Path("users.json")
if users_file.exists():
    users = json.loads(users_file.read_text(encoding="utf-8"))
else:
    users = []

existing_tokens = {u["qr_token"] for u in users}
existing_ids = {u["user_id"] for u in users}

for name in new_users:
    user_id = name.lower()
    if user_id in existing_ids:
        print(f"⚠️ {user_id} existe déjà. Ignoré.")
        continue

    qr_token = generate_token(name, existing_tokens)
    existing_tokens.add(qr_token)
    password = generate_password(10)

    user = {
        "user_id": user_id,
        "qr_token": qr_token,
        "password": password
    }
    users.append(user)
    existing_ids.add(user_id)

    # génère QR code vers une URL de login (exemple)
    auth_url = f"http://localhost:3000/use-qr?token={qr_token}&uid={user_id}"
    img = qrcode.make(auth_url)
    img_path = f"qrcodes/{user_id}_qr.png"
    img.save(img_path)

    print(f"✅ Utilisateur ajouté : {user_id} | Token: {qr_token} | Mot de passe: {password} | QR: {img_path}")

# sauvegarde
users_file.write_text(json.dumps(users, indent=2, ensure_ascii=False), encoding="utf-8")
print("\n📁 users.json mis à jour. QR codes dans /qrcodes")
