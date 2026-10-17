# Guide de Déploiement Coolify — Ecosystem Supervisor

## 1. Déploiement sur Coolify (`https://coolify.oussamma.tn`)

Le superviseur est déployé comme un service indépendant sur l'infrastructure Coolify OVH.

### Configuration du Projet & Ressource Coolify

- **Nom du Projet** : `ecosystem-supervisor`
- **Type de Ressource** : Application Docker Compose ou Service
- **Dépôt Git** : `https://github.com/oussamma-ben-hassine/ecosystem-supervisor`
- **Branche** : `main`
- **FQDN Principal** : `https://supervisor.oussamma.tn`
- **Chemin Docker Compose** : `/docker-compose.yml`

### Ports & Routage Traefik / Coolify

| Service | Port Interne | Domaine / URL Publique |
| :--- | :--- | :--- |
| `frontend` | 3000 | `https://supervisor.oussamma.tn` |
| `backend` | 8000 | `https://supervisor.oussamma.tn/api` (reverse proxy) |
| `postgres` | 5432 | Réseau interne `supervisor_net` uniquement |
| `redis` | 6379 | Réseau interne `supervisor_net` uniquement |

### Variables d'Environnement à déclarer dans Coolify

```env
ENVIRONMENT=production
POSTGRES_USER=supervisor_user
POSTGRES_PASSWORD=supervisor_secret_pass_2026
POSTGRES_DB=supervisor_db

SECRET_KEY=super-secret-supervisor-key-2026-production-secure
SSO_ISSUER=https://sso-a.oussamma.tn
SSO_CLIENT_ID=ecosystem-supervisor
SSO_CLIENT_SECRET=sso_supervisor_secret_2026
SSO_REDIRECT_URI=https://supervisor.oussamma.tn/api/v1/auth/sso/callback

LITELLM_BASE_URL=https://ai.oussamma.tn
LITELLM_API_KEY=sk-oussamma-master-gateway-2026

NEXT_PUBLIC_API_URL=https://supervisor.oussamma.tn
```

---

## 2. Déploiement Automatique via API Coolify

Le script `deploy_coolify.ps1` utilise le token API Coolify pour automatiser le webhook et le cycle de construction sans intervention manuelle.
