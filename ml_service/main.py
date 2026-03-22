from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime
import os

app = FastAPI()

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "prisma", "dev.db")

class PredictionRequest(BaseModel):
    product_id: int

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "ML Service is running"}

@app.post("/predict-price")
def predict_price(req: PredictionRequest):
    conn = get_db_connection()
    try:
        product_cursor = conn.cursor()
        product_cursor.execute("SELECT * FROM Product WHERE id = ?", (req.product_id,))
        product = product_cursor.fetchone()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        history_df = pd.read_sql_query(
            "SELECT price, timestamp FROM PriceHistory WHERE productId = ? ORDER BY timestamp ASC",
            conn, params=(req.product_id,)
        )

        stock = product['stock']
        views = product['views']
        current_price = product['currentPrice']
        base_price = product['basePrice']

        # Simple Dynamic Pricing Heuristic
        demand_factor = 1.0
        if views > 100 and stock < 10:
            demand_factor = 1.2 # 20% increase
        elif views < 10 and stock > 50:
            demand_factor = 0.9 # 10% decrease
        elif views > 50 and stock < 30:
            demand_factor = 1.05

        if len(history_df) >= 5:
            # Time-series forecasting
            prices = history_df['price'].values
            try:
                model = ARIMA(prices, order=(1, 1, 0))
                model_fit = model.fit()
                forecast = model_fit.forecast(steps=1)[0]
                
                # Blend ARIMA forecast with heuristic demand factor
                suggested_price = (forecast * 0.5) + (current_price * demand_factor * 0.5)
            except Exception as e:
                suggested_price = current_price * demand_factor
        else:
            suggested_price = current_price * demand_factor

        # Bound the price 
        min_price = base_price * 0.5
        max_price = base_price * 3.0
        
        suggested_price = max(min_price, min(max_price, suggested_price))

        return {
            "product_id": req.product_id,
            "current_price": current_price,
            "suggested_price": round(suggested_price, 2),
            "stock": stock,
            "views": views
        }
    finally:
        conn.close()
