import google.generativeai as genai
import os
import json
import time
from dotenv import load_dotenv

load_dotenv()


def generate_narrative(analysis_result: dict) -> str:
    """Generate AI narrative with retry and fallback."""
    
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return generate_fallback_narrative(analysis_result)
    
    # Try multiple models (if one fails, try next)
    models_to_try = [
        'gemini-2.0-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
    ]
    
    prompt = build_prompt(analysis_result)
    
    for model_name in models_to_try:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            
            # Wait a moment to avoid rate limits
            time.sleep(2)
            
            response = model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            error_msg = str(e)
            
            # If rate limited, wait and retry
            if "429" in error_msg or "quota" in error_msg.lower():
                print(f"Rate limited on {model_name}, trying next model...")
                time.sleep(5)  # Wait 5 seconds before trying next model
                continue
            else:
                print(f"Error with {model_name}: {error_msg}")
                continue
    
    # If ALL models failed, use our own narrative generator
    print("All AI models failed. Using fallback narrative.")
    return generate_fallback_narrative(analysis_result)


def generate_fallback_narrative(analysis: dict) -> str:
    """
    Generate a narrative WITHOUT any AI API.
    Uses the analysis data directly to write a summary.
    This ALWAYS works, even without internet!
    """
    
    basic = analysis.get("basic_info", {})
    col_types = analysis.get("column_types", {})
    col_stats = analysis.get("column_stats", {})
    correlations = analysis.get("correlations", {})
    anomalies = analysis.get("anomalies", {})
    trends = analysis.get("trends", [])
    
    rows = basic.get("total_rows", 0)
    cols = basic.get("total_columns", 0)
    missing = basic.get("missing_cells", 0)
    missing_pct = basic.get("missing_percentage", 0)
    duplicates = basic.get("duplicate_rows", 0)
    col_names = basic.get("column_names", [])
    
    num_numerical = sum(1 for v in col_types.values() if v == "numerical")
    num_categorical = sum(1 for v in col_types.values() if v == "categorical")
    num_datetime = sum(1 for v in col_types.values() if v == "datetime")
    
    # Paragraph 1: Overview
    para1 = f"**Data Overview:** This dataset contains {rows} rows and {cols} columns "
    para1 += f"({num_numerical} numerical, {num_categorical} categorical"
    if num_datetime > 0:
        para1 += f", {num_datetime} datetime"
    para1 += f"). The columns are: {', '.join(col_names[:6])}"
    if len(col_names) > 6:
        para1 += f" and {len(col_names) - 6} more"
    para1 += f". "
    
    if missing == 0:
        para1 += "The data quality is excellent — no missing values were found. "
    else:
        para1 += f"There are {missing} missing cells ({missing_pct}%), which may need attention. "
    
    if duplicates > 0:
        para1 += f"Additionally, {duplicates} duplicate rows were detected."
    
    # Paragraph 2: Patterns
    para2 = "**Key Patterns & Insights:** "
    
    # Add numerical stats
    for col_name, stats in col_stats.items():
        if stats.get("type") == "numerical" and "mean" in stats:
            para2 += f"{col_name} ranges from {stats['min']} to {stats['max']} "
            para2 += f"with an average of {stats['mean']}. "
            break  # Just show one example
    
    # Add categorical stats
    for col_name, stats in col_stats.items():
        if stats.get("type") == "categorical" and "most_common" in stats:
            para2 += f"The most common {col_name} is \"{stats['most_common']}\". "
            break
    
    # Add correlations
    corr_pairs = correlations.get("pairs", [])
    if corr_pairs:
        top = corr_pairs[0]
        para2 += f"A {top['strength']} {top['direction']} correlation ({top['correlation']}) "
        para2 += f"was found between {top['col1']} and {top['col2']}. "
    else:
        para2 += "No strong correlations were detected between the numerical columns. "
    
    # Paragraph 3: Anomalies & Trends
    para3 = "**Anomalies & Recommendations:** "
    
    anomaly_count = anomalies.get("count", 0)
    anomaly_pct = anomalies.get("percentage", 0)
    
    if anomaly_count > 0:
        para3 += f"The Isolation Forest ML model flagged {anomaly_count} rows ({anomaly_pct}%) as anomalies. "
        para3 += "These unusual data points should be reviewed to determine if they represent errors or genuine outliers. "
    else:
        para3 += "No significant anomalies were detected in the dataset. "
    
    if trends:
        trend = trends[0]
        para3 += f"{trend['value_column']} shows a {trend['direction']} trend over time "
        para3 += f"(R²={trend['r_squared']}). "
        if trend['direction'] == 'upward':
            para3 += "Consider investigating what's driving this growth."
        elif trend['direction'] == 'downward':
            para3 += "This declining pattern may warrant attention."
    else:
        para3 += "No clear time-based trends were identified in this dataset."
    
    return f"{para1}\n\n{para2}\n\n{para3}"


