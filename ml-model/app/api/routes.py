from fastapi import APIRouter, UploadFile, File, Form, Body, HTTPException
from fastapi.responses import FileResponse
from typing import List, Optional
import joblib
import time

from app.services.file_parser import extract_text
from app.core.pipeline import process_resumes
from app.services.report import generate_excel_report

router = APIRouter()

# Load model once
model = joblib.load("models/model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")


# ==============================
# 📥 DOWNLOAD REPORT API
# ==============================
@router.post("/download-report")
async def download_report(results: List[dict] = Body(...)):
    """
    Generate and download Excel report from frontend results
    """

    # ✅ Generate unique filename
    filename = f"report_{int(time.time())}.xlsx"

    file_path = generate_excel_report(results, filename)

    return FileResponse(
        path=file_path,
        filename=filename,  # dynamic name
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# ==============================
# 🚀 ANALYZE FILES API
# ==============================
@router.post("/analyze-files")
async def analyze_files(
    resumes: List[UploadFile] = File(...),
    job_description_text: Optional[str] = Form(None),
    job_description_file: Optional[UploadFile] = File(None)
):
    """
    Analyze resumes against job description
    """

    # 🔹 Get Job Description
    if job_description_file is not None:
        jd_content = await job_description_file.read()
        try:
            jd_text = jd_content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(400, "Job description file must be UTF-8 plain text")

    elif job_description_text is not None:
        jd_text = job_description_text

    else:
        return {"error": "Provide either job_description_text or job_description_file"}

    # 🔹 Extract resume texts
    resume_texts = []

    for file in resumes:
        content = await file.read()
        if not content:
            raise HTTPException(400, f"{file.filename} is empty")
        try:
            text = extract_text(file.filename, content)
        except UnicodeDecodeError:  # subclass of ValueError, so must come first
            raise HTTPException(400, f"{file.filename} is not UTF-8 text")
        except ValueError:
            raise HTTPException(400, f"{file.filename}: unsupported format (use .pdf, .docx or .txt)")
        except Exception:
            # corrupt PDF/DOCX
            raise HTTPException(400, f"{file.filename} could not be read (file may be corrupt)")
        if not text.strip():
            raise HTTPException(400, f"{file.filename} contains no readable text")
        resume_texts.append(text)

    # 🔹 Process resumes
    results = process_resumes(resume_texts, jd_text, model, vectorizer)

    # 🔹 Return results
    return {
        "results": results
    }