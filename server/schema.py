# schema.py

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from pydantic import BaseModel

class LoanCreate(BaseModel):
    loan_amount: float
    repayment_period: int
    # interest_rate:float
    
class RepaymentCreate(BaseModel):
    amount: float
    # date: datetime
    
class LoanStatus(BaseModel):
    loan_id: int
    expected_monthly_installment: float
    total_amount_paid: float
    remaining_balance: float
    status: str
    months_passed: int
    expected_paid: float

    
class LoanResponse(BaseModel):
    id:int
    loan_amount:float
    interest_rate:float
    created_at:datetime
    
    class Config:
        from_attributes = True  