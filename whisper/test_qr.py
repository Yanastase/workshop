import qrcode

# Exemple rapide
img = qrcode.make("Hello Whisper")
img.save("test_qr.png")

print("QR code généré ✅")
