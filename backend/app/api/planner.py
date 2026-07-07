import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.models import User, StudyPlan
from app.schemas.schemas import StudyPlanCreateRequest, StudyPlanResponse
from app.api.deps import get_current_user
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/generate", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
async def generate_plan(
    request: StudyPlanCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan_data = await llm_service.generate_study_plan(
        subjects=request.subjects,
        hours_per_day=request.hours_per_day,
        target_date=request.target_date
    )
    
    hours_per_week = int(request.hours_per_day * 7)
    
    try:
        end_date = datetime.datetime.strptime(request.target_date, "%Y-%m-%d")
    except ValueError:
        end_date = datetime.datetime.utcnow() + datetime.timedelta(days=30)
        
    db_plan = StudyPlan(
        user_id=current_user.id,
        title=plan_data.get("title", "My Study Schedule"),
        plan_json=json.dumps(plan_data),
        hours_per_week=hours_per_week,
        end_date=end_date
    )
    
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    return db_plan

@router.get("/", response_model=List[StudyPlanResponse])
def list_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()

@router.get("/{plan_id}", response_model=StudyPlanResponse)
def get_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    return plan
