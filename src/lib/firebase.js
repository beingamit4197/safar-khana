const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const isFirestoreEnabled =
  process.env.REACT_APP_USE_FIRESTORE === 'true' && Boolean(config.projectId);

let dbPromise = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
    ]).then(([{ initializeApp }, firestore]) => ({
      db: firestore.getFirestore(initializeApp(config)),
      firestore,
    }));
  }
  return dbPromise;
}
