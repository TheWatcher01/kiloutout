# 🏠 Kiloutout Services - PWA Plateforme de Conciergerie Multi-Services

Progressive Web App (PWA) complète pour une entreprise de services à domicile. Cette application sert d'interface entre une prestataire de services (administratrice) et ses clients.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)
- [Comptes de test](#comptes-de-test)

## ✨ Fonctionnalités

### Services proposés
- 🏢 Conciergerie
- ✨ Femme de ménage
- ❤️ Aide à la personne
- 👔 Repassage
- 🐾 Gardiennage d'animaux
- 🌳 Tonte de pelouse

### Espace Client
- ✅ Catalogue de services avec détails et tarifs
- ✅ Formulaire de réservation intuitif
- ✅ Calculateur de devis en temps réel
- ✅ Calculateur de distance avec carte interactive (Leaflet + OpenStreetMap)
- ✅ Frais de déplacement automatiques (gratuit jusqu'à 10km, puis 0,50€/km)
- ✅ Autocomplétion d'adresse
- ✅ Historique des réservations
- ✅ Notifications par email
- ✅ Interface responsive et PWA

### Espace Administrateur
- ✅ Dashboard avec statistiques
- ✅ Gestion des réservations (validation/refus)
- ✅ Synchronisation automatique avec Google Calendar
- ✅ Configuration des tarifs et paramètres
- ✅ Filtres avancés (statut, date, montant)
- ✅ Vue calendrier des réservations
- ✅ Notes administratives
- ✅ Notifications email automatiques

## 🛠️ Technologies

### Frontend
- **Next.js 14** (App Router) avec TypeScript
- **Tailwind CSS** pour le styling
- **React Hook Form** + **Zod** pour la validation
- **Leaflet** + **React Leaflet** pour les cartes
- **Lucide React** pour les icônes
- **next-pwa** pour les fonctionnalités PWA

### Backend
- **Next.js API Routes** (serverless)
- **Prisma ORM** avec SQLite (dev) / PostgreSQL (production)
- **NextAuth.js** pour l'authentification
- **bcryptjs** pour le hashing des mots de passe

### Intégrations
- **Google Calendar API** (synchronisation des réservations)
- **OpenStreetMap Nominatim** (géocodage)
- **Nodemailer** (notifications email)

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- Git

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/TheWatcher01/kiloutout.git
cd kiloutout
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos valeurs (voir section Configuration).

4. **Initialiser la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Créer et migrer la base de données
npx prisma migrate dev --name init

# Peupler avec des données de démonstration
npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## ⚙️ Configuration

### Variables d'environnement requises

```env
# Base de données
DATABASE_URL="file:./dev.db"  # SQLite pour dev

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-min-32-caracteres"

# Google Calendar API (optionnel)
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# Email (Nodemailer)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="votre-email@gmail.com"
EMAIL_SERVER_PASSWORD="votre-mot-de-passe-app"
EMAIL_FROM="noreply@kiloutout.fr"

# Configuration de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BUSINESS_ADDRESS="1803 route de Toulouse, 82700 Escatalens"
NEXT_PUBLIC_BUSINESS_LAT="43.9833"
NEXT_PUBLIC_BUSINESS_LON="1.2667"
NEXT_PUBLIC_DISTANCE_THRESHOLD="10"
NEXT_PUBLIC_PRICE_PER_KM="0.50"
```

### Configuration Google Calendar

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com)
2. Activer l'API Google Calendar
3. Créer des identifiants OAuth 2.0
4. Ajouter `http://localhost:3000/api/admin/google/callback` aux URI de redirection autorisés
5. Copier Client ID et Client Secret dans `.env`
6. Se connecter en tant qu'admin et aller dans Paramètres → Connecter Google Calendar

### Configuration Email (Gmail)

1. Activer la validation en 2 étapes sur votre compte Gmail
2. Générer un "Mot de passe d'application" dans les paramètres de sécurité
3. Utiliser ce mot de passe dans `EMAIL_SERVER_PASSWORD`

## 🚀 Utilisation

### Commandes disponibles

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Créer une build de production
npm run start        # Démarrer en mode production
npm run lint         # Linter le code
npx prisma studio    # Ouvrir l'interface de gestion de la base de données
```

### Parcours utilisateur

#### Client
1. S'inscrire sur `/auth/register`
2. Se connecter sur `/auth/login`
3. Parcourir les services sur `/services`
4. Créer une réservation sur `/booking`
5. Suivre ses réservations sur `/dashboard`

#### Administrateur
1. Se connecter avec un compte admin
2. Voir toutes les réservations sur `/admin`
3. Confirmer ou rejeter les demandes
4. Configurer les paramètres sur `/admin/settings`
5. Connecter Google Calendar pour synchronisation automatique

## 📁 Structure du projet

```
kiloutout/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── seed.ts                # Données de démonstration
│   └── migrations/            # Migrations de base de données
├── public/
│   ├── manifest.json          # Manifest PWA
│   ├── sw.js                  # Service Worker
│   └── icons/                 # Icônes PWA
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentification
│   │   │   ├── bookings/      # Gestion des réservations
│   │   │   ├── services/      # Gestion des services
│   │   │   └── admin/         # API administrateur
│   │   ├── auth/              # Pages d'authentification
│   │   ├── services/          # Pages des services
│   │   ├── booking/           # Page de réservation
│   │   ├── dashboard/         # Dashboard client
│   │   ├── admin/             # Interface admin
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Page d'accueil
│   │   └── globals.css        # Styles globaux
│   ├── components/
│   │   ├── ui/                # Composants UI réutilisables
│   │   ├── layout/            # Header, Footer
│   │   └── Providers.tsx      # Providers React
│   ├── lib/
│   │   ├── prisma.ts          # Client Prisma
│   │   ├── utils.ts           # Utilitaires
│   │   ├── geo.ts             # Géolocalisation
│   │   ├── email.ts           # Notifications email
│   │   └── googleCalendar.ts  # Intégration Google Calendar
│   └── types/
│       ├── index.ts           # Types TypeScript
│       └── next-auth.d.ts     # Types NextAuth
├── .env                       # Variables d'environnement (à créer)
├── .env.example               # Template des variables
├── next.config.ts             # Configuration Next.js
├── tailwind.config.ts         # Configuration Tailwind
├── tsconfig.json              # Configuration TypeScript
└── package.json               # Dépendances
```

## 🌐 Déploiement

### Vercel (recommandé)

1. Créer un compte sur [Vercel](https://vercel.com)
2. Importer le repository GitHub
3. Ajouter les variables d'environnement
4. Changer `DATABASE_URL` pour PostgreSQL (Vercel Postgres ou externe)
5. Déployer

### Autres plateformes

L'application peut être déployée sur toute plateforme supportant Next.js :
- Netlify
- Railway
- Render
- DigitalOcean App Platform

**Important** : Pour la production, utiliser PostgreSQL au lieu de SQLite.

### Checklist pré-déploiement

- [ ] Migrer vers PostgreSQL
- [ ] Configurer toutes les variables d'environnement
- [ ] Générer un `NEXTAUTH_SECRET` sécurisé (`openssl rand -base64 32`)
- [ ] Configurer les credentials Google Calendar
- [ ] Configurer les credentials Email
- [ ] Tester l'authentification
- [ ] Tester les réservations
- [ ] Tester l'intégration Google Calendar
- [ ] Vérifier les emails de notification
- [ ] Optimiser les images
- [ ] Activer HTTPS
- [ ] Configurer les backups de la base de données

## 👤 Comptes de test

Après avoir exécuté le seed, vous pouvez utiliser ces comptes :

**Administrateur**
- Email : `admin@kiloutout.fr`
- Mot de passe : `admin123`

**Client**
- Email : `client@test.fr`
- Mot de passe : `client123`

**⚠️ Changez ces mots de passe en production !**

## 📊 Fonctionnalités PWA

- ✅ Installable sur mobile et desktop
- ✅ Mode hors ligne partiel
- ✅ Cache intelligent
- ✅ Icônes adaptatives
- ✅ Splash screens
- ✅ Thème couleur personnalisé

## 🔒 Sécurité

- Authentification sécurisée avec NextAuth.js
- Hashing des mots de passe avec bcryptjs
- Protection CSRF intégrée
- Validation des données avec Zod
- Middleware de protection des routes
- Contrôle d'accès basé sur les rôles
- Variables d'environnement pour les secrets
- Tokens Google stockés de manière sécurisée

## 📝 Licence

Ce projet est privé et propriétaire.

## 🤝 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter : contact@kiloutout.fr

---

Développé avec ❤️ pour Kiloutout Services
