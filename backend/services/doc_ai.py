"""
Document AI service for OCR and document classification
"""

import os
import re
from typing import Dict, Any, Optional
from datetime import datetime
import json

# Optional imports for OCR (will use mock if not available)
try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

# Mock AI classification for PoC
# In production, this would use OpenAI GPT-4 or similar
DOCUMENT_CLASSIFICATIONS = {
    'p45': {
        'keywords': ['P45', 'tax', 'leaving', 'employment', 'hmrc'],
        'confidence': 0.95
    },
    'p60': {
        'keywords': ['P60', 'tax', 'year', 'hmrc', 'certificate'],
        'confidence': 0.95
    },
    'passport': {
        'keywords': ['passport', 'uk', 'government', 'identity', 'travel'],
        'confidence': 0.90
    },
    'driving_license': {
        'keywords': ['driving', 'license', 'dvla', 'vehicle', 'motor'],
        'confidence': 0.85
    },
    'birth_certificate': {
        'keywords': ['birth', 'certificate', 'registered', 'born', 'date'],
        'confidence': 0.80
    },
    'bank_statement': {
        'keywords': ['bank', 'statement', 'account', 'balance', 'transaction'],
        'confidence': 0.75
    },
    'utility_bill': {
        'keywords': ['utility', 'bill', 'electricity', 'gas', 'water', 'address'],
        'confidence': 0.70
    }
}

