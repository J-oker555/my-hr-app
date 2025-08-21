# ai/service.py
from __future__ import annotations
import re
from typing import Dict, Any, List, Optional

from sentence_transformers import SentenceTransformer, util

# ⚙️ Charger le modèle UNE SEULE FOIS (au démarrage du worker)
# all-MiniLM-L6-v2 ~22M params, très rapide CPU
_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model: Optional[SentenceTransformer] = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(_MODEL_NAME)  # télécharge au 1er run, cache local ~/.cache
    return _model

# Petit lexique de compétences “connues” (à enrichir au besoin)
SKILLS_CANON = [
    "python","django","fastapi","flask",
    "rest","graphql",
    "mongodb","postgresql","mysql","redis",
    "docker","kubernetes","ci/cd","git","github actions","gitlab ci",
    "aws","gcp","azure",
    "react","vue","angular","typescript","javascript",
    "pandas","numpy","spark","airflow","kafka",
]

def _simple_extractions(text: str) -> Dict[str, List[str]]:
    text_l = (text or "").lower()

    skills = [s for s in SKILLS_CANON if s in text_l]

    education = []
    if re.search(r"(licen[sc]e|bachelor|master|ingénieur|engineer|mba|ph\.?d)", text_l, re.I):
        education.append("Mention de formation détectée")

    experience = []
    if re.search(r"(\d+)\s*(ans?|years?)", text_l, re.I):
        experience.append("Mention d'expérience détectée")

    return {
        "skills": sorted(list(set(skills))),
        "education": education,
        "experience": experience,
    }

def _clean(s: str) -> str:
    return (s or "").strip()

def analyze_text(cv_text: str, job_desc: str) -> Dict[str, Any]:
    """
    Retourne un dict:
    {
      skills: [..], education: [..], experience: [..],
      score: float 0..100,
      recommendations: [..]
    }
    """
    cv_text = _clean(cv_text)
    job_desc = _clean(job_desc)

    # 1) Embeddings + similarité (score global)
    model = get_model()
    emb_cv = model.encode(cv_text, normalize_embeddings=True)
    emb_job = model.encode(job_desc, normalize_embeddings=True)
    sim = float(util.cos_sim(emb_cv, emb_job))  # [-1..1]
    score = round(max(sim, 0.0) * 100.0, 1)     # 0..100

    # 2) Extractions simples (rapides)
    ext_cv = _simple_extractions(cv_text)
    ext_job = _simple_extractions(job_desc)

    # 3) Recommandations = skills “job” non vus dans CV
    required = set(ext_job["skills"])
    found = set(ext_cv["skills"])
    missing = [s for s in sorted(required) if s not in found]
    recs = [f"Ajoutez/illustrez '{s}' dans le CV si c'est pertinent." for s in missing]

    return {
        "skills": ext_cv["skills"],
        "education": ext_cv["education"],
        "experience": ext_cv["experience"],
        "score": score,
        "recommendations": recs,
    }
