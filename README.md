# XeuySil — Client (Intégration Continue)

Dépôt du frontend de la plateforme **XeuySil** : mise en relation entre recruteurs et travailleurs journaliers au Sénégal.

## Présentation

Ce dépôt contient les deux applications clientes du projet :

| Application | Technologie | Public cible |
|-------------|------------|--------------|
| **Console d'administration** | Next.js (React, TypeScript) | Administrateurs, modérateurs et agents |
| **Application mobile** | Flutter (Dart) | Travailleurs et recruteurs |

## Stack technique

### Console d'administration (web)
- **Next.js** avec React et TypeScript
- **TanStack Query** pour la gestion des requêtes
- **Zod** pour la validation des données

### Application mobile
- **Flutter** (Dart), Android en priorité
- **Riverpod** pour la gestion d'état
- **Dio** pour les appels réseau
- **Drift** (SQLite) pour le cache local

## Structure attendue

```
client-ic/
├── apps/
│   ├── admin-web/      # Console d'administration (Next.js)
│   │   ├── src/
│   │   ├── package.json
│   │   └── next.config.js
│   └── mobile/         # Application mobile (Flutter)
│       ├── lib/
│       ├── pubspec.yaml
│       └── analysis_options.yaml
├── tests/
├── Dockerfile          # Image Docker de la console web
├── Jenkinsfile
├── package.json
└── README.md
```

## Pipeline CI (à venir)

Le pipeline Jenkins sera configuré après intégration du code applicatif :

1. Récupération du code
2. Installation des dépendances (npm)
3. Vérification du style (lint)
4. Exécution des tests
5. Analyse de sécurité (npm audit)
6. Construction de l'image Docker de la console web
7. Analyse de vulnérabilités de l'image (Trivy)
8. Publication sur Docker Hub avec tag versionné
9. Compilation de l'APK Flutter (archivée dans Jenkins)

## Équipe

| Membre | Responsabilité |
|--------|---------------|
| Malick Cissoko | Développement du frontend (mobile + administration) |
| Boubacar NIANG | Intégration continue et déploiement |

## Licence

Projet universitaire — Master 2 SI-SR, UADB (2026-2027).
