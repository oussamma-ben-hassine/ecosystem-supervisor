# Politique de Sécurité & Confidentialité des Données

## 1. Principes de Sécurité

1. **Authentification Forte Serveur-à-Serveur** :
   Chaque application de l'écosystème dispose d'une clé API d'ingestion unique commençant par `es_<app>_...`. Côté superviseur, seules les empreintes hachées (SHA-256) sont persistées en base. Le champ `application` transmis dans le payload est vérifié et écrasé par l'identité associée à la clé validée, empêchant toute usurpation d'identité applicative.

2. **Cloisonnement & RBAC Administrateur** :
   Les endpoints de consultation et d'administration exigent un jeton JWT valide délivré via OIDC. Seuls les comptes explicitement déclarés dans `ADMIN_EMAILS` peuvent acquitter des alertes, exporter les journaux ou révoquer des clés d'ingestion.

3. **Protection Contre les Injections & Exécution Arbitraire** :
   L'Assistant IA Superviseur n'a pas accès direct à un interpréteur SQL brut ni au shell système. Il utilise un ensemble de fonctions typées Python (`tool_get_user_activity`, `tool_get_login_stats`, etc.) avec validation préalable des paramètres.

4. **Conformité RGPD & Minimisation** :
   - Zéro stockage des contenus des messages instantanés.
   - Zéro stockage des contenus bruts des fichiers et documents.
   - Zéro stockage des prompts ou réponses privées d'intelligence artificielle.
   - Purge automatique selon les politiques de rétention (365 jours audit, 90 jours IA).
   - Possibilité d'exportation intégrale des données d'un utilisateur sous format CSV.
