# Catalogue des Événements — Écosystème oussamma.tn

## 1. Contrat d'Événement Commun Versionné (v1)

```json
{
  "event_id": "c1f7b7a1-8d2a-4a62-95f7-8738ef991c2b",
  "event_type": "file.downloaded",
  "event_version": 1,
  "application": "drive",
  "actor": {
    "issuer": "https://sso-a.oussamma.tn",
    "sub": "user-oussamma-001",
    "email": "oussammabenhassine@gmail.com",
    "name": "Oussamma Ben Hassine"
  },
  "occurred_at": "2026-10-17T06:30:00Z",
  "resource": {
    "type": "file",
    "id": "file-arch-2026",
    "name": "specs_architecture.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 1420000
  },
  "outcome": "success",
  "metadata": {
    "ip_address": "197.3.24.11",
    "storage_backend": "local_disk"
  },
  "correlation_id": "req-9912-audit"
}
```

---

## 2. Événements par Application

### SSO Authenticator (`sso-a.oussamma.tn`)
| Type d'événement | Description | Métadonnées autorisées |
| :--- | :--- | :--- |
| `sso.login` | Connexion réussie d'un utilisateur | `auth_method`, `client_ip`, `user_agent` |
| `sso.login_failed` | Échec de connexion (mot de passe invalide, etc.) | `reason`, `client_ip`, `attempt_count` |
| `sso.logout` | Déconnexion explicite | `session_id` |
| `sso.token_issued` | Émission de jeton OAuth2/OIDC pour un client | `client_id`, `scopes` |
| `sso.token_refreshed` | Rafraîchissement de jeton d'accès | `client_id` |

### ByteVault Drive (`drive.oussamma.tn`)
| Type d'événement | Description | Métadonnées autorisées |
| :--- | :--- | :--- |
| `file.created` | Création ou téléversement initial d'un fichier | `name`, `mime_type`, `size_bytes` |
| `file.updated` | Remplacement de contenu ou renommage | `name`, `version`, `new_size_bytes` |
| `file.downloaded` | Téléchargement d'un fichier | `size_bytes`, `download_type` (direct/zip) |
| `file.shared` | Partage d'un fichier avec un utilisateur ou lien public | `target_user_sub`, `is_public_link`, `expires_at` |
| `file.deleted` | Suppression d'un fichier | `permanent` (bool) |
| `file.permission_changed` | Modification des droits de lecture/écriture | `previous_role`, `new_role` |

### Smart Messenger (`messenger.oussamma.tn`)
| Type d'événement | Description | Métadonnées autorisées (PAS de corps de message) |
| :--- | :--- | :--- |
| `conversation.created` | Création d'un fil de discussion direct ou de groupe | `is_group`, `participant_count`, `is_encrypted` |
| `message.sent` | Envoi d'un message (télémétrie d'activité) | `thread_id`, `has_attachment`, `encrypted` |
| `call.started` | Lancement d'un appel audio/vidéo | `call_type`, `room_id` |
| `call.ended` | Fin d'un appel | `duration_seconds`, `reason` |

### AI CV Builder (`cv.oussamma.tn`)
| Type d'événement | Description | Métadonnées autorisées |
| :--- | :--- | :--- |
| `cv.created` | Création d'un nouveau CV | `title`, `template` |
| `cv.updated` | Modification des sections ou du style | `sections_modified` |
| `cv.deleted` | Suppression d'un CV | `cv_id` |
| `cv.exported_pdf` | Téléchargement ou compilation PDF | `template`, `page_count` |
| `cv.template_selected` | Choix ou changement de modèle visuel | `template_name` |

### LiteLLM AI Gateway (`ai.oussamma.tn`)
| Type d'événement | Description | Métadonnées autorisées (PAS de prompt/réponse) |
| :--- | :--- | :--- |
| `ai.completion` | Requête de complétion LLM achevée | `model`, `prompt_tokens`, `completion_tokens`, `cost`, `duration_ms` |
| `ai.error` | Échec ou dépassement de quota d'un fournisseur | `model`, `error_code`, `provider` |

### Portail Central (`oussamma.tn`)
| Type d'événement | Description | Métadonnées autorisées |
| :--- | :--- | :--- |
| `portal.app_opened` | Clic de lancement d'une application de l'écosystème | `target_app`, `origin` |
| `portal.access_denied` | Tentative d'accès à une application non autorisée | `target_app`, `reason` |
