from fastapi import FastAPI

app = FastAPI(
    title="Odoo NMIT HRMS",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Odoo NMIT HRMS API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }