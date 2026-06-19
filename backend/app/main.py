import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.config import settings
from app.database import Base, engine
from app.routers import customers, dashboard, orders, products

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready API for managing products, customers, and orders",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def startup():
    for attempt in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except OperationalError:
            if attempt == 9:
                raise
            time.sleep(2)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
