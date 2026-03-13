# Chore Battle: Gamify Your Home

This is a Next.js 15 application designed to turn household chores into a competitive game.

## 🚀 How to get a "Proper" Production URL

The URL you are currently using (`studio-xxx.cloudworkstations.dev`) is a temporary development environment. To get a permanent production URL and connect your own domain, follow these steps:

### 1. Push to GitHub
Create a new repository on [GitHub](https://github.com) and push your current code to it.

### 2. Connect to Firebase App Hosting
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `studio-1165218489-108ea`.
3. In the left sidebar, go to **Build** > **App Hosting**.
4. Click **Get Started** and connect your GitHub repository.
5. Follow the setup wizard. Firebase will automatically detect your Next.js configuration.

### 3. Deploy
Once connected, Firebase will build and deploy your app. You will receive a new URL ending in `.web.app` or `.firebaseapp.com`.

## 🛠 Troubleshooting Login (Unauthorized Domain)

If you see an "Unauthorized Domain" error when logging in with Google:
1. Copy the current URL of your app (e.g., `studio-1165218489-108ea.cloudworkstations.dev`).
2. Go to the [Firebase Console](https://console.firebase.google.com/).
3. Navigate to **Authentication** > **Settings** > **Authorized domains**.
4. Click **Add domain** and paste your domain.
5. Click **Add**.

## Features
- **Mission Board**: Claim and complete daily, weekly, or monthly chores.
- **Shared Rewards**: Earn XP together to unlock household prizes.
- **Warrior Profiles**: Customize your path (Shield, Fire, Nature, or Heart).
- **Leaderboards**: Track who is the ultimate household guardian.
- **Mobile-First**: Designed to be added to your phone's home screen as a Web App.
