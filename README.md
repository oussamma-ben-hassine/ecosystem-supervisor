# Ecosystem Supervisor — oussamma.tn

Système centralisé indépendant de supervision, télémétrie, observabilité 360°, suivi IA et détection d'anomalies pour l'écosystème `oussamma.tn`.

![Ecosystem Supervisor Architecture](https://img.shields.io/badge/Architecture-Decoupled-indigo)
![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Python-009688)
![PostgreSQL](https://img.shields.io/badge/Storage-PostgreSQL%2016-336791)
![Redis Streams](https://img.shields.io/badge/Queue-Redis%20Streams-red)
![LiteLLM](https://img.shields.io/badge/AI-LiteLLM%20Gateway-purple)
![Coolify](https://img.shields.io/badge/Deployment-Coolify-blue)

---

## 1. Vue d'Ensemble & Fonctionnalités Clés

- **Application 100% Indépendante** : Propre dépôt GitHub, propre backend, frontend, base PostgreSQL, files Redis Streams et déploiement Docker / Coolify.
- **Domaine Cible** : `https://supervisor.oussamma.tn`
- **Dashboard Général** : KPIs temps réel (DAU, WAU, MAU, événements 24h, connexions SSO, consommation IA, alertes de sécurité actives).
- **Annuaire Central des Utilisateurs** : Identification certifiée par le couple `issuer + sub` issu de `https://sso-a.oussamma.tn`.
- **User Activity 360°** : Chronologie interactive unifiée de toutes les actions d'un utilisateur à travers toutes les applications avec filtre temporel, export CSV et mention claire des applications non intégrées pour éviter tout biais d'exhaustivité.
- **Journal Global d'Activités** : Moteur de recherche et d'audit avec identifiants de corrélation, filtres multi-critères et métadonnées JSON.
- **Supervision des Données** : Suivi des opérations sur les ressources (fichiers, CV, notes, recettes, etc.) sans jamais stocker les contenus privés des documents.
- **Supervision LiteLLM** : Télémétrie complète (requêtes, tokens prompt/completion, modèles utilisés, coûts estimés, latences, erreurs).
- **Moteur d'Alertes & Détection d'Anomalies** : Échecs répétés de login, suppressions massives, téléchargements anormaux, pics de consommation IA.
- **Assistant IA Superviseur** : Interface conversationnelle connectée à LiteLLM avec outillage de requête analytique sécurisé et interdiction absolue de toute commande arbitraire SQL/shell.
- **SDKs Officiels** : TypeScript/Node.js (`@oussamma/supervisor-sdk`) et Python (`supervisor_sdk`) avec retries, backoff exponentiel et envoi asynchrone non-bloquant.

---

## 2. Architecture Technique

```
┌────────────────────────────────────────────────────────┐
│                   Écosystème oussamma.tn               │
│  [SSO]  [Drive]  [Messenger]  [CV Builder]  [Recettes] │
└───────────────────────────┬────────────────────────────┘
                            │ SDKs (TS / Python)
                            │ POST /api/v1/events/batch
                            ▼
┌────────────────────────────────────────────────────────┐
│              ECOSYSTEM SUPERVISOR                      │
│                                                        │
│  ┌────────────────┐       ┌─────────────────────────┐  │
│  │ FastAPI Server │ ───►  │ Redis Streams Queue     │  │
│  │ (Ingestion API)│       │ (events:stream)         │  │
│  └───────┬────────┘       └───────────┬─────────────┘  │
│          │                            │                │
│          ▼                            ▼                │
│  ┌────────────────┐       ┌─────────────────────────┐  │
│  │ PostgreSQL 16  │ ◄───  │ Background Workers      │  │
│  │ (Audit DB)     │       │ & Alert Engine          │  │
│  └───────┬────────┘       └─────────────────────────┘  │
│          │                                             │
│          ▼                                             │
│  ┌────────────────┐       ┌─────────────────────────┐  │
│  │ Next.js 14 UI  │ ◄───► │ LiteLLM (ai.oussamma.tn)│  │
│  │ (App Router)   │       │ Assistant IA & Tooling  │  │
│  └────────────────┘       └─────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Démarrage Rapide (Docker Compose)

```bash
# 1. Cloner le dépôt
git clone https://github.com/oussamma-ben-hassine/ecosystem-supervisor.git
cd ecosystem-supervisor

# 2. Configurer les variables d'environnement
cp .env.example .env

# 3. Lancer la pile complète
docker-compose up -d --build

# 4. Vérifier les services
docker-compose ps
```

- **Frontend UI** : `http://localhost:3000` (ou `https://supervisor.oussamma.tn`)
- **Backend API & Swagger Docs** : `http://localhost:8000/docs`
- **Health check** : `http://localhost:8000/health`
