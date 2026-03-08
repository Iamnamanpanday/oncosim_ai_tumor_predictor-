// ── Firebase Configuration ────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a project, then "Add App" → Web App
// 3. Enable Authentication → Sign-in method → Google
// 4. Copy your config values below
// 5. In Firebase console → Authentication → Authorized domains → add localhost

import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? "PASTE_YOUR_API_KEY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? "PASTE_YOUR_AUTH_DOMAIN",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? "PASTE_YOUR_PROJECT_ID",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "PASTE_YOUR_SENDER_ID",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? "PASTE_YOUR_APP_ID",
}

const app      = initializeApp(firebaseConfig)
export const auth     = getAuth(app)
export const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: "select_account" })
