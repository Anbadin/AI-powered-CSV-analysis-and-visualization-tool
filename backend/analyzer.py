import pandas as pd # pyright: ignore[reportMissingModuleSource]
import numpy as np # type: ignore
from io import StringIO
from sklearn.ensemble import IsolationForest # type: ignore
from sklearn.linear_model import LinearRegression # type: ignore
from sklearn.preprocessing import StandardScaler # type: ignore


def analyze_csv(df: pd.DataFrame) -> dict:
    """
    Main analysis function. 
    Now accepts a DataFrame directly from main.py to avoid parsing errors.
    """
    
    # Check if df is valid
    if df is None or df.empty:
        return {"error": "Received empty or invalid DataFrame"}
    
    # All your existing analysis calls (PRESERVED)
    basic_info = get_basic_info(df)
    column_types = detect_column_types(df)
    column_stats = get_column_statistics(df, column_types)
    correlations = get_correlations(df)
    anomalies = detect_anomalies(df)
    trends = detect_trends(df, column_types)
    chart_data = prepare_chart_data(df, column_types)
    
    return {
        "success": True,
        "basic_info": basic_info,
        "column_types": column_types,
        "column_stats": column_stats,
        "correlations": correlations,
        "anomalies": anomalies,
        "trends": trends,
        "chart_data": chart_data,
    }

def get_basic_info(df: pd.DataFrame) -> dict:
    total_cells = int(df.shape[0] * df.shape[1])
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


def get_correlations(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include='number')
    if numeric_df.shape[1] < 2:
        return {"pairs": [], "matrix": {}}
    
    corr_matrix = numeric_df.corr().round(2)
    pairs = []
    cols = numeric_df.columns.tolist()
    
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            col1, col2 = cols[i], cols[j]
            corr_val = float(corr_matrix.loc[col1, col2])
            if abs(corr_val) > 0.5:
                strength = "strong" if abs(corr_val) > 0.7 else "moderate"
                direction = "positive" if corr_val > 0 else "negative"
                pairs.append({
                    "col1": col1, "col2": col2, "correlation": corr_val,
                    "strength": strength, "direction": direction,
                    "insight": f"{col1} and {col2} are {strength} {direction} correlated ({corr_val})"
                })
    pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)
    return {"pairs": pairs[:5], "matrix": corr_matrix.to_dict()}


def detect_anomalies(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include='number').dropna()
    if numeric_df.shape[0] < 10 or numeric_df.shape[1] < 1:
        return {"count": 0, "rows": [], "percentage": 0, "details": []}
    
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(numeric_df)
    model = IsolationForest(contamination=0.1, random_state=42)
    predictions = model.fit_predict(scaled_data)
    
    anomaly_indices = numeric_df.index[predictions == -1].tolist()
    anomaly_rows = []
    for idx in anomaly_indices:
        row_data = df.loc[idx].to_dict()
        row_data = {k: (float(v) if isinstance(v, (np.floating, np.integer)) else str(v)) 
                    for k, v in row_data.items()}
        anomaly_rows.append({"row_index": int(idx) + 1, "data": row_data})
    
    return {
        "count": len(anomaly_indices),
        "percentage": round((len(anomaly_indices) / len(df)) * 100, 1),
        "rows": anomaly_rows[:10],
        "details": f"Found {len(anomaly_indices)} anomalies using Isolation Forest ML model"
    }


def detect_trends(df: pd.DataFrame, column_types: dict) -> list:
    trends = []
    datetime_cols = [col for col, typ in column_types.items() if typ == "datetime"]
    numeric_cols = [col for col, typ in column_types.items() if typ == "numerical"]
    
    for date_col in datetime_cols:
        for num_col in numeric_cols:
            try:
                temp_df = df[[date_col, num_col]].copy()
                temp_df[date_col] = pd.to_datetime(temp_df[date_col], errors='coerce')
                temp_df[num_col] = pd.to_numeric(temp_df[num_col], errors='coerce')
                temp_df = temp_df.dropna().sort_values(date_col)
                
                if len(temp_df) < 5: continue
                
                X = (temp_df[date_col] - temp_df[date_col].min()).dt.days.values.reshape(-1, 1)
                y = temp_df[num_col].values
                model = LinearRegression()
                model.fit(X, y)
                
                slope = float(model.coef_[0])
                r_squared = float(model.score(X, y))
                
                if r_squared > 0.3:
                    direction = "flat" if abs(slope) < 0.01 else ("upward" if slope > 0 else "downward")
                    emoji = "→" if direction == "flat" else ("📈" if direction == "upward" else "📉")
                    trends.append({
                        "date_column": date_col, "value_column": num_col,
                        "direction": direction, "emoji": emoji, "slope": round(slope, 2),
                        "r_squared": round(r_squared, 2),
                        "insight": f"{num_col} is trending {direction} over time (R²={r_squared})"
                    })
            except Exception: continue
    return trends


