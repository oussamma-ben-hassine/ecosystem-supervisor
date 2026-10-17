# Guide d'Intégration des SDKs Superviseur

## 1. SDK TypeScript / Node.js (`@oussamma/supervisor-sdk`)

### Installation & Initialisation

```bash
npm install @oussamma/supervisor-sdk
```

Dans votre point d'entrée serveur (ex: `server.ts`, `app.ts` ou route Next.js API) :

```typescript
import { initSupervisor, getSupervisor } from '@oussamma/supervisor-sdk';

// Initialisation globale avec variables d'environnement
initSupervisor({
  endpoint: process.env.SUPERVISOR_URL || 'https://supervisor.oussamma.tn',
  apiKey: process.env.SUPERVISOR_API_KEY, // ex: es_drive_xxxx
  applicationId: 'drive',
});

const supervisor = getSupervisor();

// 1. Tracer une action métier
supervisor.track({
  event_type: 'file.downloaded',
  actor: {
    issuer: 'https://sso-a.oussamma.tn',
    sub: req.user.sub,
    email: req.user.email,
  },
  resource: {
    type: 'file',
    id: file.id,
    name: file.name,
    mime_type: file.mimeType,
    size_bytes: file.size,
  },
  outcome: 'success',
});

// 2. Déclarer une consommation de tokens LLM
supervisor.reportUsage({
  model: 'gemini-1.5-flash',
  promptTokens: 420,
  completionTokens: 85,
  userSub: req.user.sub,
});
```

---

## 2. SDK Python (`supervisor_sdk`)

### Utilisation dans FastAPI ou Django

```python
import os
from supervisor_sdk import init_supervisor, get_supervisor

# Initialiser une seule fois au démarrage
init_supervisor(
    endpoint=os.getenv("SUPERVISOR_URL", "https://supervisor.oussamma.tn"),
    api_key=os.getenv("SUPERVISOR_API_KEY"),
    app_id="drive",
)

supervisor = get_supervisor()

# Tracer une opération asynchrone non-bloquante
supervisor.track(
    event_type="file.deleted",
    actor={
        "issuer": "https://sso-a.oussamma.tn",
        "sub": current_user.sub,
    },
    resource={
        "type": "file",
        "id": str(file_id),
    },
    outcome="success",
    metadata={"permanent": True},
)
```

### Variables d'environnement standard pour chaque application :

```env
SUPERVISOR_URL=https://supervisor.oussamma.tn
SUPERVISOR_API_KEY=es_<app_code>_<secret>
SUPERVISOR_APP_ID=<app_code>
```
