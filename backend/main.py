from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import các router từ các controllers
from .auth.controllers import router as auth_router
# from home.controllers import router as home_router
from .player.controllers import router as player_router
from .profile.controllers import router as profile_router

app = FastAPI(
    title="Musify API",
    description="API for Musify music streaming application",
    version="1.0.0"
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Musify Backend!"}

# Bao gồm các router từ các controllers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
# app.include_router(home_router, prefix="/api/home", tags=["Home"])
app.include_router(player_router, prefix="/api/player", tags=["Player"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
