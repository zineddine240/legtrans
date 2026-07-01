import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
       console.error("Firebase project ID is not defined");
       return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Use Firestore REST API to instantly update the document without hanging in Serverless environments
    // Since the database is in test mode, this write will be allowed without authentication.
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/profiles/${uid}?updateMask.fieldPaths=email_confirmed`;

    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          email_confirmed: {
            booleanValue: true
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Firestore REST API Error:", errorData);
      return NextResponse.json({ error: 'Failed to activate account via database' }, { status: 500 });
    }

    // Redirect to login page with verified query param
    return NextResponse.redirect(new URL(`/auth/login?verified=true&uid=${uid}`, request.url));
  } catch (err: any) {
    console.error('Account Activation Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
