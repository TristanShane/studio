# Chore Battle ⚔️

Turn household chores into a fun, competitive battle. Earn XP, climb the leaderboard, and unlock real-world rewards! This application gamifies the "to-do" list to make maintaining a home engaging for everyone.

## 🚀 Tech Stack

- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Server Components)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Google OAuth 2.0)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Agent Framework**: [Genkit](https://firebase.google.com/docs/genkit) (Configured for future expansion)

## 🛡️ Security & Architecture

### Database Security
The application utilizes **Firestore Security Rules** to enforce data isolation and integrity:
- **User Privacy**: Users can only read and write their own private profile data.
- **Household Governance**: Only the "Guardian" (Household Owner) can modify household settings, delete the base, or approve join requests.
- **Mission Integrity**: Permissions are structured so that warriors can claim open missions but only the Guardian can revoke completed ones.

### Authentication
Secure identity management is handled via **Firebase Authentication**, supporting Google Sign-In. This ensures no passwords are stored locally and provides a seamless onboarding experience.

### State Management
The app uses a hybrid approach:
- **Real-time Sync**: Firebase SDK for live updates on the mission board and leaderboard.
- **Local Persistence**: LocalStorage is used for non-critical session state and theme preferences.

## 🎮 Key Features

- **Mission Board**: A dynamic board for claiming and completing household tasks.
- **Leaderboard**: Real-time rankings based on accumulated Battle XP and streaks.
- **Base HQ**: Advanced household management for inviting new members and setting XP-based rewards (e.g., Pizza Night).
- **Victory Log**: A historical timeline of every mission completed in the household.
- **Warrior Profiles**: Customizable paths (Shield Guardian, Fire Warrior, etc.) and earned badges.

## 🛠️ Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Deployment**:
   The app is optimized for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting), supporting Next.js SSR and automatic GitHub integration.