def build_prompt(analysis: dict) -> str:
    """Build prompt for Gemini AI."""
    
    basic = analysis.get("basic_info", {})
    col_types = analysis.get("column_types", {})
    col_stats = analysis.get("column_stats", {})
    correlations = analysis.get("correlations", {})
    anomalies = analysis.get("anomalies", {})
    trends = analysis.get("trends", [])
    
    num_numerical = sum(1 for v in col_types.values() if v == "numerical")
    num_categorical = sum(1 for v in col_types.values() if v == "categorical")
    num_datetime = sum(1 for v in col_types.values() if v == "datetime")
    
    stats_summary = ""
    for col_name, stats in col_stats.items():
        if stats.get("type") == "numerical":
            stats_summary += f"\n  - {col_name}: mean={stats.get('mean')}, median={stats.get('median')}, min={stats.get('min')}, max={stats.get('max')}, std={stats.get('std')}"
        elif stats.get("type") == "categorical":
            top_vals = stats.get("top_values", {})
            top_3 = list(top_vals.items())[:3]
            vals_str = ", ".join([f"{k} ({v})" for k, v in top_3])
            stats_summary += f"\n  - {col_name}: most common values = {vals_str}"
    
    corr_summary = "No strong correlations found."
    corr_pairs = correlations.get("pairs", [])
    if corr_pairs:
        corr_lines = [f"{p['col1']} and {p['col2']}: r={p['correlation']} ({p['strength']} {p['direction']})" for p in corr_pairs[:3]]
        corr_summary = "\n  ".join(corr_lines)
    
    anomaly_count = anomalies.get("count", 0)
    anomaly_pct = anomalies.get("percentage", 0)
    
    trend_summary = "No clear trends detected."
    if trends:
        trend_lines = [f"{t['value_column']} trending {t['direction']} (slope={t['slope']}, R²={t['r_squared']})" for t in trends]
        trend_summary = "\n  ".join(trend_lines)
    
    prompt = f"""You are a professional data analyst. Write a clear, insightful summary of this CSV dataset analysis.

DATASET: {basic.get('total_rows', 0)} rows × {basic.get('total_columns', 0)} columns
COLUMNS: {', '.join(basic.get('column_names', []))}
TYPES: {num_numerical} numerical, {num_categorical} categorical, {num_datetime} datetime
MISSING: {basic.get('missing_cells', 0)} ({basic.get('missing_percentage', 0)}%)
DUPLICATES: {basic.get('duplicate_rows', 0)}

STATISTICS:{stats_summary}

CORRELATIONS: {corr_summary}

ANOMALIES: {anomaly_count} found ({anomaly_pct}%) via Isolation Forest

TRENDS: {trend_summary}

Write exactly 3 short paragraphs with **bold headings**:
1. **Data Overview** - what the data contains, quality
2. **Key Patterns** - interesting findings, specific numbers  
3. **Anomalies & Recommendations** - anomalies found, actionable advice

Keep it under 150 words. Use specific numbers. Be professional but friendly."""
    
    return prompt