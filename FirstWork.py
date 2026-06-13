from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
import time

# -----------------------
# CONFIG
# -----------------------

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"
ALGORITHM = "HS256"
TOKEN_EXPIRE = 3600

DATABASE_URL = "sqlite:///./myshop_secure.db"

# -----------------------
# DATABASE
# -----------------------

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# -----------------------
# SECURITY
# -----------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# -----------------------
# FASTAPI APP
# -----------------------

app = FastAPI(title="MyShop Secure API")

# -----------------------
# DATABASE MODELS
# -----------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    price = Column(Integer)
    image = Column(String)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

Base.metadata.create_all(bind=engine)

# -----------------------
# SCHEMAS
# -----------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class ProductCreate(BaseModel):
    name: str
    price: int
    image: str

class OrderCreate(BaseModel):
    product_id: int

# -----------------------
# DATABASE DEPENDENCY
# -----------------------

def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

# -----------------------
# PASSWORD HASHING
# -----------------------

def hash_password(password):

    return pwd_context.hash(password)

def verify_password(password, hashed):

    return pwd_context.verify(password, hashed)

# -----------------------
# TOKEN CREATION
# -----------------------

def create_token(user_id):

    payload = {
        "user_id": user_id,
        "exp": time.time() + TOKEN_EXPIRE
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# -----------------------
# TOKEN VERIFICATION
# -----------------------

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("user_id")

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=401)

        return user

    except JWTError:

        raise HTTPException(status_code=401, detail="Invalid token")

# -----------------------
# ADMIN CHECK
# -----------------------

def admin_only(user: User = Depends(get_current_user)):

    if user.role != "admin":

        raise HTTPException(status_code=403, detail="Admin access required")

    return user

# -----------------------
# AUTH ROUTES
# -----------------------

@app.post("/signup")

def signup(user: UserCreate, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == user.email).first():

        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()

    return {"message": "User created"}

# -----------------------

@app.post("/login")

def login(user: UserCreate, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:

        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user.password):

        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_token(db_user.id)

    return {"access_token": token}

# -----------------------
# PRODUCTS
# -----------------------

@app.get("/products")

def get_products(db: Session = Depends(get_db)):

    return db.query(Product).all()

# -----------------------

@app.post("/products")

def create_product(product: ProductCreate, db: Session = Depends(get_db), user: User = Depends(admin_only)):

    new_product = Product(**product.dict())

    db.add(new_product)
    db.commit()

    return {"message": "Product added"}

# -----------------------
# ORDERS
# -----------------------

@app.post("/order")

def create_order(order: OrderCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    new_order = Order(
        user_id=user.id,
        product_id=order.product_id
    )

    db.add(new_order)
    db.commit()

    return {"message": "Order placed"}

# -----------------------
# PROFILE
# -----------------------

@app.get("/me")

def profile(user: User = Depends(get_current_user)):

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role
    }