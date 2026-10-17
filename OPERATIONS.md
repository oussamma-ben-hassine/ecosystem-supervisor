# Guide des Opérations & Exploitation

## 1. Monitoring & Healthchecks

- **Liveness probe** : `GET /health` (retourne `HTTP 200 {"status": "healthy"}`)
- **Readiness probe** : `GET /ready` (vérifie la connectivité PostgreSQL et Redis)
- **Métriques** : `GET /api/v1/analytics/overview`

## 2. Sauvegardes & Restauration PostgreSQL

### Sauvegarde à chaud :
```bash
docker exec -t supervisor-postgres pg_dump -U supervisor_user -d supervisor_db > supervisor_backup_$(date +%Y%m%d).sql
```

### Restauration :
```bash
cat supervisor_backup_20261017.sql | docker exec -i supervisor-postgres psql -U supervisor_user -d supervisor_db
```

## 3. Gestion de la File d'Échecs (Dead-Letter Queue)

Si un événement reçu ne peut pas être inséré (schéma altéré ou incohérence), il est automatiquement consigné dans la table `ingestion_failures`.
Pour consulter et retraiter les échecs :
```sql
SELECT id, application_id, error_reason, created_at FROM ingestion_failures WHERE status = 'unresolved';
```

## 4. Purge & Politiques de Rétention

Les tables `activity_events`, `auth_events` et `ai_usage_events` sont purgées périodiquement par le worker selon les règles configurées dans `retention_policies`.
