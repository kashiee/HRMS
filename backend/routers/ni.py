"""
National Insurance (NI) management endpoints for NI earnings and calculations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from database import get_db
from models import EmployeeNIRecord, EmployeeNIDetails

router = APIRouter()

@router.post("/ni-details", status_code=status.HTTP_201_CREATED)
async def create_ni_details(
    ni_data: EmployeeNIDetails,
    db: Session = Depends(get_db)
):
    """
    Create or update National Insurance details for an employee
    
    This endpoint accepts comprehensive NI data including earnings breakdowns,
    contribution calculations, and thresholds for UK National Insurance.
    """
    try:
        # Convert Pydantic model to dict
        ni_dict = ni_data.dict(exclude_unset=True)
        
        # Check if NI record already exists for this reference
        existing_record = db.query(EmployeeNIRecord).filter(
            EmployeeNIRecord.reference == ni_data.reference
        ).first()
        
        if existing_record:
            # Update existing record
            for field, value in ni_dict.items():
                setattr(existing_record, field, value)
            existing_record.updated_at = datetime.now()
            db.commit()
            db.refresh(existing_record)
            
            return {
                "message": "National Insurance details updated successfully",
                "id": existing_record.id,
                "reference": existing_record.reference,
                "name": f"{existing_record.forename or ''} {existing_record.surname or ''}".strip(),
                "updated_at": existing_record.updated_at
            }
        else:
            # Create new NI record
            ni_record = EmployeeNIRecord(**ni_dict)
            db.add(ni_record)
            db.commit()
            db.refresh(ni_record)
            
            return {
                "message": "National Insurance details created successfully",
                "id": ni_record.id,
                "reference": ni_record.reference,
                "name": f"{ni_record.forename or ''} {ni_record.surname or ''}".strip(),
                "created_at": ni_record.created_at
            }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save NI details: {str(e)}"
        )

@router.get("/ni-details/{reference}", status_code=status.HTTP_200_OK)
async def get_ni_details(
    reference: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve National Insurance details for an employee by reference
    
    Returns comprehensive NI data including earnings breakdowns,
    contribution calculations, and thresholds.
    """
    try:
        # Query NI record by reference
        ni_record = db.query(EmployeeNIRecord).filter(
            EmployeeNIRecord.reference == reference
        ).first()
        
        if not ni_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"National Insurance details for reference '{reference}' not found"
            )
        
        # Convert to dict for response
        ni_dict = {
            "id": ni_record.id,
            "reference": ni_record.reference,
            "gender": ni_record.gender,
            "title": ni_record.title,
            "forename": ni_record.forename,
            "surname": ni_record.surname,
            
            # National Insurance Information
            "ni_letter": ni_record.ni_letter,
            "ni_calculation_basis": ni_record.ni_calculation_basis,
            "total_earnings": ni_record.total_earnings,
            "earnings_to_set": ni_record.earnings_to_set,
            "earnings_to_lel": ni_record.earnings_to_lel,
            "earnings_to_pet": ni_record.earnings_to_pet,
            "earnings_to_fust": ni_record.earnings_to_fust,
            "earnings_to_ust": ni_record.earnings_to_ust,
            "earnings_above_uel": ni_record.earnings_above_uel,
            "ee_contributions_pt1": ni_record.ee_contributions_pt1,
            "ee_contributions_pt2": ni_record.ee_contributions_pt2,
            "er_contributions": ni_record.er_contributions,
            
            # NI Breakdown by Period
            "ni_letter_bf": ni_record.ni_letter_bf,
            "ni_calculation_basis_bf": ni_record.ni_calculation_basis_bf,
            "total_earnings_bf": ni_record.total_earnings_bf,
            "earnings_to_set_bf": ni_record.earnings_to_set_bf,
            "earnings_to_lel_bf": ni_record.earnings_to_lel_bf,
            "earnings_to_pet_bf": ni_record.earnings_to_pet_bf,
            "earnings_to_fust_bf": ni_record.earnings_to_fust_bf,
            "earnings_to_ust_bf": ni_record.earnings_to_ust_bf,
            "earnings_above_uel_bf": ni_record.earnings_above_uel_bf,
            "ee_contributions_pt1_bf": ni_record.ee_contributions_pt1_bf,
            "ee_contributions_pt2_bf": ni_record.ee_contributions_pt2_bf,
            "er_contributions_bf": ni_record.er_contributions_bf,
            
            # Current Period NI
            "ni_letter_current": ni_record.ni_letter_current,
            "ni_calculation_basis_current": ni_record.ni_calculation_basis_current,
            "total_earnings_current": ni_record.total_earnings_current,
            "earnings_to_set_current": ni_record.earnings_to_set_current,
            "earnings_to_lel_current": ni_record.earnings_to_lel_current,
            "earnings_to_pet_current": ni_record.earnings_to_pet_current,
            "earnings_to_fust_current": ni_record.earnings_to_fust_current,
            "earnings_to_ust_current": ni_record.earnings_to_ust_current,
            "earnings_above_uel_current": ni_record.earnings_above_uel_current,
            "ee_contributions_pt1_current": ni_record.ee_contributions_pt1_current,
            "ee_contributions_pt2_current": ni_record.ee_contributions_pt2_current,
            "er_contributions_current": ni_record.er_contributions_current,
            
            # NI Year to Date
            "ni_letter_ytd": ni_record.ni_letter_ytd,
            "ni_calculation_basis_ytd": ni_record.ni_calculation_basis_ytd,
            "total_earnings_ytd": ni_record.total_earnings_ytd,
            "earnings_to_set_ytd": ni_record.earnings_to_set_ytd,
            "earnings_to_lel_ytd": ni_record.earnings_to_lel_ytd,
            "earnings_to_pet_ytd": ni_record.earnings_to_pet_ytd,
            "earnings_to_fust_ytd": ni_record.earnings_to_fust_ytd,
            "earnings_to_ust_ytd": ni_record.earnings_to_ust_ytd,
            "earnings_above_uel_ytd": ni_record.earnings_above_uel_ytd,
            "ee_contributions_pt1_ytd": ni_record.ee_contributions_pt1_ytd,
            "ee_contributions_pt2_ytd": ni_record.ee_contributions_pt2_ytd,
            "er_contributions_ytd": ni_record.er_contributions_ytd,
            
            # NI Thresholds and Limits
            "lel_threshold": ni_record.lel_threshold,
            "pet_threshold": ni_record.pet_threshold,
            "fust_threshold": ni_record.fust_threshold,
            "uel_threshold": ni_record.uel_threshold,
            "ust_threshold": ni_record.ust_threshold,
            
            # NI Rates
            "ee_rate_pt1": ni_record.ee_rate_pt1,
            "ee_rate_pt2": ni_record.ee_rate_pt2,
            "er_rate": ni_record.er_rate,
            
            # Additional NI Information
            "ni_category": ni_record.ni_category,
            "ni_exemption": ni_record.ni_exemption,
            "ni_deferment": ni_record.ni_deferment,
            "ni_deferment_certificate": ni_record.ni_deferment_certificate,
            "ni_contracted_out": ni_record.ni_contracted_out,
            "ni_contracted_out_rate": ni_record.ni_contracted_out_rate,
            
            # Employment Status for NI
            "employment_status": ni_record.employment_status,
            "start_date": ni_record.start_date,
            "leaving_date": ni_record.leaving_date,
            "leaver": ni_record.leaver,
            
            # Department and Organizational Info
            "department": ni_record.department,
            "cost_centre": ni_record.cost_centre,
            "branch": ni_record.branch,
            
            # Contact Information
            "email": ni_record.email,
            "address_1": ni_record.address_1,
            "address_2": ni_record.address_2,
            "address_3": ni_record.address_3,
            "address_4": ni_record.address_4,
            "postcode": ni_record.postcode,
            "country": ni_record.country,
            
            "created_at": ni_record.created_at,
            "updated_at": ni_record.updated_at
        }
        
        return {
            "message": "National Insurance details retrieved successfully",
            "ni_details": ni_dict
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve NI details: {str(e)}"
        )

