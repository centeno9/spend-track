from fastapi import FastAPI

from app.routers import extract, debug

app = FastAPI()

app.include_router(extract.router)
app.include_router(debug.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
