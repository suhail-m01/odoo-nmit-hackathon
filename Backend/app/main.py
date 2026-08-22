from fastapi import FastAPI  # type: ignore[import-not-found]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import-not-found]

app = FastAPI(
    title="Odoo NMIT HRMS",
    description="Employee and HR Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Odoo NMIT HRMS API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }