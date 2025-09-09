from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ganti dengan URL Postgres-mu (punya Neon)
DATABASE_URL = "postgresql+psycopg2://neondb_owner:npg_e0ZODtVxIpP8@ep-ancient-glade-adflm0v6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Engine = koneksi ke database
engine = create_engine(DATABASE_URL)
 
# SessionLocal = factory untuk bikin session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = class dasar untuk deklarasi model
Base = declarative_base() 