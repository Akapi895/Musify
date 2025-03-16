from typing import Dict
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    status: str
    data: Dict

class RegisterRequest(BaseModel):
    username: str
    fullname: str
    email: str
    dob: str
    password: str
    confirm_password: str

class RegisterResponse(BaseModel):
    status: str
    data: Dict