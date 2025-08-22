import pdfplumber
import spacy
from sentence_transformers import SentenceTransformer, util
import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class CVAnalyzer:
    """
    Service d'analyse des CV pour calculer la compatibilité avec les offres d'emploi
    """
    
    def __init__(self):
        try:
            # Initialiser le modèle de transformation de phrases
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("✅ Modèle SentenceTransformer chargé avec succès")
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement du modèle: {e}")
            self.model = None
        
        try:
            # Charger le modèle spaCy pour l'extraction d'entités
            self.nlp = spacy.load("fr_core_news_sm")
            logger.info("✅ Modèle spaCy chargé avec succès")
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement de spaCy: {e}")
            self.nlp = None

    def extract_text_from_pdf(self, pdf_file) -> str:
        """
        Extrait le texte d'un fichier PDF
        """
        try:
            text = ""
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'extraction du PDF: {e}")
            return ""

    def clean_text(self, text: str) -> str:
        """
        Nettoie le texte extrait
        """
        if not text:
            return ""
        
        # Supprimer les caractères spéciaux et normaliser
        cleaned = re.sub(r'[^\w\s\.\,\-\+\#]', ' ', text)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = re.sub(r'[^\w\s]', '', cleaned)
        
        return cleaned.strip()

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extrait les entités nommées du texte (compétences, expérience, éducation)
        """
        if not self.nlp or not text:
            return {"skills": [], "experience": [], "education": []}
        
        try:
            doc = self.nlp(text)
            
            # Compétences techniques (mots-clés)
            skills_keywords = [
                'python', 'java', 'javascript', 'react', 'node.js', 'django', 'flask',
                'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes', 'aws', 'azure',
                'git', 'jenkins', 'agile', 'scrum', 'figma', 'adobe', 'html', 'css',
                'swift', 'kotlin', 'flutter', 'machine learning', 'ai', 'data science'
            ]
            
            skills = []
            experience = []
            education = []
            
            # Extraire les compétences
            text_lower = text.lower()
            for skill in skills_keywords:
                if skill in text_lower:
                    skills.append(skill.title())
            
            # Extraire les entités nommées
            for ent in doc.ents:
                if ent.label_ in ['ORG', 'PRODUCT']:
                    skills.append(ent.text)
                elif ent.label_ == 'DATE':
                    # Chercher des patterns d'expérience (ex: "5 ans", "3 ans")
                    if 'ans' in ent.text.lower() or 'années' in ent.text.lower():
                        experience.append(ent.text)
                elif ent.label_ == 'GPE':  # Lieux
                    education.append(ent.text)
            
            return {
                "skills": list(set(skills)),
                "experience": list(set(experience)),
                "education": list(set(education))
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'extraction d'entités: {e}")
            return {"skills": [], "experience": [], "education": []}

    def calculate_compatibility(self, cv_text: str, job_description: str) -> Dict[str, float]:
        """
        Calcule la compatibilité entre un CV et une offre d'emploi
        """
        if not self.model or not cv_text or not job_description:
            return {
                "overall_score": 0.0,
                "skills_match": 0.0,
                "experience_match": 0.0,
                "semantic_similarity": 0.0
            }
        
        try:
            # Nettoyer les textes
            cv_clean = self.clean_text(cv_text)
            job_clean = self.clean_text(job_description)
            
            # Calculer la similarité sémantique
            cv_emb = self.model.encode(cv_clean, convert_to_tensor=True)
            job_emb = self.model.encode(job_clean, convert_to_tensor=True)
            
            semantic_similarity = util.cos_sim(cv_emb, job_emb).item()
            
            # Extraire les entités
            cv_entities = self.extract_entities(cv_text)
            job_entities = self.extract_entities(job_description)
            
            # Calculer la correspondance des compétences
            cv_skills = set([skill.lower() for skill in cv_entities["skills"]])
            job_skills = set([skill.lower() for skill in job_entities["skills"]])
            
            if job_skills:
                skills_match = len(cv_skills.intersection(job_skills)) / len(job_skills)
            else:
                skills_match = 0.0
            
            # Calculer la correspondance de l'expérience
            experience_match = 0.0
            if cv_entities["experience"] and job_entities["experience"]:
                # Logique simple pour l'expérience
                experience_match = min(1.0, len(cv_entities["experience"]) / 2)
            
            # Score global pondéré
            overall_score = (
                semantic_similarity * 0.4 +
                skills_match * 0.4 +
                experience_match * 0.2
            )
            
            return {
                "overall_score": round(overall_score * 100, 2),
                "skills_match": round(skills_match * 100, 2),
                "experience_match": round(experience_match * 100, 2),
                "semantic_similarity": round(semantic_similarity * 100, 2)
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du calcul de compatibilité: {e}")
            return {
                "overall_score": 0.0,
                "skills_match": 0.0,
                "experience_match": 0.0,
                "semantic_similarity": 0.0
            }

    def analyze_cv_for_job(self, cv_file, job_description: str) -> Dict:
        """
        Analyse complète d'un CV pour un poste donné
        """
        try:
            # Extraire le texte du CV
            cv_text = self.extract_text_from_pdf(cv_file)
            if not cv_text:
                return {
                    "error": "Impossible d'extraire le texte du CV",
                    "compatibility": 0.0
                }
            
            # Calculer la compatibilité
            compatibility = self.calculate_compatibility(cv_text, job_description)
            
            # Extraire les entités
            entities = self.extract_entities(cv_text)
            
            return {
                "cv_text": cv_text[:500] + "..." if len(cv_text) > 500 else cv_text,
                "compatibility": compatibility,
                "entities": entities,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'analyse du CV: {e}")
            return {
                "error": str(e),
                "compatibility": 0.0,
                "success": False
            }

# Instance globale pour réutilisation
cv_analyzer = CVAnalyzer()
