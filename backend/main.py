import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pandas as pd
import io
import gc

load_dotenv()

from analyzer import analyze_csv
from narrative import generate_narrative

app = FastAPI(
    title="SafiNia API",
    description="AI-Powered CSV Analysis Engine",
    version="1.0.0"
)

# ─── CORS — Allow all origins (you can restrict later) ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store latest analysis in memory
latest_analysis = {}


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": "SafiNia API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global latest_analysis

    print(f"📁 Received file: {file.filename}")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        contents = await file.read()
        print(f"📊 File size: {len(contents)} bytes")
        
        df = pd.read_csv(io.BytesIO(contents))
        print(f"📋 DataFrame shape: {df.shape}")

        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")

        if len(df.columns) < 2:
            raise HTTPException(
                status_code=400,
                detail="CSV must have at least 2 columns"
            )

        analysis = analyze_csv(df)
        latest_analysis = analysis

        # Clean up memory
        gc.collect()

        print("✅ Analysis complete!")
        return {
            "status": "success",
            "filename": file.filename,
            "analysis": analysis
        }

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty or malformed")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Could not parse CSV file")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Upload error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/narrative")
async def get_narrative():
    global latest_analysis

    if not latest_analysis:
        raise HTTPException(
            status_code=400,
            detail="No analysis data available. Upload a CSV first."
        )

    try:
        narrative = generate_narrative(latest_analysis)
        return {
            "status": "success",
            "narrative": narrative
        }
    except Exception as e:
        print(f"⚠️ Narrative error: {e}")
        return {
            "status": "fallback",
            "narrative": generate_fallback_narrative(latest_analysis)
        }


def generate_fallback_narrative(analysis):
    """Fallback narrative when Gemini API fails"""
    info = analysis.get("basic_info", {})
    rows = info.get("total_rows", "unknown")
    cols = info.get("total_columns", "unknown")

    return (
        f"## Data Analysis Summary\n\n"
        f"Your dataset contains **{rows:,}** rows and **{cols}** columns. "
        f"The analysis has been completed successfully using machine learning algorithms "
        f"including Isolation Forest for anomaly detection and Linear Regression for trend analysis.\n\n"
        f"Review the charts and statistics above for detailed insights into your data patterns."
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)