async def process_document_upload(
    document_id: int,
    file_path: str,
    document_type: str,
    db_session: Any
) -> Dict[str, Any]:
    """
    Process uploaded document with OCR and AI classification
    
    Args:
        document_id: Database ID of the document
        file_path: Path to the uploaded file
        document_type: Expected document type
        db_session: Database session
    
    Returns:
        Dictionary with processing results
    """
    try:
        # Extract text using OCR
        ocr_text = await extract_text_from_document(file_path)
        
        # Classify document using AI
        classification_result = await classify_document(ocr_text, document_type)
        
        # Update document record in database
        from models import Document
        document = db_session.query(Document).filter(Document.id == document_id).first()
        
        if document:
            document.ocr_text = ocr_text
            document.ai_classification = classification_result['classification']
            document.ai_confidence = classification_result['confidence']
            document.is_verified = classification_result['is_verified']
            document.processed_at = datetime.now()
            
            db_session.commit()
        
        return {
            'document_id': document_id,
            'ocr_text': ocr_text,
            'classification': classification_result['classification'],
            'confidence': classification_result['confidence'],
            'is_verified': classification_result['is_verified'],
            'processing_time': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Document processing failed: {e}")
        return {
            'document_id': document_id,
            'error': str(e),
            'processing_time': datetime.now().isoformat()
        }

async def extract_text_from_document(file_path: str) -> str:
    """
    Extract text from document using OCR
    
    Args:
        file_path: Path to the document file
    
    Returns:
        Extracted text string
    """
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
            # Process image files
            return await extract_text_from_image(file_path)
        
        elif file_extension == '.pdf':
            # Process PDF files
            return await extract_text_from_pdf(file_path)
        
        else:
            # For other file types, return placeholder
            return f"Document type {file_extension} not supported for OCR"
            
    except Exception as e:
        print(f"OCR extraction failed: {e}")
        return "OCR extraction failed"

async def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from image using Tesseract OCR
    """
    try:
        # For PoC, use mock OCR if Tesseract is not available
        if not TESSERACT_AVAILABLE:
            return mock_ocr_extraction(image_path)
        
        # Use Tesseract OCR
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        
        # Clean up text
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
        
    except Exception as e:
        print(f"Image OCR failed: {e}")
        return mock_ocr_extraction(image_path)

async def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF using PyMuPDF
    """
    try:
        # For PoC, use mock extraction if PyMuPDF is not available
        if not PYMUPDF_AVAILABLE:
            return mock_pdf_extraction(pdf_path)
        
        # Use PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        
        for page in doc:
            text += page.get_text()
        
        doc.close()
        
        # Clean up text
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
        
    except Exception as e:
        print(f"PDF extraction failed: {e}")
        return mock_pdf_extraction(pdf_path)

async def classify_document(ocr_text: str, expected_type: str) -> Dict[str, Any]:
    """
    Classify document using AI (mock implementation for PoC)
    
    Args:
        ocr_text: Extracted text from document
        expected_type: Expected document type
    
    Returns:
        Classification result with confidence and verification status
    """
    # Convert text to lowercase for matching
    text_lower = ocr_text.lower()
    
    # Find best matching classification
    best_match = None
    best_confidence = 0.0
    
    for doc_type, classification in DOCUMENT_CLASSIFICATIONS.items():
        # Count keyword matches
        keyword_matches = sum(
            1 for keyword in classification['keywords']
            if keyword.lower() in text_lower
        )
        
        # Calculate confidence based on keyword matches
        if keyword_matches > 0:
            confidence = min(
                classification['confidence'],
                keyword_matches / len(classification['keywords'])
            )
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_match = doc_type
    
    # Determine if document is verified
    is_verified = (
        best_match == expected_type.lower().replace(' ', '_') and
        best_confidence > 0.7
    )
    
    return {
        'classification': best_match or 'unknown',
        'confidence': best_confidence,
        'is_verified': is_verified,
        'expected_type': expected_type,
        'text_length': len(ocr_text)
    }

def is_tesseract_available() -> bool:
    """
    Check if Tesseract OCR is available
    """
    return TESSERACT_AVAILABLE

def is_pymupdf_available() -> bool:
    """
    Check if PyMuPDF is available
    """
    return PYMUPDF_AVAILABLE

def mock_ocr_extraction(image_path: str) -> str:
    """
    Mock OCR extraction for PoC when Tesseract is not available
    """
    # Extract filename to determine document type
    filename = os.path.basename(image_path).lower()
    
    if 'p45' in filename:
        return """
        P45 - Tax and National Insurance Certificate
        Employee leaving employment
        HMRC reference: 123456789
        Tax code: BR
        National Insurance: AB123456C
        """
    elif 'p60' in filename:
        return """
        P60 - End of Year Certificate
        Tax year: 2023/24
        HMRC reference: 987654321
        Total pay: £45,000
        Tax deducted: £8,500
        """
    elif 'passport' in filename:
        return """
        UK Passport
        Passport number: 123456789
        Surname: SMITH
        Given names: JOHN
        Date of birth: 15 JAN 1985
        Place of birth: LONDON
        """
    else:
        return f"Mock OCR text extracted from {filename}"

def mock_pdf_extraction(pdf_path: str) -> str:
    """
    Mock PDF extraction for PoC when PyMuPDF is not available
    """
    filename = os.path.basename(pdf_path).lower()
    
    if 'bank' in filename:
        return """
        Bank Statement
        Account: 12345678
        Sort Code: 12-34-56
        Balance: £2,500.00
        Date: 31/12/2023
        """
    elif 'utility' in filename:
        return """
        Utility Bill
        Account: UTIL123456
        Address: 123 Main Street, London
        Amount: £85.50
        Due Date: 15/01/2024
        """
    else:
        return f"Mock PDF text extracted from {filename}"

async def validate_document_format(document_type: str, file_path: str) -> Dict[str, Any]:
    """
    Validate document format and content
    
    Args:
        document_type: Expected document type
        file_path: Path to the document file
    
    Returns:
        Validation result
    """
    try:
        # Check file exists
        if not os.path.exists(file_path):
            return {
                'valid': False,
                'error': 'File not found'
            }
        
        # Check file size (max 10MB for PoC)
        file_size = os.path.getsize(file_path)
        if file_size > 10 * 1024 * 1024:  # 10MB
            return {
                'valid': False,
                'error': 'File too large (max 10MB)'
            }
        
        # Check file extension
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff']
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension not in allowed_extensions:
            return {
                'valid': False,
                'error': f'File type {file_extension} not supported'
            }
        
        return {
            'valid': True,
            'file_size': file_size,
            'file_type': file_extension
        }
        
    except Exception as e:
        return {
            'valid': False,
            'error': str(e)
        } 