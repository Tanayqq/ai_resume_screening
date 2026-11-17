from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_home_endpoint_returns_running_message():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "ML service running"}


def test_docs_endpoint_is_reachable():
    response = client.get("/docs")
    assert response.status_code == 200


def test_metrics_endpoint_is_reachable():
    response = client.get("/metrics")
    assert response.status_code == 200
    # Prometheus metrics are plain text, not JSON
    assert "http_requests_total" in response.text or "python_info" in response.text


def test_analyze_files_returns_error_when_no_job_description_given():
    # Send a resume file but deliberately omit BOTH job_description_text and job_description_file
    files = {"resumes": ("resume.txt", b"Some resume content", "text/plain")}
    response = client.post("/analyze-files", files=files)
    assert response.status_code == 200
    body = response.json()
    assert "error" in body


JD = {"job_description_text": "Python developer"}


def _analyze(filename, content):
    return client.post("/analyze-files", files={"resumes": (filename, content)}, data=JD)


def test_empty_resume_file_returns_400():
    response = _analyze("resume.pdf", b"")
    assert response.status_code == 400
    assert "empty" in response.json()["detail"]


def test_unsupported_resume_format_returns_400():
    response = _analyze("photo.png", b"\x89PNG fake image bytes")
    assert response.status_code == 400
    assert "unsupported format" in response.json()["detail"]


def test_corrupt_pdf_returns_400():
    response = _analyze("resume.pdf", b"this is not really a pdf")
    assert response.status_code == 400
    assert "could not be read" in response.json()["detail"]


def test_non_utf8_txt_returns_400():
    response = _analyze("resume.txt", b"\xff\xfe\xfa bad bytes")
    assert response.status_code == 400
    assert "not UTF-8" in response.json()["detail"]


def test_whitespace_only_resume_returns_400():
    response = _analyze("resume.txt", b"   \n\t  ")
    assert response.status_code == 400
    assert "no readable text" in response.json()["detail"]


def test_valid_txt_resume_is_scored():
    response = _analyze("resume.txt", b"Python developer with 3 years of experience in SQL")
    assert response.status_code == 200
    assert response.json()["results"][0]["final_score"] > 0
