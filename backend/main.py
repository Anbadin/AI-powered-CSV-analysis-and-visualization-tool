from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from analyzer import analyze_csv
from narrative import generate_narrative

app = FastAPI(
    title="SafiNia API",
    description="AI-powered CSV analysis backend",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Store the latest analysis in memory (for narrative generation)
latest_analysis = {}


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "SafiNia API is live! 🚀",
        "version": "2.0.0",
    }


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file and get ML analysis."""
    global latest_analysis
    
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    
    if size_mb > 10:
        raise HTTPException(status_code=400, detail=f"File too large ({size_mb:.1f}MB). Maximum is 10MB.")
    
    try:
        file_content = contents.decode('utf-8')
    except UnicodeDecodeError:
        try:
            file_content = contents.decode('latin-1')
        except Exception:
            raise HTTPException(status_code=400, detail="Could not read file.")
    
    result = analyze_csv(file_content)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Store for narrative generation
    latest_analysis = result
    
    return {
        "message": "File analyzed successfully! ✅",
        "filename": file.filename,
        "size": f"{size_mb:.2f} MB" if size_mb >= 1 else f"{len(contents)/1024:.1f} KB",
        "analysis": result,
    }


@app.post("/narrative")
async def get_narrative():
    """Generate AI narrative from the latest analysis."""
    global latest_analysis
    
    if not latest_analysis:
        raise HTTPException(status_code=400, detail="No analysis data found. Upload a CSV first.")
    
    narrative = generate_narrative(latest_analysis)
    
    return {
        "narrative": narrative,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)