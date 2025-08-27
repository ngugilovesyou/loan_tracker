# config.py
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session,relationship
from sqlalchemy.ext.declarative import declarative_base
import redis

SQLALCHEMY_DATABASE_URI="sqlite:///loan.db"
engine=create_engine(SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread":False})
SessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base=declarative_base()

r=redis.Redis(host="localhost", port=6379,decode_responses=True)
