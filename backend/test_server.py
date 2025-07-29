from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

@app.get("/")
async def root():
    return {"message": "HRMS Backend Test Server"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000) 