from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel

app = FastAPI(title="MyShop Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
users = {}
products = []
next_product_id = 1

class UserCreate(BaseModel):
    username: str
    password: str

class ProductCreate(BaseModel):
    name: str
    price: int
    category: str
    description: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    name: str
    price: int
    category: str
    owner: str
    description: Optional[str] = None

app.mount("/static", StaticFiles(directory="static"), name="static")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_token(token: Optional[str] = Query(None), authorization: Optional[str] = Header(None)) -> str:
    if token:
        return token
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ", 1)[1]
    raise HTTPException(status_code=401, detail="Missing token")


def get_current_user(token: str = Depends(get_token)) -> str:
    username = decode_access_token(token)
    if username not in users:
        raise HTTPException(status_code=401, detail="Unknown user")
    return username


def seed_products() -> None:
    global next_product_id
    initial_products = [
        {"name": "ThunderPhone Z", "price": 15999, "category": "Electronics", "description": "Premium smartphone with fast performance."},
        {"name": "AirRunner Shoes", "price": 3499, "category": "Shoes", "description": "Comfortable running shoes for daily wear."},
        {"name": "Pro Gel Pen Pack", "price": 199, "category": "Stationery", "description": "Smooth ink pens for writing and drawing."},
        {"name": "Essential JS Guide", "price": 499, "category": "Books", "description": "Learn JavaScript quickly with practical examples."},
        {"name": "Pulse Smart Watch", "price": 2299, "category": "Watches", "description": "Stylish smartwatch with fitness tracking."},
        {"name": "TravelMate Backpack", "price": 1899, "category": "Bags", "description": "Durable travel backpack with multiple compartments."},
    ]
    for item in initial_products:
        products.append({
            "id": next_product_id,
            "name": item["name"],
            "price": item["price"],
            "category": item["category"],
            "owner": "system",
            "description": item.get("description", "No description provided."),
        })
        next_product_id += 1

seed_products()


@app.get("/")
def root() -> FileResponse:
    return FileResponse("index.html")


@app.get("/products", response_model=List[ProductOut])
def get_products() -> List[ProductOut]:
    return products


@app.post("/signup")
def signup(user: UserCreate):
    if user.username in users:
        raise HTTPException(status_code=400, detail="User already exists")
    users[user.username] = hash_password(user.password)
    return {"message": "User created"}


@app.post("/login")
def login(user: UserCreate):
    if user.username not in users:
        raise HTTPException(status_code=400, detail="User not found")
    if not verify_password(user.password, users[user.username]):
        raise HTTPException(status_code=400, detail="Wrong password")
    token = create_access_token(user.username)
    return {"access_token": token}


@app.post("/add-product")
def add_product(product: ProductCreate, username: str = Depends(get_current_user)):
    global next_product_id
    item = {
        "id": next_product_id,
        "name": product.name,
        "price": product.price,
        "category": product.category,
        "owner": username,
        "description": product.description or "No description available.",
    }
    products.append(item)
    next_product_id += 1
    return {"message": "Product added", "product": item}


@app.delete("/delete/{product_id}")
def delete_product(product_id: int, username: str = Depends(get_current_user)):
    item = next((product for product in products if product["id"] == product_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    if item["owner"] != username:
        raise HTTPException(status_code=403, detail="Not allowed")
    products.remove(item)
    return {"message": "Product deleted"}
