from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from datetime import datetime, timedelta

app = FastAPI(
    title="Restaurant ERP AI Service",
    description="AI-powered forecasting and insights for restaurant operations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---

class SalesDataPoint(BaseModel):
    date: str
    revenue: float
    order_count: int


class ForecastRequest(BaseModel):
    historical_data: List[SalesDataPoint]
    forecast_days: int = 7


class ForecastResponse(BaseModel):
    forecasts: List[dict]
    confidence: float
    model_used: str


class DemandPredictionRequest(BaseModel):
    item_name: str
    historical_quantities: List[float]
    forecast_days: int = 7


class ScheduleRequest(BaseModel):
    employees: List[dict]
    date: str
    expected_covers: int
    shift_hours: dict  # {"morning": [8, 16], "evening": [16, 24]}


class InsightRequest(BaseModel):
    revenue_data: List[float]
    cost_data: List[float]
    order_counts: List[int]
    period_labels: List[str]


# --- Endpoints ---

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service", "version": "1.0.0"}


@app.post("/forecast/sales", response_model=ForecastResponse)
async def forecast_sales(request: ForecastRequest):
    """Forecast future sales using linear regression with trend and seasonality."""
    if len(request.historical_data) < 7:
        raise HTTPException(status_code=400, detail="Need at least 7 data points for forecasting")

    revenues = [d.revenue for d in request.historical_data]
    n = len(revenues)

    # Simple linear regression for trend
    x = np.arange(n)
    coeffs = np.polyfit(x, revenues, 1)
    slope, intercept = coeffs[0], coeffs[1]

    # Weekly seasonality pattern (day-of-week factors)
    weekly_pattern = []
    for i in range(min(n, 28)):
        day_of_week = i % 7
        if len(weekly_pattern) <= day_of_week:
            weekly_pattern.append([])
        weekly_pattern[day_of_week].append(revenues[i] if i < n else 0)

    seasonal_factors = []
    mean_revenue = np.mean(revenues) if np.mean(revenues) > 0 else 1
    for day_vals in weekly_pattern:
        if day_vals:
            seasonal_factors.append(np.mean(day_vals) / mean_revenue)
        else:
            seasonal_factors.append(1.0)

    # Pad if less than 7 factors
    while len(seasonal_factors) < 7:
        seasonal_factors.append(1.0)

    # Generate forecasts
    last_date = datetime.strptime(request.historical_data[-1].date, "%Y-%m-%d")
    forecasts = []

    for i in range(request.forecast_days):
        future_x = n + i
        trend_value = slope * future_x + intercept
        day_of_week = (future_x) % 7
        seasonal_value = trend_value * seasonal_factors[day_of_week]

        # Add some controlled randomness
        noise = np.random.normal(0, 0.05) * seasonal_value
        forecast_value = max(0, seasonal_value + noise)

        forecast_date = last_date + timedelta(days=i + 1)
        forecasts.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_revenue": round(forecast_value, 2),
            "predicted_orders": max(1, int(forecast_value / (mean_revenue / np.mean([d.order_count for d in request.historical_data])))),
            "day_of_week": forecast_date.strftime("%A"),
        })

    # Confidence based on R-squared
    y_pred = slope * x + intercept
    ss_res = np.sum((np.array(revenues) - y_pred) ** 2)
    ss_tot = np.sum((np.array(revenues) - np.mean(revenues)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    confidence = max(0.5, min(0.95, abs(r_squared)))

    return ForecastResponse(
        forecasts=forecasts,
        confidence=round(confidence, 3),
        model_used="linear_regression_with_seasonality",
    )


@app.post("/forecast/demand")
async def forecast_demand(request: DemandPredictionRequest):
    """Predict demand for a specific menu item."""
    quantities = request.historical_quantities
    if len(quantities) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 data points")

    n = len(quantities)
    x = np.arange(n)
    coeffs = np.polyfit(x, quantities, 1)
    slope, intercept = coeffs[0], coeffs[1]

    predictions = []
    for i in range(request.forecast_days):
        future_x = n + i
        predicted = max(0, slope * future_x + intercept)
        # Add day-of-week variation
        variation = 1.0 + 0.1 * np.sin(2 * np.pi * future_x / 7)
        predictions.append({
            "day": i + 1,
            "predicted_quantity": round(predicted * variation, 1),
        })

    avg_demand = np.mean([p["predicted_quantity"] for p in predictions])
    suggested_stock = round(avg_demand * request.forecast_days * 1.2, 1)  # 20% buffer

    return {
        "item_name": request.item_name,
        "predictions": predictions,
        "average_daily_demand": round(avg_demand, 1),
        "suggested_stock_level": suggested_stock,
        "trend": "increasing" if slope > 0.1 else "decreasing" if slope < -0.1 else "stable",
    }


@app.post("/schedule/optimize")
async def optimize_schedule(request: ScheduleRequest):
    """Generate optimized employee schedule based on expected demand."""
    employees = request.employees
    expected_covers = request.expected_covers

    # Simple heuristic: 1 server per 15 covers, 1 kitchen per 20 covers
    servers_needed = max(2, int(np.ceil(expected_covers / 15)))
    kitchen_needed = max(2, int(np.ceil(expected_covers / 20)))
    total_needed = servers_needed + kitchen_needed

    # Assign shifts
    morning_shift = []
    evening_shift = []

    available = [e for e in employees if e.get("status", "active") == "active"]

    for i, emp in enumerate(available):
        if i < total_needed // 2:
            morning_shift.append({
                "employee_id": emp.get("id"),
                "name": emp.get("name", f"Employee {i+1}"),
                "shift": "morning",
                "hours": request.shift_hours.get("morning", [8, 16]),
            })
        elif i < total_needed:
            evening_shift.append({
                "employee_id": emp.get("id"),
                "name": emp.get("name", f"Employee {i+1}"),
                "shift": "evening",
                "hours": request.shift_hours.get("evening", [16, 24]),
            })

    return {
        "date": request.date,
        "expected_covers": expected_covers,
        "staff_required": {
            "servers": servers_needed,
            "kitchen": kitchen_needed,
            "total": total_needed,
        },
        "schedule": {
            "morning": morning_shift,
            "evening": evening_shift,
        },
        "coverage_ratio": round(len(available) / max(1, total_needed), 2),
    }


@app.post("/insights/analyze")
async def analyze_insights(request: InsightRequest):
    """Generate business insights from financial data."""
    revenues = request.revenue_data
    costs = request.cost_data
    orders = request.order_counts

    if not revenues or not costs:
        raise HTTPException(status_code=400, detail="Revenue and cost data required")

    total_revenue = sum(revenues)
    total_costs = sum(costs)
    total_orders = sum(orders)

    # Calculate metrics
    gross_margin = ((total_revenue - total_costs) / total_revenue * 100) if total_revenue > 0 else 0
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    cogs_ratio = (total_costs / total_revenue * 100) if total_revenue > 0 else 0

    # Revenue trend
    if len(revenues) >= 2:
        recent_half = revenues[len(revenues)//2:]
        earlier_half = revenues[:len(revenues)//2]
        revenue_trend = ((np.mean(recent_half) - np.mean(earlier_half)) / np.mean(earlier_half) * 100) if np.mean(earlier_half) > 0 else 0
    else:
        revenue_trend = 0

    # Best and worst periods
    best_idx = int(np.argmax(revenues))
    worst_idx = int(np.argmin(revenues))

    insights = []

    if gross_margin < 60:
        insights.append({
            "type": "warning",
            "title": "Low Gross Margin",
            "message": f"Your gross margin is {gross_margin:.1f}%. Consider reviewing menu pricing or reducing food costs.",
            "priority": "high",
        })

    if cogs_ratio > 35:
        insights.append({
            "type": "warning",
            "title": "High COGS Ratio",
            "message": f"Cost of goods sold is {cogs_ratio:.1f}% of revenue. Industry standard is 28-35%.",
            "priority": "medium",
        })

    if revenue_trend > 10:
        insights.append({
            "type": "success",
            "title": "Revenue Growing",
            "message": f"Revenue has increased by {revenue_trend:.1f}% in the recent period. Keep up the momentum!",
            "priority": "low",
        })
    elif revenue_trend < -10:
        insights.append({
            "type": "warning",
            "title": "Revenue Declining",
            "message": f"Revenue has decreased by {abs(revenue_trend):.1f}%. Consider marketing promotions.",
            "priority": "high",
        })

    insights.append({
        "type": "info",
        "title": "Best Performance",
        "message": f"Highest revenue was {request.period_labels[best_idx]} with {revenues[best_idx]:,.2f} AED.",
        "priority": "low",
    })

    return {
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "total_costs": round(total_costs, 2),
            "gross_profit": round(total_revenue - total_costs, 2),
            "gross_margin_pct": round(gross_margin, 1),
            "cogs_ratio_pct": round(cogs_ratio, 1),
            "avg_order_value": round(avg_order_value, 2),
            "total_orders": total_orders,
            "revenue_trend_pct": round(revenue_trend, 1),
        },
        "insights": insights,
        "currency": "AED",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
