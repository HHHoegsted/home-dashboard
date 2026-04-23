from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import dashboard_router


app = FastAPI(
    title="Tablet Site Backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "tablet-site-backend is running"}


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}