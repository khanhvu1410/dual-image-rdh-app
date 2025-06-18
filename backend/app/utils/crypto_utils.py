import re
from base64 import b64encode, b64decode
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
from fastapi import HTTPException, status

class AESCipher:
    def __init__(self, key: str):
        # Convert the provided key to 32 bytes (AES-256)
        validate_encryption_key(key)
        self.key = pad(key.encode("utf-8"), AES.block_size)[:32]

    def encrypt(self, data: str):
        iv = get_random_bytes(AES.block_size)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        ct_bytes = cipher.encrypt(pad(data.encode("utf-8"), AES.block_size))
        iv_str = b64encode(iv).decode("utf-8")
        ct_str = b64encode(ct_bytes).decode("utf-8")
        return f"{iv_str}:{ct_str}"

    def decrypt(self, enc_data: str):
        try:
            iv_str, ct_str = enc_data.split(":")
            iv = b64decode(iv_str)
            ct = b64decode(ct_str)
            cipher = AES.new(self.key, AES.MODE_CBC, iv)
            pt = unpad(cipher.decrypt(ct), AES.block_size)
            return pt.decode("utf-8")
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password or the key file is incorrect.",
            )

def validate_encryption_key(key: str):
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be empty.",
        )

    if len(key) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must be at least 8 characters long.",
        )

    if not re.search(r'[A-Z]', key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 1 uppercase letter.",
        )

    if not re.search(r'[a-z]', key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 1 lowercase letter.",
        )

    if not re.search(r'[0-9]', key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 1 number.",
        )

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 1 special symbol.",
        )

    return key
