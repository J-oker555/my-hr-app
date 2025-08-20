from celery import shared_task
from applications.models import Application
from applications.utils import extract_text_from_bytes
from ai.service import analyze_text

@shared_task(name="ai.analyze_application")
def analyze_application_task(application_id: str):
    app = Application.objects(id=application_id).first()
    if not app:
        return {"error": "application_not_found"}

    cv_text = ""
    if app.cv_file:
        try:
            data = app.cv_file.read()
            filename = getattr(app.cv_file, "filename", "cv.pdf")
            cv_text = extract_text_from_bytes(data, filename)
        except Exception:
            cv_text = ""

    job_desc = app.job.description if app.job else ""

    result = analyze_text(cv_text, job_desc)

    app.extracted_skills = result["skills"]
    app.extracted_education = result["education"]
    app.extracted_experience = result["experience"]
    app.score = float(result["score"])
    app.recommendations = result["recommendations"]
    app.status = "reviewing"
    app.save()

    return {"ok": True, "score": app.score}
