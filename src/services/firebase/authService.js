import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";

export const getFirebaseAuth = () => getAuth();

export const subscribeToAuthState = (callback) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, callback);
};

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(getAuth(), email, password);

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(getAuth(), email, password);

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(getAuth(), provider);
};

export const logout = () => signOut(getAuth());

export const sendVerificationEmail = (user, actionCodeSettings) =>
  sendEmailVerification(user, actionCodeSettings);

export const sendResetPasswordEmail = (email, actionCodeSettings) =>
  sendPasswordResetEmail(getAuth(), email, actionCodeSettings);
