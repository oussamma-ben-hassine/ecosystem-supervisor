# Spécification OpenAPI / Contrat d'API du Superviseur

Toutes les requêtes d'ingestion serveur-à-serveur requièrent le header HTTP :
`X-Supervisor-Key: es_<app>_<secret>`

---

## 1. Endpoints d'Ingestion Applicative

### `POST /api/v1/events/batch`
Ingère un lot d'événements (jusqu'à 500 par requête).
- **Entête** : `X-Supervisor-Key: es_<app>_<secret>`
- **Corps de la requête** :
```json
{
  "events": [
    {
      "event_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "event_type": "file.downloaded",
      "event_version": 1,
      "actor": {
        "issuer": "https://sso-a.oussamma.tn",
        "sub": "user-oussamma-001",
        "email": "oussammabenhassine@gmail.com"
      },
      "occurred_at": "2026-10-17T06:30:00Z",
      "resource": {
        "type": "file",
        "id": "file-123"
      },
      "outcome": "success",
      "metadata": {
        "mime_type": "application/pdf"
      }
    }
  ]
}
```
- **Réponse HTTP 200** :
```json
{
  "status": "success",
  "processed": 1,
  "failed": 0,
  "errors": null,
  "ingested_at": "2026-10-17T06:30:01Z"
}
```

---

## 2. Endpoints d'Administration & Consultation

### `GET /api/v1/users`
Liste les utilisateurs certifiés avec filtres et pagination.

### `GET /api/v1/users/{id}/activity`
Historique 360° chronologique multi-applications pour un utilisateur donné.

### `GET /api/v1/users/{id}/export`
Exportation du journal d'activité individuel au format CSV.

### `GET /api/v1/events`
Consultation globale du journal d'audit avec filtres par corrélation, statut et application.

### `GET /api/v1/analytics/overview`
Retourne les indicateurs clés DAU, WAU, MAU, taux d'échecs SSO et tendances 7 jours.

### `GET /api/v1/analytics/ai-usage`
Retourne les métriques de consommation LiteLLM par modèle et par application.

### `GET /api/v1/alerts`
Liste les alertes de sécurité actives et résolues.

### `POST /api/v1/alerts/{id}/resolve`
Acquitte et résout une alerte de sécurité.

### `POST /api/v1/assistant/query`
Interrogation en langage naturel via LiteLLM avec outillage analytique sécurisé.