def prepare_chart_data(df: pd.DataFrame, column_types: dict) -> dict:
    charts = {}
    numerical_cols = [col for col, typ in column_types.items() if typ == "numerical"]
    categorical_cols = [col for col, typ in column_types.items() if typ == "categorical"]
    datetime_cols = [col for col, typ in column_types.items() if typ == "datetime"]
    
    name_col = find_name_column(df, categorical_cols)
    price_col = find_column_by_hint(df, numerical_cols, ['price', 'cost', 'amount', 'value', 'salary', 'revenue'])
    qty_col = find_column_by_hint(df, numerical_cols, ['quantity', 'qty', 'units', 'count', 'sold', 'volume'])
    
    if name_col and price_col:
        item_data = df[[name_col, price_col]].copy()
        item_data[price_col] = pd.to_numeric(item_data[price_col], errors='coerce')
        item_data = item_data.dropna()
        
        if qty_col:
            item_data[qty_col] = pd.to_numeric(df[qty_col], errors='coerce')
            item_data['Revenue'] = item_data[price_col] * item_data[qty_col]
            revenue_data = item_data.groupby(name_col).agg({price_col: 'mean', qty_col: 'sum', 'Revenue': 'sum'}).reset_index()
            revenue_data = revenue_data.sort_values('Revenue', ascending=False).head(15)
            charts["revenue_by_item"] = {
                "type": "revenue", "title": f"Revenue by {name_col}", "subtitle": f"({price_col} × {qty_col})",
                "x_label": name_col, "y_label": "Revenue ($)",
                "data": [{"name": str(row[name_col]), "revenue": round(float(row['Revenue']), 2), "price": round(float(row[price_col]), 2), "quantity": int(row[qty_col])} for _, row in revenue_data.iterrows()]
            }
            qty_data = item_data.groupby(name_col)[qty_col].sum().reset_index().sort_values(qty_col, ascending=False).head(15)
            charts["units_by_item"] = {
                "type": "units", "title": f"Units Sold by {name_col}", "x_label": name_col, "y_label": f"Total {qty_col}",
                "data": [{"name": str(row[name_col]), "value": int(row[qty_col])} for _, row in qty_data.iterrows()]
            }
        else:
            price_data = item_data.groupby(name_col)[price_col].mean().reset_index().sort_values(price_col, ascending=False).head(15)
            charts["price_by_item"] = {
                "type": "price", "title": f"Average {price_col} by {name_col}", "x_label": name_col, "y_label": f"Avg {price_col}",
                "data": [{"name": str(row[name_col]), "value": round(float(row[price_col]), 2)} for _, row in price_data.iterrows()]
            }
    
    category_col = find_column_by_hint(df, categorical_cols, ['category', 'type', 'group', 'department', 'class', 'segment'])
    if not category_col and categorical_cols:
        best_cat = min(categorical_cols, key=lambda c: df[c].nunique())
        if df[best_cat].nunique() <= 15: category_col = best_cat
    
    if category_col:
        if price_col and qty_col:
            cat_data = df[[category_col, price_col, qty_col]].copy()
            cat_data[price_col] = pd.to_numeric(cat_data[price_col], errors='coerce')
            cat_data[qty_col] = pd.to_numeric(cat_data[qty_col], errors='coerce')
            cat_data['Revenue'] = cat_data[price_col] * cat_data[qty_col]
            cat_summary = cat_data.dropna().groupby(category_col).agg({price_col: 'mean', qty_col: 'sum', 'Revenue': 'sum'}).reset_index().sort_values('Revenue', ascending=False)
            charts["category_breakdown"] = {
                "type": "category_breakdown", "title": f"Performance by {category_col}",
                "data": [{"name": str(row[category_col]), "revenue": round(float(row['Revenue']), 2), "avgPrice": round(float(row[price_col]), 2), "totalUnits": int(row[qty_col])} for _, row in cat_summary.iterrows()]
            }
        else:
            cat_counts = df[category_col].value_counts().head(10)
            charts["category_counts"] = {
                "type": "category_counts", "title": f"Distribution by {category_col}",
                "data": [{"name": str(k), "value": int(v)} for k, v in cat_counts.items()]
            }
    
    for date_col in datetime_cols[:1]:
        for num_col in numerical_cols[:3]:
            try:
                temp_df = df[[date_col, num_col]].copy()
                temp_df[date_col] = pd.to_datetime(temp_df[date_col], errors='coerce')
                temp_df[num_col] = pd.to_numeric(temp_df[num_col], errors='coerce')
                temp_df = temp_df.dropna().sort_values(date_col)
                if len(temp_df) >= 3:
                    charts[f"timeseries_{num_col}"] = {
                        "type": "timeseries", "title": f"{num_col} Over Time", "x_label": date_col, "y_label": num_col,
                        "data": [{"date": row[date_col].strftime('%b %d'), "fullDate": row[date_col].strftime('%Y-%m-%d'), "value": round(float(row[num_col]), 2)} for _, row in temp_df.iterrows()]
                    }
            except Exception: continue
    
    if len(numerical_cols) >= 2:
        numeric_df = df[numerical_cols].apply(pd.to_numeric, errors='coerce').dropna()
        if len(numeric_df) > 5:
            corr_matrix = numeric_df.corr()
            best_corr, best_pair = 0, (numerical_cols[0], numerical_cols[1])
            for i in range(len(numerical_cols)):
                for j in range(i + 1, len(numerical_cols)):
                    c = abs(corr_matrix.iloc[i, j])
                    if c > best_corr and c < 1.0: best_corr, best_pair = c, (numerical_cols[i], numerical_cols[j])
            col_x, col_y = best_pair
            scatter_df = numeric_df[[col_x, col_y]].dropna().head(100)
            scatter_data = []
            for idx, row in scatter_df.iterrows():
                point = {"x": round(float(row[col_x]), 2), "y": round(float(row[col_y]), 2)}
                if name_col and idx in df.index: point["name"] = str(df.loc[idx, name_col])
                scatter_data.append(point)
            charts["scatter"] = {"type": "scatter", "title": f"{col_x} vs {col_y} (r={best_corr:.2f})", "x_label": col_x, "y_label": col_y, "correlation": round(best_corr, 2), "data": scatter_data}
    
    for col in numerical_cols[:2]:
        data = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(data) > 5:
            num_bins = min(10, len(data.unique()))
            if num_bins >= 2:
                hist_values, bin_edges = np.histogram(data, bins=num_bins)
                charts[f"distribution_{col}"] = {
                    "type": "distribution", "title": f"{col} Distribution", "x_label": col, "y_label": "Frequency",
                    "stats": {"mean": round(float(data.mean()), 2), "median": round(float(data.median()), 2)},
                    "data": [{"range": f"${bin_edges[i]:.0f}-${bin_edges[i+1]:.0f}" if any(h in col.lower() for h in ['price', 'cost', 'revenue', 'salary']) else f"{bin_edges[i]:.0f}-{bin_edges[i+1]:.0f}", "count": int(hist_values[i]), "from": round(float(bin_edges[i]), 2), "to": round(float(bin_edges[i+1]), 2)} for i in range(len(hist_values))]
                }
    
    rating_col = find_column_by_hint(df, numerical_cols, ['rating', 'score', 'stars', 'review', 'satisfaction'])
    if rating_col:
        rating_data = pd.to_numeric(df[rating_col], errors='coerce').dropna()
        if len(rating_data) > 0:
            rating_counts = rating_data.round(1).value_counts().sort_index()
            charts["rating_distribution"] = {"type": "rating", "title": f"{rating_col} Distribution", "avg_rating": round(float(rating_data.mean()), 2), "data": [{"rating": str(k), "count": int(v)} for k, v in rating_counts.items()]}
    
    summary_data = []
    for col in numerical_cols[:6]:
        data = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(data) > 0:
            summary_data.append({"column": col, "min": round(float(data.min()), 2), "max": round(float(data.max()), 2), "mean": round(float(data.mean()), 2), "median": round(float(data.median()), 2), "total": round(float(data.sum()), 2)})
    if summary_data: charts["summary_table"] = {"type": "summary_table", "title": "Numerical Summary", "data": summary_data}
    
    return charts


def find_name_column(df, categorical_cols):
    name_hints = ['product', 'name', 'item', 'title', 'description', 'employee', 'student', 'customer', 'company', 'brand', 'model']
    for col in categorical_cols:
        if any(hint in col.lower() for hint in name_hints): return col
    if categorical_cols:
        best = max(categorical_cols, key=lambda c: df[c].nunique())
        if df[best].nunique() > 3: return best
    return None


def find_column_by_hint(df, columns, hints):
    for col in columns:
        if any(hint in col.lower() for hint in hints): return col
    return None