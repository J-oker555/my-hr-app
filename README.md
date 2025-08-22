# 🚀 My HR Application

Une application complète de gestion des ressources humaines avec backend Django et frontend React moderne.

## 📋 **Table des matières**

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🏗️ Architecture](#️-architecture)
- [⚙️ Backend (Django)](#️-backend-django)
- [🎨 Frontend (React)](#-frontend-react)
- [🚀 Installation et démarrage](#-installation-et-démarrage)
- [🔧 Configuration](#-configuration)
- [📊 Fonctionnalités](#-fonctionnalités)
- [🛠️ API Endpoints](#️-api-endpoints)
- [👥 Rôles et permissions](#-rôles-et-permissions)
- [🤖 Intelligence Artificielle](#-intelligence-artificielle)
- [📈 Analytics et rapports](#-analytics-et-rapports)
- [🐳 Docker](#-docker)
- [📝 Commandes utiles](#-commandes-utiles)
- [🔍 Troubleshooting](#-troubleshooting)

## 🎯 **Vue d'ensemble**

**My HR Application** est une plateforme complète de gestion RH qui permet aux recruteurs de publier des offres d'emploi, aux candidats de postuler avec leurs CV, et aux administrateurs de gérer l'ensemble du système avec des analyses avancées.

### **✨ Caractéristiques principales**
- 🔐 **Authentification JWT** sécurisée
- 👥 **Gestion des rôles** (Admin, Recruteur, Candidat)
- 📝 **Gestion des offres d'emploi** complète
- 📄 **Upload/Download de CV** (PDF uniquement)
- 🤖 **Analyse automatique des CV** avec IA
- 📊 **Tableaux de bord** interactifs et analytics
- 🎨 **Interface moderne** avec Tailwind CSS
- 📱 **Responsive design** pour tous les appareils

## 🏗️ **Architecture**

```
my-hr-app/
├── backend/                 # API Django
│   ├── accounts/           # Gestion des utilisateurs
│   ├── jobs/              # Gestion des offres d'emploi
│   ├── applications/      # Gestion des candidatures
│   ├── analytics/         # Statistiques et rapports
│   ├── ai/               # Intelligence artificielle
│   ├── notifications/     # Système de notifications
│   └── hrms_backend/      # Configuration principale
├── front_end/             # Interface React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   └── stores/        # Gestion d'état Zustand
│   └── public/            # Assets statiques
└── docker-compose.yml     # Configuration Docker
```

## ⚙️ **Backend (Django)**

### **🔧 Technologies utilisées**
- **Django 4.2+** - Framework web Python
- **Django REST Framework** - API REST
- **MongoEngine** - ODM pour MongoDB
- **Celery** - Tâches asynchrones
- **JWT** - Authentification sécurisée
- **CORS** - Communication cross-origin

### **🗄️ Base de données**
- **MongoDB** - Base de données NoSQL
- **Collections principales** :
  - `users` - Utilisateurs et profils
  - `jobs` - Offres d'emploi
  - `applications` - Candidatures
  - `analytics` - Données statistiques

### **🏛️ Structure des modèles**

#### **1. User (accounts/models.py)**
```python
class User(Document):
    email = EmailField(required=True, unique=True)
    name = StringField(required=True)
    role = StringField(choices=['admin', 'recruiter', 'candidate'])
    password_hash = StringField(required=True)
    cv_file = FileField()  # Pour les candidats
    created_at = DateTimeField(default=datetime.utcnow)
```

#### **2. Job (jobs/models.py)**
```python
class Job(Document):
    title = StringField(required=True)
    company = StringField(required=True)
    location = StringField(required=True)
    description = StringField(required=True)
    requirements = ListField(StringField())
    salary_range = StringField()
    recruiter = ReferenceField(User, required=True)
    status = StringField(choices=['open', 'closed'])
    created_at = DateTimeField(default=datetime.utcnow)
```

#### **3. Application (applications/models.py)**
```python
class Application(Document):
    candidate = ReferenceField(User, required=True)
    job = ReferenceField(Job, required=True)
    cv_file = FileField(required=True)
    cover_letter = StringField()
    score = FloatField()  # Score de compatibilité IA
    extracted_skills = ListField(StringField())
    status = StringField(choices=['pending', 'reviewed', 'accepted', 'rejected'])
    created_at = DateTimeField(default=datetime.utcnow)
```

### **🔐 Système d'authentification**

#### **JWT Configuration**
```python
# hrms_backend/settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Temporairement ouvert
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

#### **Endpoints d'authentification**
- `POST /api/accounts/auth/register/` - Inscription
- `POST /api/accounts/auth/login/` - Connexion
- `GET /api/accounts/me/` - Profil utilisateur
- `POST /api/accounts/auth/refresh/` - Renouvellement du token

### **🤖 Intelligence Artificielle**

#### **Analyse automatique des CV**
```python
# ai/cv_analyzer.py
class CVAnalyzer:
    def extract_text_from_pdf(self, pdf_bytes):
        """Extrait le texte d'un PDF"""
        
    def extract_entities(self, text):
        """Extrait les entités (compétences, expérience)"""
        
    def calculate_compatibility(self, cv_text, job_description):
        """Calcule le score de compatibilité"""
```

#### **Technologies IA utilisées**
- **pdfplumber** - Extraction de texte PDF
- **spaCy** - Traitement du langage naturel
- **sentence-transformers** - Calcul de similarité sémantique
- **Torch** - Framework de deep learning

### **📊 Analytics et rapports**

#### **Métriques disponibles**
```python
# analytics/views.py
def metrics(request):
    return Response({
        'users': {
            'total': User.objects.count(),
            'by_role': {...},
            'growth_rate': '...'
        },
        'jobs': {
            'total': Job.objects.count(),
            'open': Job.objects.filter(status='open').count(),
            'by_company': {...}
        },
        'applications': {
            'total': Application.objects.count(),
            'by_status': {...},
            'avg_score': '...'
        }
    })
```

#### **Endpoints analytics**
- `GET /api/analytics/metrics/` - Métriques complètes
- `GET /api/analytics/dashboard_summary/` - Résumé dashboard
- `GET /api/applications/compatibility_stats/` - Statistiques de compatibilité

### **🔌 API REST**

#### **Structure des endpoints**
```
/api/
├── accounts/
│   ├── auth/
│   │   ├── register/
│   │   ├── login/
│   │   └── refresh/
│   ├── users/
│   ├── me/
│   ├── upload_cv/
│   └── download_cv/
├── jobs/
│   ├── jobs/
│   ├── top/
│   ├── my_jobs/
│   └── recruiter_stats/
├── applications/
│   ├── applications/
│   ├── analyze_cv/
│   └── compatibility_stats/
└── analytics/
    ├── metrics/
    └── dashboard_summary/
```

#### **Exemple de réponse API**
```json
{
  "id": 1,
  "title": "Développeur Full Stack",
  "company": "TechCorp",
  "location": "Paris",
  "description": "Nous recherchons un développeur...",
  "requirements": ["React", "Python", "MongoDB"],
  "recruiter_info": {
    "id": 2,
    "name": "Jean Dupont",
    "email": "jean@techcorp.com"
  },
  "status": "open",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### **⚡ Tâches asynchrones (Celery)**

#### **Configuration Celery**
```python
# hrms_backend/celery.py
app = Celery('hrms_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# ai/tasks.py
@app.task
def analyze_cv_async(application_id):
    """Analyse asynchrone d'un CV"""
```

#### **Tâches disponibles**
- **Analyse de CV** - Traitement automatique des candidatures
- **Notifications** - Envoi d'emails et notifications
- **Rapports** - Génération de rapports périodiques

## 🎨 **Frontend (React)**

### **🔧 Technologies utilisées**
- **React 18** - Bibliothèque UI
- **Vite** - Build tool rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **Zustand** - Gestion d'état
- **Axios** - Client HTTP
- **React Router** - Navigation

### **🏗️ Architecture des composants**

#### **Structure des pages**
```
src/pages/
├── auth/
│   ├── Login.tsx          # Connexion
│   └── Register.tsx       # Inscription
├── Dashboard.tsx          # Dashboard principal
├── Jobs.tsx              # Gestion des offres
├── Applications.tsx       # Gestion des candidatures
├── Users.tsx             # Gestion des utilisateurs
├── Analytics.tsx         # Page analytics
├── Profile.tsx           # Profil candidat
└── RecruiterDashboard.tsx # Dashboard recruteur
```

#### **Composants réutilisables**
```
src/components/
├── layout/
│   ├── AppLayout.tsx      # Layout principal
│   └── Navigation.tsx     # Navigation
├── charts/
│   ├── MetricCard.tsx     # Carte de métrique
│   ├── BarChart.tsx       # Graphique en barres
│   ├── PieChart.tsx       # Graphique circulaire
│   └── CompatibilityChart.tsx # Graphique compatibilité
└── common/
    ├── Button.tsx         # Bouton personnalisé
    ├── Input.tsx          # Input personnalisé
    └── Modal.tsx          # Modal
```

### **🎨 Design System**

#### **Palette de couleurs**
```css
/* Couleurs principales */
--primary: #2563eb;      /* Bleu principal */
--secondary: #9333ea;    /* Violet secondaire */
--success: #059669;       /* Vert succès */
--warning: #ea580c;       /* Orange avertissement */
--danger: #dc2626;        /* Rouge danger */
--dark: #1f2937;         /* Noir foncé */
--light: #f9fafb;        /* Blanc cassé */
```

#### **Gradients utilisés**
```css
/* Gradients de fond */
.bg-gradient-primary {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
}

.bg-gradient-secondary {
  background: linear-gradient(135deg, #059669 0%, #2563eb 100%);
}
```

### **📱 Responsive Design**

#### **Breakpoints Tailwind**
```css
/* Mobile First */
sm: 640px   /* Tablettes */
md: 768px   /* Petits écrans */
lg: 1024px  /* Écrans moyens */
xl: 1280px  /* Grands écrans */
2xl: 1536px /* Très grands écrans */
```

#### **Grilles adaptatives**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* S'adapte automatiquement à la taille d'écran */}
</div>
```

## 🚀 **Installation et démarrage**

### **Prérequis**
- Python 3.11+
- Node.js 18+
- MongoDB 5.0+
- Docker & Docker Compose (optionnel)

### **1. Cloner le projet**
```bash
git clone <repository-url>
cd my-hr-app
```

### **2. Backend (Django)**
```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env
# Éditer .env avec tes configurations

# Migrations
python manage.py migrate

# Créer un superuser
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### **3. Frontend (React)**
```bash
cd front_end

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

### **4. Docker (optionnel)**
```bash
# Lancer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

## 🔧 **Configuration**

### **Variables d'environnement (.env)**
```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données
MONGO_URI=mongodb://localhost:27017/hrms_db
MONGO_DB_NAME=hrms_db

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=1
JWT_REFRESH_TOKEN_LIFETIME=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### **Configuration MongoDB**
```python
# hrms_backend/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': os.getenv('MONGO_DB_NAME', 'hrms_db'),
        'CLIENT': {
            'host': os.getenv('MONGO_URI', 'mongodb://localhost:27017/'),
        }
    }
}
```

## 📊 **Fonctionnalités**

### **👥 Gestion des utilisateurs**
- ✅ Inscription/Connexion sécurisée
- ✅ Gestion des rôles (Admin, Recruteur, Candidat)
- ✅ Profils utilisateurs complets
- ✅ Upload/Download de CV (PDF)

### **💼 Gestion des offres d'emploi**
- ✅ Création et édition d'offres
- ✅ Recherche et filtrage
- ✅ Gestion des statuts (Ouvert/Fermé)
- ✅ Attribution automatique au recruteur

### **📝 Gestion des candidatures**
- ✅ Postulation avec CV
- ✅ Analyse automatique des CV
- ✅ Calcul de score de compatibilité
- ✅ Suivi des statuts

### **📈 Analytics et rapports**
- ✅ Tableaux de bord interactifs
- ✅ Métriques en temps réel
- ✅ Graphiques et visualisations
- ✅ Statistiques de performance

### **🤖 Intelligence Artificielle**
- ✅ Extraction automatique de texte PDF
- ✅ Analyse des compétences
- ✅ Calcul de compatibilité CV/Poste
- ✅ Recommandations intelligentes

## 🛠️ **API Endpoints**

### **🔐 Authentification**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/accounts/auth/register/` | Inscription utilisateur |
| POST | `/api/accounts/auth/login/` | Connexion utilisateur |
| POST | `/api/accounts/auth/refresh/` | Renouvellement token |
| GET | `/api/accounts/me/` | Profil utilisateur |

### **👥 Utilisateurs**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/accounts/users/` | Liste des utilisateurs |
| POST | `/api/accounts/users/` | Créer un utilisateur |
| GET | `/api/accounts/users/{id}/` | Détails utilisateur |
| PUT | `/api/accounts/users/{id}/` | Modifier utilisateur |
| DELETE | `/api/accounts/users/{id}/` | Supprimer utilisateur |

### **💼 Offres d'emploi**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/jobs/jobs/` | Liste des offres |
| POST | `/api/jobs/jobs/` | Créer une offre |
| GET | `/api/jobs/jobs/{id}/` | Détails de l'offre |
| PUT | `/api/jobs/jobs/{id}/` | Modifier l'offre |
| DELETE | `/api/jobs/jobs/{id}/` | Supprimer l'offre |
| GET | `/api/jobs/top/` | Top des offres |
| GET | `/api/jobs/my_jobs/` | Mes offres (recruteur) |

### **📝 Candidatures**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/applications/applications/` | Liste des candidatures |
| POST | `/api/applications/applications/` | Créer une candidature |
| GET | `/api/applications/applications/{id}/` | Détails candidature |
| PUT | `/api/applications/applications/{id}/` | Modifier candidature |
| DELETE | `/api/applications/applications/{id}/` | Supprimer candidature |

### **📊 Analytics**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/analytics/metrics/` | Métriques complètes |
| GET | `/api/analytics/dashboard_summary/` | Résumé dashboard |

## 👥 **Rôles et permissions**

### **🔑 Admin**
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gestion des utilisateurs
- ✅ Gestion des offres d'emploi
- ✅ Accès aux analytics
- ✅ Configuration système

### **👔 Recruteur**
- ✅ Création et gestion de ses offres
- ✅ Consultation des candidatures
- ✅ Dashboard personnel
- ✅ Statistiques de ses offres

### **👤 Candidat**
- ✅ Consultation des offres ouvertes
- ✅ Postulation avec CV
- ✅ Suivi de ses candidatures
- ✅ Profil personnel

## 🤖 **Intelligence Artificielle**

### **📄 Analyse de CV**
```python
class CVAnalyzer:
    def __init__(self):
        self.nlp = spacy.load("fr_core_news_sm")
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    def analyze_cv(self, cv_bytes, job_description):
        # 1. Extraction du texte
        text = self.extract_text_from_pdf(cv_bytes)
        
        # 2. Nettoyage et normalisation
        clean_text = self.clean_text(text)
        
        # 3. Extraction des entités
        skills = self.extract_entities(clean_text)
        
        # 4. Calcul de compatibilité
        score = self.calculate_compatibility(clean_text, job_description)
        
        return {
            'score': score,
            'skills': skills,
            'recommendations': self.generate_recommendations(score, skills)
        }
```

### **🎯 Calcul de compatibilité**
```python
def calculate_compatibility(self, cv_text, job_description):
    # Encodage des textes
    cv_embedding = self.model.encode(cv_text)
    job_embedding = self.model.encode(job_description)
    
    # Calcul de similarité cosinus
    similarity = util.pytorch_cos_sim(cv_embedding, job_embedding)
    
    # Conversion en pourcentage
    score = float(similarity[0][0]) * 100
    
    return min(max(score, 0), 100)  # Entre 0 et 100
```

## 📈 **Analytics et rapports**

### **📊 Métriques disponibles**
- **Utilisateurs** : Total, par rôle, taux de croissance
- **Offres** : Total, ouvertes, par entreprise, par localisation
- **Candidatures** : Total, par statut, score moyen, taux de conversion
- **Performance** : Temps de réponse, satisfaction, ROI

### **📈 Visualisations**
- **Graphiques en barres** : Évolution dans le temps
- **Graphiques circulaires** : Répartition par catégorie
- **Graphiques de compatibilité** : Scores CV/Poste
- **Métriques en temps réel** : Dashboard live

## 🐳 **Docker**

### **Services inclus**
```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/
    depends_on:
      - mongo
      - redis
  
  frontend:
    build: ./front_end
    ports:
      - "5173:5173"
    depends_on:
      - backend
  
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### **Commandes Docker**
```bash
# Construire et démarrer
docker-compose up --build

# Démarrer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter
docker-compose down

# Nettoyer
docker-compose down -v --remove-orphans
```

## 📝 **Commandes utiles**

### **🔧 Backend Django**
```bash
# Créer un superuser
python manage.py createsuperuser

# Seeder la base de données
python manage.py seed_simple_data

# Réinitialiser la base
python manage.py reset_db

# Changer un mot de passe
python manage.py set_password <email> <new_password>

# Vérifier la santé de l'API
curl http://localhost:8000/api/health/
```

### **🎨 Frontend React**
```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint

# Tests
npm run test
```

### **🗄️ Base de données**
```bash
# Connexion MongoDB
mongosh mongodb://localhost:27017/hrms_db

# Voir les collections
show collections

# Compter les documents
db.users.countDocuments()
db.jobs.countDocuments()
db.applications.countDocuments()
```

## 🔍 **Troubleshooting**

### **❌ Problèmes courants**

#### **1. ModuleNotFoundError**
```bash
# Solution : Installer les dépendances
pip install -r requirements.txt
npm install
```

#### **2. Erreur de connexion MongoDB**
```bash
# Vérifier que MongoDB est démarré
sudo systemctl start mongod

# Vérifier la connexion
mongosh mongodb://localhost:27017/
```

#### **3. CORS errors**
```python
# Vérifier la configuration CORS dans settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

#### **4. CSS non chargé**
```bash
# Vérifier que Tailwind est compilé
npm run build

# Vérifier l'import dans main.tsx
import './styles.css'
```

### **🔧 Solutions de débogage**

#### **Backend**
```bash
# Mode debug
DEBUG=True

# Logs détaillés
python manage.py runserver --verbosity=2

# Test de l'API
curl -X GET http://localhost:8000/api/health/
```

#### **Frontend**
```bash
# Console du navigateur
F12 → Console

# Network tab
F12 → Network → Voir les requêtes API

# React DevTools
Extension navigateur React Developer Tools
```

## 🚀 **Déploiement**

### **🌐 Production**
```bash
# Backend
gunicorn hrms_backend.wsgi:application

# Frontend
npm run build
serve -s dist

# Base de données
MongoDB Atlas (cloud) ou serveur dédié
```

### **🔒 Sécurité en production**
```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['ton-domaine.com']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

## 📞 **Support et contribution**

### **🐛 Signaler un bug**
1. Vérifier les issues existantes
2. Créer une nouvelle issue avec :
   - Description du problème
   - Étapes de reproduction
   - Logs d'erreur
   - Environnement (OS, versions)

### **💡 Proposer une amélioration**
1. Créer une issue "Feature Request"
2. Décrire la fonctionnalité souhaitée
3. Expliquer l'utilité
4. Proposer une implémentation

### **🔧 Contribuer au code**
1. Fork le projet
2. Créer une branche feature
3. Implémenter les changements
4. Tester localement
5. Créer une Pull Request

---

## 🎉 **Félicitations !**

Tu as maintenant une application HR complète et moderne ! 

**Prochaines étapes suggérées :**
1. 🧪 **Tester toutes les fonctionnalités**
2. 🎨 **Personnaliser le design selon tes goûts**
3. 🚀 **Déployer en production**
4. 📊 **Ajouter de nouvelles métriques**
5. 🤖 **Améliorer l'IA d'analyse**

**Besoin d'aide ?** N'hésite pas à poser des questions ! 🚀