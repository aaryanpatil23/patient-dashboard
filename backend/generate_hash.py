from auth import get_password_hash
password_to_hash = "patient123"
new_hash = get_password_hash(password_to_hash)
print("\n--- NEW PATIENT HASH ---")
print(new_hash)
print("------------------------\n")