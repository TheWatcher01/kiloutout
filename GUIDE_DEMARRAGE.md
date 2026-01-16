# Guide de démarrage - Kiloutout Services

## Problèmes résolus ✅

Tous les problèmes mentionnés ont été corrigés :

1. **✅ Page "Mon profil"** (`/profil`) - Maintenant fonctionnelle, affiche les informations de l'utilisateur
2. **✅ Page "Services"** (`/services`) - Fonctionnelle, liste tous les services disponibles
3. **✅ Page "Dashboard"** (`/dashboard`) - Fonctionnelle, affiche les réservations de l'utilisateur
4. **✅ Page "Réservations"** (`/reservations`) - Redirige vers le dashboard
5. **✅ Calculateur de devis** - Intégré dans la page de réservation (`/booking`), calcule automatiquement le prix avec options et frais de déplacement

## Comment lancer l'application

### Prérequis

- Node.js 18+ installé
- npm installé
- Git installé

### Étapes pour démarrer

1. **Cloner le repository** (si ce n'est pas déjà fait)
   ```bash
   git clone https://github.com/TheWatcher01/kiloutout.git
   cd kiloutout
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créez un fichier `.env` à la racine du projet avec le contenu minimum suivant :
   
   ```env
   # Base de données SQLite (développement local)
   DATABASE_URL="file:./dev.db"
   
   # NextAuth - Génération d'un secret sécurisé
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="votre-secret-securise-minimum-32-caracteres-ici"
   
   # Configuration de l'application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_BUSINESS_ADDRESS="1803 route de Toulouse, 82700 Escatalens"
   NEXT_PUBLIC_BUSINESS_LAT="43.9833"
   NEXT_PUBLIC_BUSINESS_LON="1.2667"
   NEXT_PUBLIC_DISTANCE_THRESHOLD="10"
   NEXT_PUBLIC_PRICE_PER_KM="0.50"
   ```

   **Important** : Générez un secret sécurisé pour `NEXTAUTH_SECRET` avec :
   ```bash
   openssl rand -base64 32
   ```

4. **Initialiser la base de données**
   ```bash
   # Générer le client Prisma
   npx prisma generate
   
   # Créer la base de données et appliquer les migrations
   npx prisma migrate dev --name init
   
   # Peupler la base avec des données de test (optionnel)
   npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Accéder à l'application**
   
   Ouvrez votre navigateur et allez sur : http://localhost:3000

## Comptes de test

Si vous avez exécuté le seed (étape 4), vous pouvez utiliser ces comptes :

**Administrateur**
- Email : `admin@kiloutout.fr`
- Mot de passe : `admin123`

**Client**
- Email : `client@test.fr`
- Mot de passe : `client123`

⚠️ **Changez ces mots de passe en production !**

## Navigation dans l'application

### Pour les clients :

1. **Page d'accueil** (`/`) - Présentation des services
2. **Services** (`/services`) - Catalogue complet avec détails et tarifs
3. **Réservation** (`/booking`) - Formulaire de réservation avec :
   - Sélection du service
   - Choix de la date et heure
   - Saisie de l'adresse avec autocomplétion
   - Carte interactive affichant la distance
   - Calculateur de devis en temps réel
   - Options supplémentaires
   - Calcul automatique des frais de déplacement
4. **Dashboard / Mes réservations** (`/dashboard`) - Liste de toutes vos réservations
5. **Mon profil** (`/profil`) - Vos informations personnelles

### Pour les administrateurs :

1. **Panneau d'administration** (`/admin`) - Vue d'ensemble des réservations avec :
   - Statistiques (total, en attente, revenus)
   - Filtres par statut, période, montant
   - Vue liste ou calendrier
   - Actions : confirmer, rejeter, ajouter des notes
2. **Paramètres** (`/admin/settings`) - Configuration de l'application

## Fonctionnalités principales

### Calculateur de devis (intégré dans `/booking`)

Le calculateur calcule automatiquement :
- Prix de base du service × durée
- Options supplémentaires
- Frais de déplacement (gratuit jusqu'à 10km, puis 0,50€/km)
- **Total en temps réel**

### Carte interactive

- Affiche votre adresse et l'adresse de l'entreprise
- Calcule la distance en temps réel
- Autocomplétion d'adresse via OpenStreetMap

### Gestion des réservations

Pour les clients :
- Voir l'historique complet
- Statut de chaque réservation
- Détails complets (date, heure, montant)

Pour les admins :
- Filtrer et trier les réservations
- Confirmer ou rejeter les demandes
- Ajouter des notes administratives
- Vue calendrier

## Dépannage

### Le serveur ne démarre pas

1. Vérifiez que le port 3000 n'est pas déjà utilisé
2. Vérifiez que le fichier `.env` existe et est correctement configuré
3. Assurez-vous que les dépendances sont installées : `npm install`

### Erreurs de base de données

1. Vérifiez que Prisma est généré : `npx prisma generate`
2. Appliquez les migrations : `npx prisma migrate dev`
3. Si nécessaire, supprimez `prisma/dev.db` et recommencez l'initialisation

### Page blanche ou erreur 404

1. Videz le cache : supprimez le dossier `.next`
2. Reconstruisez : `npm run build`
3. Relancez : `npm run dev`

## Commandes utiles

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Créer une build de production
npm run start        # Démarrer en mode production (après build)
npm run lint         # Linter le code
npx prisma studio    # Ouvrir l'interface de gestion de la BDD
```

## Structure des routes

```
/                     → Page d'accueil
/services             → Liste des services
/services/[slug]      → Détail d'un service
/booking              → Nouvelle réservation (avec calculateur)
/dashboard            → Dashboard client (réservations)
/reservations         → Redirige vers /dashboard
/profil               → Profil utilisateur
/admin                → Dashboard administrateur
/admin/settings       → Paramètres
/auth/login           → Connexion
/auth/register        → Inscription
```

## Support

Pour toute question ou problème :
- Consultez le README.md principal
- Vérifiez les logs de la console
- Consultez la documentation Next.js : https://nextjs.org/docs

---

**Note** : Ce guide suppose une installation locale pour le développement. Pour un déploiement en production, consultez la section "Déploiement" dans le README.md principal.
