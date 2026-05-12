// Vercel serverless function — mints a fresh Firebase ID token for the
// demo care_seeker on each request. The static client fetches this on
// load and passes the token to MiriAppProvider.
//
// This is the production-correct pattern: Firebase Admin credentials
// stay on the server side, the client never sees them. Real customer
// integrations would do the same — their backend signs custom tokens
// linked to their own auth system, the client exchanges via Firebase,
// then hands the ID token to the Miri SDK.
//
// Required Vercel env vars (Project Settings → Environment Variables):
//   FIREBASE_ADMIN_CREDS  - base64-encoded service account JSON
//   FIREBASE_WEB_API_KEY  - public web API key for the Firebase project
//   DEMO_CARE_SEEKER_ID   - the care_seeker UID to issue the token for

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function initAdmin() {
  if (getApps().length > 0) return;
  const credsB64 = process.env.FIREBASE_ADMIN_CREDS;
  if (!credsB64) throw new Error('FIREBASE_ADMIN_CREDS not set');
  const creds = JSON.parse(Buffer.from(credsB64, 'base64').toString());
  initializeApp({ credential: cert(creds) });
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    initAdmin();

    const uid = process.env.DEMO_CARE_SEEKER_ID;
    const webKey = process.env.FIREBASE_WEB_API_KEY;
    if (!uid || !webKey) {
      throw new Error('DEMO_CARE_SEEKER_ID and FIREBASE_WEB_API_KEY required');
    }

    // 1. Mint custom token signed by Firebase Admin
    const customToken = await getAuth().createCustomToken(uid);

    // 2. Exchange for an ID token via Firebase Auth REST API
    const tokenRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${webKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );
    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Firebase exchange failed: ${tokenRes.status} ${errText}`);
    }
    const tokenJson = (await tokenRes.json()) as {
      idToken: string;
      refreshToken: string;
      expiresIn: string;
    };

    // Cache for ~50 minutes (token TTL is 1 hour; refresh client-side
    // when expiry is close). CDN cache at the edge keeps the endpoint
    // cheap even under heavy demo traffic.
    res.setHeader(
      'Cache-Control',
      'public, max-age=3000, s-maxage=3000, stale-while-revalidate=300'
    );
    res.status(200).json({
      idToken: tokenJson.idToken,
      expiresIn: parseInt(tokenJson.expiresIn, 10),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
}
