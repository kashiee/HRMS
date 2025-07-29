"""
HRMS Backend - UK Payroll & HR PoC
Main FastAPI application entrypoint
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from database import engine, Base
from routers import company, employee, payroll, nlp
from services.gdpr import GDPRMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print(" HRMS Backend starting up...")
    yield
    # Shutdown
    print(" HRMS Backend shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="HRMS UK Payroll PoC",
    description="AI-integrated UK Payroll & HR Management System",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(GDPRMiddleware)

# Include routers
app.include_router(company.router, prefix="/api/v1/company", tags=["Company"])
app.include_router(employee.router, prefix="/api/v1/employee", tags=["Employee"])
app.include_router(payroll.router, prefix="/api/v1/payroll", tags=["Payroll"])
app.include_router(nlp.router, prefix="/api/v1/nlp", tags=["NLP"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "HRMS UK Payroll PoC Backend",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "ai_services": "available",
            "gdpr_middleware": "active"
        }
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "type": "http_error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 