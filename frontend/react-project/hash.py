from werkzeug.security import generate_password_hash

password = "Admin@123"
hashed = generate_password_hash(password)
print(hashed)