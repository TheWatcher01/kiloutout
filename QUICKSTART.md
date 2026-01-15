# Guide de Démarrage Rapide - Kiloutout Services PWA

## 🚀 Installation Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/TheWatcher01/kiloutout.git
cd kiloutout

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Initialiser la base de données
npx prisma generate
npx prisma migrate dev --name init
npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts

# 5. Lancer le serveur
npm run dev
```

Ouvrir http://localhost:3000

## 🔑 Comptes de Test

**Administrateur**
- Email: `admin@kiloutout.fr`
- Mot de passe: `admin123`

**Client**
- Email: `client@test.fr`
- Mot de passe: `client123`

## 📚 Pages Principales

### Public
- `/` - Page d'accueil
- `/services` - Catalogue des services
- `/services/[slug]` - Détail d'un service
- `/auth/login` - Connexion
- `/auth/register` - Inscription

### Client (authentifié)
- `/booking` - Créer une réservation
- `/dashboard` - Mon espace client

### Admin (authentifié, rôle ADMIN)
- `/admin` - Gestion des réservations
- `/admin/settings` - Configuration

## 🛠️ Configuration Minimale

Variables essentielles dans `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-32-caracteres-minimum"
```

## 🎯 Fonctionnalités Principales

✅ **Services**
- 6 types de services pré-configurés
- Calculateur de devis interactif
- Options et tarifs modulables

✅ **Réservations**
- Formulaire complet avec carte
- Calcul automatique de distance
- Frais de déplacement transparents
- Validation admin

✅ **Intégrations**
- Google Calendar (optionnel)
- Notifications email (optionnel)
- Géolocalisation OpenStreetMap

✅ **PWA**
- Installable
- Service Worker
- Mode hors ligne partiel

## 📧 Configuration Email (Optionnel)

Pour Gmail:
1. Activer validation en 2 étapes
2. Créer un mot de passe d'application
3. Ajouter dans `.env`:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="votre-email@gmail.com"
EMAIL_SERVER_PASSWORD="mot-de-passe-app"
EMAIL_FROM="noreply@kiloutout.fr"
```

## 🗓️ Configuration Google Calendar (Optionnel)

1. Créer projet sur Google Cloud Console
2. Activer Calendar API
3. Créer identifiants OAuth 2.0
4. Ajouter dans `.env`:

```env
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"
```

5. Se connecter en admin → Paramètres → Connecter Google Calendar

## 🚀 Déploiement Production

### Vercel (Recommandé)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Ajouter PostgreSQL
# Sur Vercel Dashboard → Storage → Create Database → PostgreSQL

# 4. Mettre à jour DATABASE_URL avec l'URL PostgreSQL

# 5. Migrer la base de données
npx prisma migrate deploy
```

### Variables d'environnement Production

⚠️ **Important**: Changer ces valeurs en production:
- `NEXTAUTH_SECRET` → générer avec `openssl rand -base64 32`
- `DATABASE_URL` → utiliser PostgreSQL
- `NEXTAUTH_URL` → votre domaine
- Mots de passe des comptes de test

## 📊 Base de Données

**Tables principales:**
- `users` - Utilisateurs (clients & admins)
- `services` - Types de services
- `bookings` - Réservations
- `settings` - Configuration globale
- `notifications` - Notifications utilisateur

## 🐛 Dépannage

**Problème: Prisma génère des erreurs**
```bash
npx prisma generate
npx prisma migrate reset
```

**Problème: Build échoue**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Problème: Base de données verrouillée**
```bash
rm prisma/dev.db
npx prisma migrate dev
```

## 📖 Documentation Complète

Voir `README.md` pour la documentation complète incluant:
- Architecture détaillée
- API endpoints
- Structure du projet
- Guide de sécurité
- Tests

## 💡 Support

Pour toute question:
- Ouvrir une issue sur GitHub
- Consulter la documentation dans `/README.md`

---

**Version**: 1.0.0  
**Date**: Janvier 2026  
**License**: Propriétaire