@router.get("/ni-details", status_code=status.HTTP_200_OK)
async def list_ni_details(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all National Insurance records with pagination
    
    Returns a list of NI records with basic information
    """
    try:
        ni_records = db.query(EmployeeNIRecord).offset(skip).limit(limit).all()
        
        ni_list = []
        for record in ni_records:
            ni_list.append({
                "id": record.id,
                "reference": record.reference,
                "name": f"{record.forename or ''} {record.surname or ''}".strip(),
                "department": record.department,
                "ni_letter": record.ni_letter,
                "total_earnings": record.total_earnings,
                "ee_contributions_pt1": record.ee_contributions_pt1,
                "er_contributions": record.er_contributions,
                "employment_status": record.employment_status,
                "created_at": record.created_at
            })
        
        return {
            "message": f"Retrieved {len(ni_list)} NI records",
            "ni_records": ni_list,
            "total": len(ni_list),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve NI records: {str(e)}"
        )

@router.delete("/ni-details/{reference}", status_code=status.HTTP_200_OK)
async def delete_ni_details(
    reference: str,
    db: Session = Depends(get_db)
):
    """
    Delete National Insurance details for an employee by reference
    """
    try:
        ni_record = db.query(EmployeeNIRecord).filter(
            EmployeeNIRecord.reference == reference
        ).first()
        
        if not ni_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"National Insurance details for reference '{reference}' not found"
            )
        
        db.delete(ni_record)
        db.commit()
        
        return {
            "message": f"National Insurance details for reference '{reference}' deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete NI details: {str(e)}"
        )

@router.get("/ni-details/{reference}/summary", status_code=status.HTTP_200_OK)
async def get_ni_summary(
    reference: str,
    db: Session = Depends(get_db)
):
    """
    Get a summary of National Insurance details for an employee
    
    Returns key NI information in a condensed format
    """
    try:
        ni_record = db.query(EmployeeNIRecord).filter(
            EmployeeNIRecord.reference == reference
        ).first()
        
        if not ni_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"National Insurance details for reference '{reference}' not found"
            )
        
        # Calculate summary information
        total_ee_contributions = (
            (float(ni_record.ee_contributions_pt1 or 0)) +
            (float(ni_record.ee_contributions_pt2 or 0))
        )
        
        summary = {
            "reference": ni_record.reference,
            "employee_name": f"{ni_record.forename or ''} {ni_record.surname or ''}".strip(),
            "ni_letter": ni_record.ni_letter,
            "ni_category": ni_record.ni_category,
            "employment_status": ni_record.employment_status,
            "department": ni_record.department,
            "total_earnings": ni_record.total_earnings,
            "total_ee_contributions": str(total_ee_contributions),
            "er_contributions": ni_record.er_contributions,
            "earnings_breakdown": {
                "to_set": ni_record.earnings_to_set,
                "to_lel": ni_record.earnings_to_lel,
                "to_pet": ni_record.earnings_to_pet,
                "to_fust": ni_record.earnings_to_fust,
                "to_ust": ni_record.earnings_to_ust,
                "above_uel": ni_record.earnings_above_uel
            },
            "current_period": {
                "total_earnings": ni_record.total_earnings_current,
                "ee_contributions": ni_record.ee_contributions_pt1_current,
                "er_contributions": ni_record.er_contributions_current
            },
            "year_to_date": {
                "total_earnings": ni_record.total_earnings_ytd,
                "ee_contributions": ni_record.ee_contributions_pt1_ytd,
                "er_contributions": ni_record.er_contributions_ytd
            },
            "updated_at": ni_record.updated_at
        }
        
        return {
            "message": "National Insurance summary retrieved successfully",
            "summary": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve NI summary: {str(e)}"
        ) 