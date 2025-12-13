from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token
)
from errors import (
    MissingToken,
    ExpiredToken,
    UnauthorizedAccess
)
from jwt import (
    ExpiredSignatureError,
    InvalidTokenError
)
import hmac

class AuthUtil:
    @staticmethod
    def generate_token(user_id: str, user_email: str, fname: str) -> dict:
        additional_claims = {
            "email": user_email,
            "fname": fname
        }
        access_token = create_access_token(identity=user_id, additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=user_id)

        return {'access_token': access_token, 'refresh_token': refresh_token}

    @staticmethod
    def generate_refresh(id, additional_claims: dict = None) -> dict:
        refreshed_token = create_access_token(identity=id, additional_claims=additional_claims, fresh=False)
        return {'access_token': refreshed_token}

    @staticmethod
    def validate_token(token:str):
        if not token:
            raise MissingToken()
        try:
            decoded = decode_token(token, allow_expired=False)
            return decoded

        except ExpiredSignatureError:
            raise ExpiredToken()

    @staticmethod
    def validate_authorization(user_id: str, token: str) -> None:
        """Validate user owns the resource they're accessing."""
        try:
            # Decode + verify token (signature, expiration, etc.)
            decoded = AuthUtil.validate_token(token)  # Should raise on invalid/expired
            token_user_id = decoded.get('sub')  # Standard JWT subject claim
            
            if not token_user_id:
                raise UnauthorizedAccess("Invalid token structure")
                
            if user_id != token_user_id:
                raise UnauthorizedAccess("User does not have access to record")
                
        except (InvalidTokenError, ExpiredSignatureError):
            raise UnauthorizedAccess("Invalid or expired token")