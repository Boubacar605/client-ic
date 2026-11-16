# XeuySil — Application Client (Intégration Continue)

Dépôt du frontend de la plateforme **XeuySil** — mise en relation entre recruteurs et travailleurs journaliers au Sénégal.

## Présentation

XeuySil est une application universelle (mobile Android/iOS + web) construite avec **Expo / React Native**. Elle regroupe en une seule app quatre espaces distincts selon le rôle de l'utilisateur :

| Rôle | Espace | Fonctionnalités principales |
|------|--------|----------------------------|
| **Travailleur** | `/travailleur` | Consulter les missions, gérer les disponibilités, suivre les candidatures |
| **Recruteur** | `/recruteur` | Publier des missions, sélectionner des candidats, suivre les présences |
| **Agent** | `/agent` | Inscrire des travailleurs, transmettre des réponses, proposer des missions |
| **Administrateur** | `/admin` | Tableau de bord, gestion des comptes, référentiels, commissions |

## Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Framework mobile | Expo / React Native | SDK 58 |
| Langage | TypeScript | 6.0 |
| Navigation | Expo Router (file-based) | 58 |
| Requêtes API | TanStack Query + Axios | 5.x / 1.x |
| Stockage sécurisé | expo-secure-store | — |
| Style | React Native StyleSheet + design tokens | — |
| Linter | expo lint (ESLint interne) | — |

## Architecture

L'application utilise le routage par fichiers d'Expo Router. Les routes non connectées se trouvent dans `(auth)/`, les routes connectées dans `(app)/`.

```
src/
├── app/
│   ├── (auth)/          # Pages non connectées (welcome, login, register…)
│   ├── (app)/           # Pages connectées
│   │   ├── admin/       # Back-office administrateur
│   │   ├── agent/       # Espace agent terrain
│   │   ├── recruteur/   # Espace recruteur
│   │   └── travailleur/ # Espace travailleur
├── api/                 # Couche réseau (axios + hooks TanStack Query)
├── auth/                # Gestion de session (JWT + sessionStorage démo)
├── data/                # Données statiques (métiers, photos)
├── lib/                 # Utilitaires (format, validation, stockage)
├── theme/               # Design tokens (couleurs, espacements, rayons)
└── ui/                  # 30+ composants réutilisables
```

## Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Expo CLI (`npm install -g expo-cli`) ou `npx expo`

## Installation

```bash
# Cloner le dépôt
git clone git@github.com:Boubacar605/client-ic.git
cd client-ic

# Installer les dépendances
npm ci

# Copier et configurer les variables d'environnement
cp .env.example .env
# Modifier EXPO_PUBLIC_API_URL avec l'adresse de votre backend
```

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | URL de l'API backend (mobile) | `http://192.168.1.10:8080/api/v1` |
| `EXPO_PUBLIC_API_URL_WEB` | URL de l'API backend (web) | `http://localhost:8080/api/v1` |
| `EXPO_PUBLIC_ADMIN_ROUTE` | Route d'accès administration | `backoffice-acces` |

Voir `.env.example` pour le modèle complet.

## Scripts disponibles

```bash
# Démarrer le serveur de développement
npx expo start

# Lancer sur Android
npx expo start --android

# Lancer sur iOS
npx expo start --ios

# Lancer en mode web
npx expo start --web

# Vérifier le style (lint)
npx expo lint

# Exporter pour le web (production)
npx expo export --platform web
```

## Pipeline CI (Jenkins)

Le pipeline d'intégration continue est défini dans `Jenkinsfile` :

| Étape | Commande | Description |
|-------|---------|-------------|
| Checkout | `checkout scm` | Récupération du code depuis Git |
| Installation | `npm ci` | Installation des dépendances |
| Lint | `expo lint` | Vérification du style de code |
| Export web | `expo export --platform web` | Génération des fichiers statiques |
| Docker build | `docker build .` | Construction de l'image nginx |
| Trivy scan | `trivy image` | Analyse des vulnérabilités |
| Push | `docker push` | Publication sur Docker Hub |

**Image publiée :** `boubacar605/xeuysil-client:latest`

## Connexion démo (sans backend Supabase)

L'API expose un endpoint `/auth/demo-login/:role` qui génère un JWT local signé sans passer par Supabase. Cela permet de tester l'interface complète en local :

- **Travailleur** — Amadou Diallo (démo)
- **Recruteur** — Fatou Ndiaye (démo)
- **Agent** — Moussa Sarr (démo)
- **Administrateur** — Admin Démo

## Équipe

| Membre | Rôle |
|--------|------|
| Malick Cissoko | Développement frontend (mobile + administration) |
| Boubacar NIANG | Intégration continue et déploiement |

## Licence

Projet universitaire — Master 2 SI-SR, UADB (2026-2027).
