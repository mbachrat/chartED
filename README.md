# chartED — Org Chart Editor (MVP)

This is a minimal production-ready MVP to create and edit company org charts built with Next.js (App Router), Firebase Auth + Firestore, and Tailwind CSS.

Environment variables (set in Vercel or .env.local):

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

Quick local setup

1. Install dependencies

```bash
npm install
```

2. Run locally

```bash
npm run dev
```

Firebase setup

1. Create a Firebase project.
2. Enable Email/Password authentication under Authentication -> Sign-in method.
3. Create a Firestore database (in production use proper rules).
4. (Optional) Enable Firebase Storage if you want to upload videos; you can also store external video URLs in the `videoUrl` field.

Firestore data model (collection `people`):

- name: string
- role: string
- location: string
- description: string
- email: string
- coffeeChatAvailability: boolean
- videoUrl: string (optional)
- managerId: string | null
- createdAt: timestamp
- updatedAt: timestamp

Security rules suggestion (start):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /people/{personId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Notes

- Auth: `app/login/page.js` provides sign-in and sign-up.
- Protected area: `app/layout.js` monitors auth state and redirects to `/login` if unauthenticated.
- Components are under `components/` and `lib/firebase.js` reads config from environment variables.
- Org rendering is implemented without heavy chart libraries; it uses a simple recursive layout and real-time listeners via `onSnapshot`.

Next steps and deployment

- Push to a Git repo and connect to Vercel. Add environment variables in the Vercel project settings.
