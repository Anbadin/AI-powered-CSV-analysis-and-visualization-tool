from fastapi import FastAPI, UploadFile, File, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from analyzer import analyze_csv

# Create the FastAPI app
app = FastAPI(
    title="DataStory API",
    description="AI-powered CSV analysis backend",
    version="1.0.0",
)

# Allow our React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # Next.js dev server
        "http://127.0.0.1:3000",    # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],            # Allow all HTTP methods
    allow_headers=["*"],            # Allow all headers
)

@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "message": "DataStory API is live! 🚀",
        "docs": "Visit /docs for API documentation",
    }

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file and get initial analysis.
    """
    
    # Validate file type
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=400, 
            detail="Only CSV files are accepted."
        )
    
    # Read file contents
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    
    # Validate file size (10MB max)
    if size_mb > 10:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large ({size_mb:.1f}MB). Maximum is 10MB."
        )
    
    # Decode the file bytes to text
    try:
        file_content = contents.decode('utf-8')
    except UnicodeDecodeError:
        try:
            file_content = contents.decode('latin-1')
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Could not read file. Please ensure it's a valid CSV."
            )
    
    # Run our analysis!
    result = analyze_csv(file_content)
    
    # Check for analysis errors
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Return successful results
    return {
        "message": "File analyzed successfully! ✅",
        "filename": file.filename,
        "size": f"{size_mb:.2f} MB" if size_mb >= 1 else f"{len(contents)/1024:.1f} KB",
        "analysis": result,
    }

# This allows running with: python main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
