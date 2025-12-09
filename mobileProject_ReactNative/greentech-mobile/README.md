# GreenTech Mobile - Application Mobile Employé

Application mobile React Native pour la gestion des actions écologiques des employés.

## Installation

```bash
npm install
```

## Lancement de l'application

### Version Web
```bash
npm run web
```
Ouvre automatiquement dans le navigateur sur http://localhost:8081

### Version Mobile (iOS/Android)

1. Installer l'application **Expo Go** sur votre téléphone :
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Démarrer le serveur :
```bash
npm start
```

3. Scanner le QR code affiché dans le terminal :
   - **iPhone** : Utiliser l'appareil photo
   - **Android** : Utiliser l'application Expo Go

## Fonctionnalités

- **Tableau de Bord** : Points, classement, impact CO2, badges, statistiques transport
- **Actions** : Checklist quotidienne, suivi GPS, upload de preuves
- **Boutique** : Échange d'Eco-Coins contre des récompenses
- **Profil** : Paramètres, configuration, déconnexion

## Technologies

- React Native
- Expo
- React Navigation
- expo-image-picker
- react-native-maps (mobile uniquement)

## Structure du projet

```
src/
├── components/     # Composants réutilisables
├── contexts/       # Context API (état global)
├── data/          # Données statiques
├── screens/       # Écrans de l'application
└── styles/        # Styles globaux
```

## Notes

- La carte GPS est disponible uniquement sur mobile (iOS/Android)
- Sur web, un placeholder est affiché à la place de la carte
