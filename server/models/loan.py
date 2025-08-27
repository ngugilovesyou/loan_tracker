# models/loan.py
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, Float
from config import Base
from sqlalchemy.orm import relationship


class Loan(Base):
    __tablename__ = "loans"
    
    id=Column(Integer, primary_key=True)
    loan_amount=Column(Float, nullable=False)
    interest_rate=Column(Float, default=0.02)
    repayment_period=Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    repayments=relationship("Repayment", back_populates="loan")