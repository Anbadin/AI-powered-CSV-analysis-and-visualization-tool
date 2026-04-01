import pandas as pd # type: ignore
import numpy as np # type: ignore
from io import StringIO

def analyze_csv(file_content: str) -> dict:
    """
    Main analysis function.
    Takes raw CSV text content and returns structured analysis results.
    """
    
    # Step 1: Read the CSV into a pandas DataFrame
    try:
        df = pd.read_csv(StringIO(file_content))
    except Exception as e:
        return {"error": f"Failed to parse CSV: {str(e)}"}
    
    # Step 2: Basic info about the dataset
    basic_info = get_basic_info(df)
    
    # Step 3: Detect what TYPE each column is
    column_types = detect_column_types(df)
    
    # Step 4: Get statistics for each column
    column_stats = get_column_statistics(df, column_types)
    
    # Step 5: Build and return the result
    result = {
        "success": True,
        "basic_info": basic_info,
        "column_types": column_types,
        "column_stats": column_stats,
    }
    
    return result

def get_basic_info(df: pd.DataFrame) -> dict:
    """Get basic dataset information."""
    
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = int(df.isnull().sum().sum())
    
    return {
        "total_rows": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "total_cells": total_cells,
        "missing_cells": missing_cells,
        "missing_percentage": round((missing_cells / total_cells) * 100, 1) if total_cells > 0 else 0,
        "duplicate_rows": int(df.duplicated().sum()),
        "memory_usage": f"{df.memory_usage(deep=True).sum() / 1024:.1f} KB",
        "column_names": df.columns.tolist(),
    }

def detect_column_types(df: pd.DataFrame) -> dict:
    """
    Detect whether each column is:
    - numerical (int/float) → numbers like 42, 99.5
    - categorical (limited unique values) → like "Red", "Blue", "Green"
    - datetime (dates/times) → like "2024-01-15"
    - text (long strings) → like sentences or descriptions
    """
    
    column_types = {}
    
    for col in df.columns:
        col_data = df[col].dropna()
        
        if len(col_data) == 0:
            column_types[col] = "empty"
            continue
        
        # Check 1: Is it a date/time?
        if is_datetime_column(col_data, col):
            column_types[col] = "datetime"
            continue
        
        # Check 2: Is it already numerical?
        if pd.api.types.is_numeric_dtype(col_data):
            column_types[col] = "numerical"
            continue
        
        # Check 3: Can it be CONVERTED to numbers?
        try:
            pd.to_numeric(col_data)
            column_types[col] = "numerical"
            continue
        except (ValueError, TypeError):
            pass
        
        # Check 4: Categorical or text?
        unique_ratio = len(col_data.unique()) / len(col_data) if len(col_data) > 0 else 0
        avg_length = col_data.astype(str).str.len().mean()
        
        if unique_ratio < 0.5 or len(col_data.unique()) <= 20:
            column_types[col] = "categorical"
        elif avg_length > 50:
            column_types[col] = "text"
        else:
            column_types[col] = "categorical"
    
    return column_types

def is_datetime_column(series, col_name: str) -> bool:
    """Check if a column contains datetime values."""
    
    # Strategy 1: Check if column NAME gives hints
    date_hints = ['date', 'time', 'timestamp', 'datetime', 
                  'created', 'updated', 'year', 'month', 'day']
    
    if any(hint in col_name.lower() for hint in date_hints):
        try:
            pd.to_datetime(series, format='mixed', dayfirst=False)
            return True
        except (ValueError, TypeError):
            pass
    
    # Strategy 2: Try parsing as datetime anyway
    if series.dtype == 'object':
        try:
            converted = pd.to_datetime(series, format='mixed', dayfirst=False)
            success_rate = converted.notna().sum() / len(series)
            return success_rate > 0.8
        except (ValueError, TypeError):
            return False
    
    return False

def get_column_statistics(df: pd.DataFrame, column_types: dict) -> dict:
    """Get detailed statistics for each column based on its type."""
    
    stats = {}
    
    for col, col_type in column_types.items():
        col_data = df[col]
        missing = int(col_data.isnull().sum())
        
        # Base stats that EVERY column gets
        base_stats = {
            "type": col_type,
            "missing_count": missing,
            "missing_percentage": round((missing / len(df)) * 100, 1) if len(df) > 0 else 0,
            "unique_count": int(col_data.nunique()),
        }
        
        # NUMERICAL columns get math statistics
        if col_type == "numerical":
            numeric_data = pd.to_numeric(col_data, errors='coerce').dropna()
            
            if len(numeric_data) > 0:
                base_stats.update({
                    "mean": round(float(numeric_data.mean()), 2),
                    "median": round(float(numeric_data.median()), 2),
                    "std": round(float(numeric_data.std()), 2),
                    "min": round(float(numeric_data.min()), 2),
                    "max": round(float(numeric_data.max()), 2),
                    "q1": round(float(numeric_data.quantile(0.25)), 2),
                    "q3": round(float(numeric_data.quantile(0.75)), 2),
                    "skewness": round(float(numeric_data.skew()), 2),
                    "range": round(float(numeric_data.max() - numeric_data.min()), 2),
                })
        
        # CATEGORICAL columns get value counts
        elif col_type == "categorical":
            value_counts = col_data.value_counts().head(10)
            base_stats.update({
                "top_values": {
                    str(k): int(v) for k, v in value_counts.items()
                },
                "most_common": str(col_data.mode().iloc[0]) if len(col_data.mode()) > 0 else "N/A",
            })
        
        # DATETIME columns get date range
        elif col_type == "datetime":
            try:
                dates = pd.to_datetime(col_data, errors='coerce').dropna()
                if len(dates) > 0:
                    base_stats.update({
                        "earliest": str(dates.min()),
                        "latest": str(dates.max()),
                        "date_range_days": int((dates.max() - dates.min()).days),
                    })
            except Exception:
                pass
        
        stats[col] = base_stats
    
    return stats