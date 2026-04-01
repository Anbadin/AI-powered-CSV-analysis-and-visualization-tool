import pandas as pd # pyright: ignore[reportMissingModuleSource]
import numpy as np # type: ignore
from io import StringIO
from sklearn.ensemble import IsolationForest # type: ignore
from sklearn.linear_model import LinearRegression # type: ignore
from sklearn.preprocessing import StandardScaler # type: ignore


def analyze_csv(file_content: str) -> dict:
    """Main analysis function with ML insights."""
    
    try:
        df = pd.read_csv(StringIO(file_content))
    except Exception as e:
        return {"error": f"Failed to parse CSV: {str(e)}"}
    
    basic_info = get_basic_info(df)
    column_types = detect_column_types(df)
    column_stats = get_column_statistics(df, column_types)
    
    # NEW: ML Insights
    correlations = get_correlations(df)
    anomalies = detect_anomalies(df)
    trends = detect_trends(df, column_types)
    
    return {
        "success": True,
        "basic_info": basic_info,
        "column_types": column_types,
        "column_stats": column_stats,
        "correlations": correlations,
        "anomalies": anomalies,
        "trends": trends,
    }


def get_basic_info(df: pd.DataFrame) -> dict:
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
    column_types = {}
    
    for col in df.columns:
        col_data = df[col].dropna()
        
        if len(col_data) == 0:
            column_types[col] = "empty"
            continue
        
        if is_datetime_column(col_data, col):
            column_types[col] = "datetime"
            continue
        
        if pd.api.types.is_numeric_dtype(col_data):
            column_types[col] = "numerical"
            continue
        
        try:
            pd.to_numeric(col_data)
            column_types[col] = "numerical"
            continue
        except (ValueError, TypeError):
            pass
        
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
    date_hints = ['date', 'time', 'timestamp', 'datetime', 'created', 'updated', 'year', 'month', 'day']
    
    if any(hint in col_name.lower() for hint in date_hints):
        try:
            pd.to_datetime(series, format='mixed', dayfirst=False)
            return True
        except (ValueError, TypeError):
            pass
    
    if series.dtype == 'object':
        try:
            converted = pd.to_datetime(series, format='mixed', dayfirst=False)
            success_rate = converted.notna().sum() / len(series)
            return success_rate > 0.8
        except (ValueError, TypeError):
            return False
    
    return False


def get_column_statistics(df: pd.DataFrame, column_types: dict) -> dict:
    stats = {}
    
    for col, col_type in column_types.items():
        col_data = df[col]
        missing = int(col_data.isnull().sum())
        
        base_stats = {
            "type": col_type,
            "missing_count": missing,
            "missing_percentage": round((missing / len(df)) * 100, 1) if len(df) > 0 else 0,
            "unique_count": int(col_data.nunique()),
        }
        
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
                })
        
        elif col_type == "categorical":
            value_counts = col_data.value_counts().head(10)
            base_stats.update({
                "top_values": {str(k): int(v) for k, v in value_counts.items()},
                "most_common": str(col_data.mode().iloc[0]) if len(col_data.mode()) > 0 else "N/A",
            })
        
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


# ─────────────────────────────────────────────────────
# 🔹 NEW: CORRELATION DETECTION
# ─────────────────────────────────────────────────────
def get_correlations(df: pd.DataFrame) -> dict:
    """Find which numerical columns move together."""
    
    # Only use numerical columns
    numeric_df = df.select_dtypes(include='number')
    
    if numeric_df.shape[1] < 2:
        return {"pairs": [], "matrix": {}}
    
    # Calculate correlation matrix
    corr_matrix = numeric_df.corr().round(2)
    
    # Find top correlated pairs (exclude self-correlation)
    pairs = []
    cols = numeric_df.columns.tolist()
    
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            col1, col2 = cols[i], cols[j]
            corr_val = float(corr_matrix.loc[col1, col2])
            
            # Only keep strong correlations (|r| > 0.5)
            if abs(corr_val) > 0.5:
                strength = "strong" if abs(corr_val) > 0.7 else "moderate"
                direction = "positive" if corr_val > 0 else "negative"
                
                pairs.append({
                    "col1": col1,
                    "col2": col2,
                    "correlation": corr_val,
                    "strength": strength,
                    "direction": direction,
                    "insight": f"{col1} and {col2} are {strength} {direction} correlated ({corr_val})"
                })
    
    # Sort by absolute correlation (strongest first)
    pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)
    
    return {
        "pairs": pairs[:5],  # Top 5 only
        "matrix": corr_matrix.to_dict()
    }


