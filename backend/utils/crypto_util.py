import hashlib
import hmac

class CryptoUtil:
    @staticmethod
    def generate_sha256_hash(input_string: str):
        sha256_hash = hashlib.sha256()
        sha256_hash.update(input_string.encode('utf-8'))
        return sha256_hash.hexdigest()   

    @staticmethod
    def safe_compare_hashes(hash1: str, hash2: str) -> bool:
        # Convert hex strings to bytes if necessary
        hash1_bytes = bytes.fromhex(hash1) if isinstance(hash1, str) else hash1
        hash2_bytes = bytes.fromhex(hash2) if isinstance(hash2, str) else hash2
        return hmac.compare_digest(hash1_bytes, hash2_bytes)