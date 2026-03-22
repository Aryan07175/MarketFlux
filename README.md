# 📈 MarketFlux

![MarketFlux Banner](https://img.shields.io/badge/MarketFlux-Dynamic%20Pricing%20Engine-blueviolet?style=for-the-badge)

**MarketFlux** (also known as PricePulse) is an intelligent, real-time dynamic pricing engine and simulator. It automatically adjusts product prices based on user demand, stock levels, and historical trends using machine learning (ARIMA forecasting) and rule-based heuristics.

---

## 🚀 Features

- **Real-Time Dynamic Pricing**: Automatically updates prices in real-time based on views, current stock, and buying patterns.
- **Machine Learning Integration**: Uses an ARIMA time-series forecasting model (via Python/FastAPI) to predict optimal future prices.
- **Rules-Based Engine**: Applies instantaneous heuristic adjustments (e.g., boosting prices when stock is low and demand is high).
- **Live Analytics Dashboard**: A stunning Next.js frontend with live Recharts visualizing historical price data and system intelligence.
- **Multi-Service Architecture**: Beautifully integrated Node.js/Express backend, FastAPI ML service, and Next.js frontend running concurrently.

---

## 🛠️ Tech Stack

| Service | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js, React, TailwindCSS, Recharts, Socket.IO Client | The real-time user interface and simulation dashboard. |
| **Backend** | Node.js, Express, TypeScript, Prisma, SQLite, Socket.IO | Handles API requests, real-time WebSocket communication, and database management. |
| **ML Engine** | Python, FastAPI, Pandas, NumPy, Statsmodels | Analyzes `PriceHistory`, computes price elasticity, and serves ARIMA model inferences. |

---

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Python (v3.9 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/marketflux.git
   cd MarketFlux
   ```

2. **Setup the Python Virtual Environment** (for the ML Service):
   ```bash
   cd ml_service
   python -m venv venv
   
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   # source venv/bin/activate
   
   pip install -r requirements.txt
   cd ..
   ```

3. **Install Node Dependencies and Initialize Database**:
   MarketFlux comes with a unified setup script to install backend and frontend dependencies, and seed the local SQLite database. Ensure you are in the root directory.
   ```bash
   npm run setup
   ```

---

## 🏃‍♂️ Running the Application

You can start all three services (Frontend, Backend, and ML Service) concurrently with a single command from the root directory:

```bash
npm run dev
```

Alternatively, you can run them individually:
- **Backend**: `npm run dev:backend`
- **Frontend**: `npm run dev:frontend`
- **ML Service**: `npm run dev:ml`

Once running, you can access:
- **Frontend Dashboard**: `http://localhost:3005`
- **Backend API**: Typically runs on `http://localhost:3001` (or your configured port)
- **ML Service**: `http://localhost:8000`

---

## 🧠 How the AI Works

The ML service (`ml_service/main.py`) acts as the "brain" of MarketFlux:
1. It queries the `PriceHistory` database matching the requested `productId`.
2. It assesses dynamic parameters: current stock, recent views, and base price.
3. If enough data points exist, it fits an **ARIMA(1,1,0)** model to forecast the next logical price point.
4. It blends the ARIMA forecast with a heuristic demand factor (e.g., `demand_factor = 1.2` for high-views + low-stock) to calculate a smooth, bounds-checked `suggested_price`.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
