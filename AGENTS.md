# Directives pour Agents Codex / IA — Écosystème oussamma.tn

Ce document s'applique obligatoirement à tous les agents de développement, d'architecture ou de maintenance intervenant sur les applications de l'écosystème `oussamma.tn`.

---

## Règle Absolue : Télémétrie & Événements Métier Obligatoires

Lors de l'implémentation, du refactoring ou de l'ajout d'une nouvelle fonctionnalité métier dans une application de l'écosystème :

**Tout événement significatif pour l'audit, la sécurité ou les statistiques DOIT être instrumenté et émis vers le superviseur central.**

### Exemples d'obligations d'instrumentation :
1. **Création d'une entité métier** : `[ressource].created`
2. **Modification d'état critique** : `[ressource].updated`
3. **Suppression définitive ou logique** : `[ressource].deleted`
4. **Téléchargement ou export de données** : `[ressource].downloaded`, `[ressource].exported`
5. **Partage ou modification d'accès** : `[ressource].shared`, `[ressource].permission_changed`
6. **Consommation de ressources IA (LLM)** : `ai.completion` avec nombre de tokens consommés.
7. **Échec d'autorisation ou rejet de sécurité** : `[domaine].access_denied`

---

## Règles de Confidentialité Impératives

1. **Ne JAMAIS transmettre de contenu sensible** :
   - Interdiction formelle de journaliser des mots de passe, tokens JWT, clés API ou cookies.
   - Ne pas transmettre les corps de messages texte privés (seule l'action d'envoi et les métadonnées de volume/chiffrement sont autorisées).
   - Ne pas transmettre les prompts privés ou les réponses complètes de l'IA (uniquement le modèle, les tokens et le coût estimé).

2. **Identification certifiée OIDC** :
   - Toujours associer l'acteur par son couple `issuer + sub` fourni par le SSO `https://sso-a.oussamma.tn`.
   - Ne pas inventer d'identifiants utilisateurs arbitraires si une session SSO est active.

3. **Non-blocage du flux métier** :
   - L'envoi des événements au superviseur doit s'effectuer de manière asynchrone non-bloquante (utilisation des SDKs officiels `@oussamma/supervisor-sdk` ou `supervisor_sdk`).
   - Une indisponibilité du superviseur ne doit sous aucun prétexte bloquer l'action de l'utilisateur final.

---

## Déclaration dans les Fichiers de Nouvelles Fonctionnalités

Pour chaque PR ou commit ajoutant une fonctionnalité, l'agent Codex doit mentionner dans la documentation ou la description du commit :
- Le type d'événement émis (ex: `invoice.generated`)
- Les métadonnées autorisées
- La vérification du bon fonctionnement du tracing.
