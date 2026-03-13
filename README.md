
# Chore Battle: Gamify Your Home

This is a Next.js 15 application designed to turn household chores into a competitive game.

## 🚀 How to get a "Proper" Production URL

The URL you are currently using is a temporary development environment. To get a permanent production URL:

### 1. Push to GitHub
1. Create a new repository on [GitHub](https://github.com).
2. Initialize git in your project: `git init`.
3. Add files: `git add .`.
4. Commit: `git commit -m "Initial commit"`.
5. Link and push to your GitHub repo.

### 2. Connect to Firebase App Hosting
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left sidebar, go to **Build** > **App Hosting**.
4. Click **Get Started** and connect your GitHub repository.
5. **Crucial**: If your code is not in the root of the repo, set the **Root directory** accordingly.
6. Firebase will automatically detect your Next.js configuration and start the build.

## 🛠 Troubleshooting Build/Login

### Build Failure (No buildpack groups passed detection)
- **Lockfile**: App Hosting requires a `package-lock.json` or `yarn.lock`. Ensure you have run `npm install` locally and pushed the resulting lockfile to GitHub.
- **Root Directory**: Double-check that the "Root directory" setting in the App Hosting setup matches where your `package.json` is located in the repo.

### Unauthorized Domain Error
If you see an "Unauthorized Domain" error when logging in with Google:
1. Copy the URL of your app (e.g., `xxx.web.app` or the studio URL).
2. Go to the [Firebase Console](https://console.firebase.google.com/).
3. Navigate to **Authentication** > **Settings** > **Authorized domains**.
4. Click **Add domain** and paste your domain.
