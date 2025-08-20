# 🧑‍💼 My HR App – ATS intelligent avec Django, MongoDB et IA

Un **Applicant Tracking System (ATS)** développé avec **Django + DRF**, **MongoDB (MongoEngine)** et une intégration **IA (Sentence-Transformers)** pour analyser automatiquement les CV et les offres d’emploi.  

Ce projet permet de :  
- 📂 Gérer les **utilisateurs** (admin, recruteur, candidat).  
- 📑 Gérer les **jobs** et les **applications** (candidatures).  
- 🤖 Lancer une **analyse IA** d’un CV (extraction de compétences, expériences, éducation).  
- 🔎 Comparer plusieurs CV sur une offre et retourner les **5 meilleurs candidats**.  
- 🔔 Envoyer des **notifications** automatiques ou manuelles.  

---

## 🚀 Technologies

- **Backend** : Django 4.2 + Django REST Framework  
- **Base de données** : MongoDB (via MongoEngine)  
- **File processing** : Textract (PDF, DOCX, TXT parsing)  
- **IA** : Sentence-Transformers (`all-MiniLM-L6-v2`)  
- **Asynchrone** : Celery + Redis (pour les tâches d’analyse IA et de notifications)  

---

## 📦 Installation

### 1. Cloner le projet

git clone https://github.com/username/my-hr-app.git
cd my-hr-app

### 2. Créer un environnement virtuel

python3 -m venv .venv
source .venv/bin/activate  
ou (windows)
.venv\Scripts\activate      

### 3. Installer les dépendances

pip install -r requirements.txt

### 4. Configurer les variables d’environnement

Créer un fichier .env à la racine :

SECRET_KEY=changeme
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

/ MongoDB
MONGODB_URI=mongodb://localhost:27017/hrms

/ Redis
REDIS_URL=redis://localhost:6379/0

### 5. Lancer le serveur Django
python manage.py runserver

### 6. Lancer Celery (tâches async)
celery -A hrms_backend worker --loglevel=info

### 🛠 Endpoints principaux
#### 🔑 Authentification

POST /api/auth/register/ → créer un utilisateur

POST /api/auth/login/ → obtenir un token

##### 📂 Jobs

POST /api/jobs/ → créer une offre

GET /api/jobs/ → lister les offres

POST /api/jobs/{job_id}/analyze/ → analyser toutes les candidatures d’une offre et renvoyer les 5 meilleurs candidats

#### 📑 Applications

POST /api/applications/ → déposer une candidature (CV uploadé en PDF/DOCX/TXT)

POST /api/applications/{app_id}/analyze/ → analyser une candidature précise

#### 🔔 Notifications

POST /api/notifications/ → créer une notification

GET /api/notifications/ → voir les notifications

#### 🤖 Exemple d’analyse IA

POST /api/jobs/{job_id}/analyze/
Réponse :

{
  "job_id": "68a5d83d23f09608a8855ee7",
  "top_candidates": [
    {
      "candidate": "68a5b2e7e763655ff070a73a",
      "score": 11.0,
      "skills": ["python", "django", "docker", "aws"]
    },
    {
      "candidate": "68a5cdc13280efd30e40f464",
      "score": 9.5,
      "skills": ["mongodb", "rest", "ci/cd"]
    }
  ]
}

🧪 Tests

Lancer les tests unitaires :

pytest

📌 Roadmap

 Gestion des utilisateurs (Admin, Recruteur, Candidat)

 CRUD Jobs & Applications

 Analyse IA d’un CV (skills/exp/education)

 Analyse groupée d’un Job → Top 5 candidats

 Notifications manuelles et automatiques

 Intégration Frontend (React / Next.js)

 Dashboard recruteur avec analytics

👨‍💻 Auteur

Projet développé par Ilyas Maalal,Boussad Ait joudi Oufella, Akram Chouichi, Saddem Lahsen.