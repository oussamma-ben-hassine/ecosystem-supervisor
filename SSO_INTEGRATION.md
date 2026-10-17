# Intégration SSO — sso-a.oussamma.tn

Le Superviseur s'intègre au SSO central existant (`https://sso-a.oussamma.tn`) de deux façons complémentaires :

1. **Authentification des Administrateurs du Superviseur (OIDC Client)**
2. **Réception des Événements d'Authentification (Telemetry Ingestion)**

---

## 1. Protocole OIDC Standard

Le superviseur agit comme un client OIDC standard :
- **Issuer** : `https://sso-a.oussamma.tn`
- **Client ID** : `ecosystem-supervisor`
- **Redirect URI** : `https://supervisor.oussamma.tn/api/v1/auth/sso/callback`
- **Scopes demandés** : `openid profile email`

Lors du retour du jeton d'accès (`access_token` et `id_token`), le superviseur extrait :
- `sub` : Identifiant stable utilisateur
- `email` : Adresse vérifiée
- `name` : Nom de l'utilisateur

Si l'email appartient à la liste `ADMIN_EMAILS` (`oussammabenhassine@gmail.com`), le rôle `admin` est accordé.

---

## 2. Transmission Sécurisée des Événements d'Authentification

Le SSO existant utilise le SDK Python (`supervisor_sdk`) ou le SDK Node pour émettre des événements d'audit lors des flux d'authentification :

```python
from supervisor_sdk import get_supervisor

supervisor = get_supervisor()

# Lors d'un succès de connexion :
supervisor.track(
    event_type="sso.login",
    actor={
        "issuer": "https://sso-a.oussamma.tn",
        "sub": user.sub,
        "email": user.email,
        "name": user.name,
    },
    outcome="success",
    metadata={
        "auth_method": "password",
        "client_ip": request.client.host,
    }
)

# Lors d'un échec de connexion :
supervisor.track(
    event_type="sso.login_failed",
    actor={
        "issuer": "https://sso-a.oussamma.tn",
        "sub": attempted_username,
    },
    outcome="failure",
    metadata={
        "reason": "invalid_credentials",
        "client_ip": request.client.host,
    }
)
```

### Règle d'or de confidentialité :
Le SSO ne transmet JAMAIS de mot de passe, ni en clair ni haché, ni de secret de session.