# ─────────────────────────────────────────────────────
# 🔹 NEW: ANOMALY DETECTION (Isolation Forest)
# ─────────────────────────────────────────────────────
def detect_anomalies(df: pd.DataFrame) -> dict:
    """Find unusual rows using ML."""
    
    # Only use numerical columns
    numeric_df = df.select_dtypes(include='number').dropna()
    
    if numeric_df.shape[0] < 10 or numeric_df.shape[1] < 1:
        return {"count": 0, "rows": [], "percentage": 0, "details": []}
    
    # Scale data (ML works better with standardized values)
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(numeric_df)
    
    # Isolation Forest: -1 = anomaly, 1 = normal
    model = IsolationForest(contamination=0.1, random_state=42)
    predictions = model.fit_predict(scaled_data)
    
    # Get anomaly indices
    anomaly_indices = numeric_df.index[predictions == -1].tolist()
    
    # Map back to original DataFrame rows
    anomaly_rows = []
    for idx in anomaly_indices:
        row_data = df.loc[idx].to_dict()
        # Convert numpy types to Python types for JSON
        row_data = {k: (float(v) if isinstance(v, (np.floating, np.integer)) else str(v)) 
                    for k, v in row_data.items()}
        anomaly_rows.append({
            "row_index": int(idx) + 1,  # 1-based for user
            "data": row_data
        })
    
    return {
        "count": len(anomaly_indices),
        "percentage": round((len(anomaly_indices) / len(df)) * 100, 1),
        "rows": anomaly_rows[:10],  # Show max 10
        "details": f"Found {len(anomaly_indices)} anomalies using Isolation Forest ML model"
    }


# ─────────────────────────────────────────────────────
# 🔹 NEW: TREND DETECTION (Linear Regression)
# ─────────────────────────────────────────────────────
def detect_trends(df: pd.DataFrame, column_types: dict) -> list:
    """Find upward/downward trends in time-series data."""
    
    trends = []
    
    # Find datetime columns
    datetime_cols = [col for col, typ in column_types.items() if typ == "datetime"]
    numeric_cols = [col for col, typ in column_types.items() if typ == "numerical"]
    
    for date_col in datetime_cols:
        for num_col in numeric_cols:
            try:
                # Prepare data
                temp_df = df[[date_col, num_col]].copy()
                temp_df[date_col] = pd.to_datetime(temp_df[date_col], errors='coerce')
                temp_df[num_col] = pd.to_numeric(temp_df[num_col], errors='coerce')
                temp_df = temp_df.dropna()
                
                if len(temp_df) < 5:
                    continue
                
                # Sort by date
                temp_df = temp_df.sort_values(date_col)
                
                # Convert dates to numbers for regression
                X = (temp_df[date_col] - temp_df[date_col].min()).dt.days.values.reshape(-1, 1)
                y = temp_df[num_col].values
                
                # Fit linear regression
                model = LinearRegression()
                model.fit(X, y)
                
                slope = float(model.coef_[0])
                r_squared = float(model.score(X, y))
                
                # Determine trend direction
                if abs(slope) < 0.01:
                    direction = "flat"
                    emoji = "→"
                elif slope > 0:
                    direction = "upward"
                    emoji = "📈"
                else:
                    direction = "downward"
                    emoji = "📉"
                
                # Only report if reasonably strong fit
                if r_squared > 0.3:
                    trends.append({
                        "date_column": date_col,
                        "value_column": num_col,
                        "direction": direction,
                        "emoji": emoji,
                        "slope": round(slope, 2),
                        "r_squared": round(r_squared, 2),
                        "insight": f"{num_col} is trending {direction} over time (R²={r_squared})"
                    })
                    
            except Exception:
                continue
    
    return trends