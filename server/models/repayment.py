# models/repayments.py
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, Float, ForeignKey
from config import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class Repayment(Base):
    __tablename__="repayments"
    
    id=Column(Integer, primary_key=True)
    loan_id=Column(Integer, ForeignKey("loans.id"))
    amount=Column(Float, nullable=False)
    created_at=Column(DateTime, default=datetime.utcnow)
    
    loan=relationship("Loan", back_populates="repayments")