# main.py
from datetime import datetime
import json
import sys
import os
from typing import List
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Loan, Repayment
from config import Base, SessionLocal, engine, r
from schema import LoanCreate, RepaymentCreate, LoanStatus, LoanResponse
from sqlalchemy.orm import Session

app=FastAPI()

Base.metadata.create_all(bind=engine)

# initialize DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    

# cors
app.add_middleware(
    CORSMiddleware,
    # allow_origins=['http:localhost:3000'],
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# create a loan (post-(/loans))
@app.post('/create-loans', response_model=LoanResponse)
def create_loan(loan:LoanCreate, db:Session=Depends(get_db)):
    try:
        ln=Loan(
            loan_amount=loan.loan_amount,
            interest_rate=0.02,
            repayment_period=loan.repayment_period
        )
        print("data received", ln)
        db.add(ln)
        db.commit()
        db.refresh(ln)
        return ln
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating loan: {str(e)}")

def calculate_monthly_intallments(loan_amount:float, interest_rate:float, payment_period:int):
    if interest_rate == 0:
        return loan_amount / payment_period
    
    monthly_payments=loan_amount * (interest_rate * (1 + interest_rate) ** payment_period) / ((1 + interest_rate) ** payment_period - 1) 
    return round(monthly_payments ,2)  

def calculate_monthly_installment(loan_amount: float, interest_rate: float, periods: int) -> float:
    # Calculate monthly installment using the standard loan formula
    if interest_rate == 0:
        return loan_amount / periods
    
    monthly_payment = loan_amount * (interest_rate * (1 + interest_rate)**periods) / ((1 + interest_rate)**periods - 1)
    return round(monthly_payment, 2)

def calculate_loan_status(loan: Loan, repayments: List[Repayment]) -> LoanStatus:
    # Calculate the current status of a loan
    
    # Calculate expected monthly installment
    monthly_installment = calculate_monthly_installment(
        loan.loan_amount, 
        loan.interest_rate, 
        loan.repayment_period
    )
    
    # Calculate months elapsed since loan creation
    months_elapsed = max(0, (datetime.utcnow().year - loan.created_at.year) * 12 + 
                        (datetime.utcnow().month - loan.created_at.month))
    
    # Calculate total paid
    total_paid = sum(repayment.amount for repayment in repayments)
    
    # Calculate expected amount paid so far
    expected_paid = min(months_elapsed * monthly_installment, loan.loan_amount)
    
    # Calculate remaining balance (with interest)
    remaining_principal = loan.loan_amount
    for repayment in sorted(repayments, key=lambda x: x.created_at):
        remaining_principal -= repayment.amount
    
    remaining_balance = max(0, remaining_principal)
    
    # Determine status
    if total_paid >= expected_paid * 1.1:  
        status = "Ahead"
    elif total_paid >= expected_paid * 0.9:  
        status = "On Track"
    else:
        status = "Behind"
    
    return LoanStatus(
    loan_id=loan.id,
    expected_monthly_installment=monthly_installment,
    total_amount_paid=total_paid,  
    remaining_balance=remaining_balance,
    status=status,
    months_passed=months_elapsed,  
    expected_paid=expected_paid
)


@app.post("/loans/{loan_id}/repayments")
def add_repayment(loan_id: int, repayment: RepaymentCreate, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    try:
        db_repayment = Repayment(
            loan_id=loan_id,
            amount=repayment.amount
        )
        db.add(db_repayment)
        db.commit()

        cache_key = f"loan_status:{loan_id}"
        r.delete(cache_key)

        return {"message": "Repayment added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding repayment: {str(e)}")

@app.get("/loans/{loan_id}/status", response_model=LoanStatus)
def get_loan_status(loan_id: int, db: Session = Depends(get_db)):
    # Get the current status of a loan
    
    # Check cache first
    cache_key = f"loan_status:{loan_id}"
    cached_status = r.get(cache_key)
    
    if cached_status:
        return json.loads(cached_status)
    
    # Get loan from database
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Get all repayments for this loan
    repayments = db.query(Repayment).filter(Repayment.loan_id == loan_id).all()
    
    # Calculate status
    status = calculate_loan_status(loan, repayments)
    
    # Cache the result for 5 minutes
    r.setex(cache_key, 300, json.dumps(status.dict()))
    
    return status

@app.get("/loans")
def get_all_loans(db: Session = Depends(get_db)):
    # Get all loans
    loans = db.query(Loan).all()
    return loans
