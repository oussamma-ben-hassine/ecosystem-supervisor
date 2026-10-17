# État d'Intégration de l'Écosystème oussamma.tn

| Application | Dépôt GitHub | URL / FQDN | Statut Déploiement | Statut Intégration Superviseur | Événements Pris en Charge |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ecosystem-supervisor** | `oussamma-ben-hassine/ecosystem-supervisor` | `https://supervisor.oussamma.tn` | Opérationnel (Coolify / Docker) | Natif (Système central) | Administration, Ingestion, Alertes |
| **sso-anty** | `oussamma-ben-hassine/sso-anty` | `https://sso-a.oussamma.tn` | En ligne (Coolify) | Intégré (OIDC + Telemetry) | `sso.login`, `sso.login_failed`, `sso.logout` |
| **drive** | `oussamma-ben-hassine/drive` | `https://drive.oussamma.tn` | Configuré Docker | Intégré (SDK Python / TS) | `file.created`, `file.downloaded`, `file.shared`, `file.deleted` |
| **ecosystem-smart-messenger** | `oussamma-ben-hassine/ecosystem-smart-messenger` | `https://messenger.oussamma.tn` | En ligne (Coolify) | Intégré (SDK TS) | `conversation.created`, `message.sent`, `call.started` |
| **cv-builder-ai** | `oussamma-ben-hassine/cv-builder-ai` | `https://cv.oussamma.tn` | En ligne (Coolify) | Intégré (SDK TS) | `cv.created`, `cv.updated`, `cv.exported_pdf`, `ai.completion` |
| **ai.oussamma.tn** (LiteLLM) | `oussamma-ben-hassine/ai.oussamma.tn` | `https://ai.oussamma.tn` | En ligne (Coolify) | Intégré (API Telemetry) | `ai.completion`, `ai.tokens`, `ai.cost`, `ai.error` |
| **oussamma.tn** (Portail) | `oussamma-ben-hassine/oussamma.tn` | `https://oussamma.tn` | En ligne (Coolify) | Intégré | `portal.app_opened`, `portal.access_denied` |
| **recettes.oussamma.tn** | `oussamma-ben-hassine/recettes.oussamma.tn` | `https://recettes.oussamma.tn` | En ligne (Coolify) | Intégré | `recipe.viewed`, `recipe.created`, `ai.nutrition` |
| **notes.oussamma.tn** | `oussamma-ben-hassine/notes.oussamma.tn` | `https://notes.oussamma.tn` | En ligne (Coolify) | Intégré | `note.created`, `note.updated`, `note.deleted` |
| **devspace.oussamma.tn** | `oussamma-ben-hassine/devspace.oussamma.tn` | `https://devspace.oussamma.tn` | En ligne (Coolify) | Compatible | `session.started`, `terminal.exec` |
| **tv-player** | `oussamma-ben-hassine/tv-player` | `https://tv.oussamma.tn` | En ligne (Coolify) | Compatible | `stream.started`, `channel.switched` |
