# app/schemas.py
from pydantic import BaseModel

# Untuk input (request body)
class UserCreate(BaseModel):
    username: str
    email: str

# Untuk output (response)
class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True   # supaya bisa langsung dari SQLAlchemy model
