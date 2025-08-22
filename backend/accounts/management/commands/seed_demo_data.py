from django.core.management.base import BaseCommand
from accounts.models import User
from jobs.models import Job
from applications.models import Application
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Crée des données de démonstration complètes pour le système HR'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Supprime toutes les données existantes avant de créer les nouvelles'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write("🗑️ Suppression des données existantes...")
            Application.objects.all().delete()
            Job.objects.all().delete()
            User.objects.filter(email__in=[
                'admin@example.com', 'recruiter@example.com', 'candidate@example.com'
            ]).delete()
            self.stdout.write("✅ Données supprimées")

        self.stdout.write("🌱 Création des données de démonstration...")

        # Créer des utilisateurs de base s'ils n'existent pas
        admin_user = self.create_user_if_not_exists(
            'admin@example.com', 'Admin123!', 'Admin Principal', 'admin'
        )
        
        # Créer des recruteurs
        recruiters = []
        recruiter_data = [
            ('sarah.dupont@techcorp.com', 'Recruit123!', 'Sarah Dupont', 'recruiter'),
            ('marc.leroy@techcorp.com', 'Recruit123!', 'Marc Leroy', 'recruiter'),
            ('julie.martin@techcorp.com', 'Recruit123!', 'Julie Martin', 'recruiter'),
        ]
        
        for email, password, name, role in recruiter_data:
            user = self.create_user_if_not_exists(email, password, name, role)
            recruiters.append(user)

        # Créer des candidats
        candidates = []
        candidate_data = [
            ('alex.smith@email.com', 'Candidate123!', 'Alex Smith', 'candidate'),
            ('marie.garcia@email.com', 'Candidate123!', 'Marie Garcia', 'candidate'),
            ('thomas.brown@email.com', 'Candidate123!', 'Thomas Brown', 'candidate'),
            ('lisa.johnson@email.com', 'Candidate123!', 'Lisa Johnson', 'candidate'),
            ('david.wilson@email.com', 'Candidate123!', 'David Wilson', 'candidate'),
            ('sophie.davis@email.com', 'Candidate123!', 'Sophie Davis', 'candidate'),
            ('michael.miller@email.com', 'Candidate123!', 'Michael Miller', 'candidate'),
            ('emma.taylor@email.com', 'Candidate123!', 'Emma Taylor', 'candidate'),
        ]
        
        for email, password, name, role in candidate_data:
            user = self.create_user_if_not_exists(email, password, name, role)
            candidates.append(user)

        # Créer des postes
        jobs = []
        job_data = [
            {
                'title': 'Développeur Full Stack Senior',
                'description': 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe de développement. Vous travaillerez sur des projets innovants utilisant les dernières technologies.',
                'department': 'Développement',
                'location': 'Paris, France',
                'seniority': 'senior',
                'status': 'open',
                'required_skills': ['React', 'Node.js', 'MongoDB', 'TypeScript'],
                'nice_to_have': ['Docker', 'AWS', 'GraphQL'],
                'recruiter': recruiters[0]
            },
            {
                'title': 'Développeur Frontend React',
                'description': 'Poste de développeur Frontend spécialisé React pour notre application web. Vous participerez à la conception et au développement d\'interfaces utilisateur modernes.',
                'department': 'Développement',
                'location': 'Lyon, France',
                'seniority': 'mid',
                'status': 'open',
                'required_skills': ['React', 'JavaScript', 'CSS3', 'HTML5'],
                'nice_to_have': ['TypeScript', 'Redux', 'Jest'],
                'recruiter': recruiters[1]
            },
            {
                'title': 'Développeur Backend Python',
                'description': 'Développeur Backend Python pour développer des APIs robustes et des microservices. Vous travaillerez avec Django, FastAPI et des bases de données relationnelles.',
                'department': 'Développement',
                'location': 'Marseille, France',
                'seniority': 'mid',
                'status': 'open',
                'required_skills': ['Python', 'Django', 'PostgreSQL', 'REST API'],
                'nice_to_have': ['FastAPI', 'Docker', 'Redis'],
                'recruiter': recruiters[2]
            },
            {
                'title': 'DevOps Engineer',
                'description': 'Ingénieur DevOps pour automatiser nos processus de déploiement et maintenir notre infrastructure cloud. Vous travaillerez avec AWS, Kubernetes et Terraform.',
                'department': 'Infrastructure',
                'location': 'Toulouse, France',
                'seniority': 'senior',
                'status': 'open',
                'required_skills': ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
                'nice_to_have': ['Jenkins', 'Prometheus', 'Grafana'],
                'recruiter': recruiters[0]
            },
            {
                'title': 'Data Scientist',
                'description': 'Data Scientist pour analyser nos données et développer des modèles de machine learning. Vous travaillerez avec Python, Pandas, Scikit-learn et des outils de visualisation.',
                'department': 'Data',
                'location': 'Nantes, France',
                'seniority': 'senior',
                'status': 'open',
                'required_skills': ['Python', 'Pandas', 'Scikit-learn', 'SQL'],
                'nice_to_have': ['TensorFlow', 'PyTorch', 'Tableau'],
                'recruiter': recruiters[1]
            },
            {
                'title': 'Développeur Mobile iOS',
                'description': 'Développeur Mobile iOS pour créer des applications mobiles natives. Vous maîtriserez Swift, UIKit et les bonnes pratiques de développement iOS.',
                'department': 'Mobile',
                'location': 'Bordeaux, France',
                'seniority': 'mid',
                'status': 'open',
                'required_skills': ['Swift', 'UIKit', 'iOS SDK', 'Xcode'],
                'nice_to_have': ['SwiftUI', 'Core Data', 'Firebase'],
                'recruiter': recruiters[2]
            },
            {
                'title': 'Product Manager',
                'description': 'Product Manager pour définir la stratégie produit et coordonner les équipes de développement. Vous aurez une vision claire du marché et des besoins utilisateurs.',
                'department': 'Produit',
                'location': 'Paris, France',
                'seniority': 'senior',
                'status': 'open',
                'required_skills': ['Gestion de projet', 'Analyse de marché', 'Agile', 'Jira'],
                'nice_to_have': ['SQL', 'Analytics', 'Design Thinking'],
                'recruiter': recruiters[0]
            },
            {
                'title': 'UX/UI Designer',
                'description': 'Designer UX/UI pour créer des expériences utilisateur exceptionnelles. Vous maîtriserez Figma, les principes de design et la recherche utilisateur.',
                'department': 'Design',
                'location': 'Lille, France',
                'seniority': 'mid',
                'status': 'open',
                'required_skills': ['Figma', 'Design Thinking', 'Prototypage', 'Recherche utilisateur'],
                'nice_to_have': ['Adobe Creative Suite', 'HTML/CSS', 'Principle'],
                'recruiter': recruiters[1]
            }
        ]

        for job_info in job_data:
            job = Job.objects.create(
                title=job_info['title'],
                description=job_info['description'],
                department=job_info['department'],
                location=job_info['location'],
                seniority=job_info['seniority'],
                status=job_info['status'],
                required_skills=job_info['required_skills'],
                nice_to_have=job_info['nice_to_have'],
                recruiter=job_info['recruiter'],
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            jobs.append(job)
            self.stdout.write(f"✅ Poste créé: {job.title}")

        # Créer des candidatures
        application_statuses = ['received', 'reviewing', 'shortlisted', 'rejected', 'hired']
        application_weights = [0.4, 0.3, 0.15, 0.1, 0.05]  # Probabilités pour chaque statut
        
        for candidate in candidates:
            # Chaque candidat postule à 2-4 postes
            num_applications = random.randint(2, 4)
            selected_jobs = random.sample(jobs, num_applications)
            
            for job in selected_jobs:
                # Générer un score réaliste basé sur la correspondance des compétences
                base_score = random.randint(60, 95)
                
                # Bonus si le candidat a des compétences correspondantes
                candidate_skills = self.generate_candidate_skills(candidate.full_name)
                matching_skills = len(set(candidate_skills) & set(job.required_skills))
                if matching_skills > 0:
                    base_score += min(15, matching_skills * 5)
                
                score = min(100, base_score)
                
                # Choisir un statut basé sur le score
                if score >= 90:
                    status = 'shortlisted'
                elif score >= 80:
                    status = 'reviewing'
                elif score >= 70:
                    status = 'received'
                else:
                    status = 'rejected'
                
                # Créer la candidature
                application = Application.objects.create(
                    candidate=candidate,
                    job=job,
                    score=score,
                    status=status,
                    created_at=datetime.now() - timedelta(days=random.randint(1, 20))
                )
                
                self.stdout.write(f"📝 Candidature créée: {candidate.full_name} → {job.title} (Score: {score}, Statut: {status})")

        self.stdout.write(self.style.SUCCESS("🎉 Données de démonstration créées avec succès !"))
        self.stdout.write(f"📊 Résumé:")
        self.stdout.write(f"   - {len(recruiters)} recruteurs")
        self.stdout.write(f"   - {len(candidates)} candidats")
        self.stdout.write(f"   - {len(jobs)} postes")
        self.stdout.write(f"   - {Application.objects.count()} candidatures")

    def create_user_if_not_exists(self, email, password, full_name, role):
        # Vérifier si l'utilisateur existe déjà
        existing_user = User.objects.filter(email=email).first()
        
        if existing_user:
            self.stdout.write(f"👤 Utilisateur existant: {full_name} ({role})")
            return existing_user
        
        # Créer un nouvel utilisateur
        user = User(
            email=email,
            full_name=full_name,
            role=role,
            is_active=True
        )
        
        # Définir le mot de passe (cela va automatiquement hasher le mot de passe)
        user.set_password(password)
        user.save()
        
        self.stdout.write(f"👤 Utilisateur créé: {full_name} ({role})")
        return user

    def generate_candidate_skills(self, candidate_name):
        """Génère des compétences réalistes basées sur le nom du candidat"""
        all_skills = [
            'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C#',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'MongoDB', 'PostgreSQL', 'MySQL',
            'Git', 'Jenkins', 'Agile', 'Scrum', 'Figma', 'Adobe XD', 'HTML', 'CSS',
            'Swift', 'Kotlin', 'Flutter', 'React Native', 'Vue.js', 'Angular'
        ]
        
        # Utiliser le nom pour avoir des compétences cohérentes
        random.seed(hash(candidate_name))
        num_skills = random.randint(3, 6)
        selected_skills = random.sample(all_skills, num_skills)
        random.seed()  # Réinitialiser le seed
        
        return selected_skills
