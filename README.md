# Inventory & Order Management System

A production-ready, full-stack Inventory & Order Management System built with **React**, **FastAPI**, **PostgreSQL**, and **Docker**.

## Features

- **Product Management** — CRUD operations with unique SKU validation and stock tracking
- **Customer Management** — Create, view, and delete customers with unique email validation
- **Order Management** — Create orders with automatic stock deduction and total calculation
- **Dashboard** — Summary stats with low-stock alerts
- **Fully Containerized** — Docker + Docker Compose for local and production deployment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Backend | Python 3.12, FastAPI, SQLAlchemy |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

## Project Structure

```
assign/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick Start (Docker)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Run the Application

```bash
# Clone the repository
git clone <your-repo-url>
cd assign

# Copy environment file
cp .env.example .env

# Build and start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Stop Services

```bash
docker compose down
```

To remove persisted database data:

```bash
docker compose down -v
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get summary statistics |

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders are rejected if inventory is insufficient
- Creating an order automatically reduces stock
- Order total is calculated by the backend
- Cancelling an order restores product stock

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Update DATABASE_URL to point to your local PostgreSQL
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Deployment

### Backend — Render

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your repository and use the `render.yaml` blueprint, or:
   - Set **Root Directory** to `backend`
   - Use **Docker** as runtime
   - Add a **PostgreSQL** database
   - Set environment variables:
     - `DATABASE_URL` — from Render PostgreSQL dashboard
     - `CORS_ORIGINS` — your frontend URL (e.g., `https://your-app.vercel.app`)

### Backend — Docker Hub

```bash
cd backend
docker build -t your-dockerhub-username/inventory-backend:latest .
docker push your-dockerhub-username/inventory-backend:latest
```

### Frontend — Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` — your deployed backend URL (e.g., `https://inventory-backend.onrender.com`)

### Frontend — Netlify

1. Import project on [Netlify](https://netlify.com)
2. Set **Base directory** to `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable `VITE_API_URL`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `inventory_db` |
| `DATABASE_URL` | Full PostgreSQL connection string | — |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |
| `VITE_API_URL` | Backend API URL for frontend | `http://localhost:8000` |

## Submission Checklist

- [ ] GitHub repository with frontend and backend code
- [ ] Docker Hub image for backend (`your-username/inventory-backend`)
- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend API URL (Render/Railway/Fly.io)

## License

MIT
