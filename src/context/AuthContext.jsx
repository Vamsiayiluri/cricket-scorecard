/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { subscribeToAuthState, logout as authLogout } from "../services/firebase/authService";
import {
  ensureUserProfile,
  resolveRole,
  subscribeToUserProfile,
} from "../services/firebase/userService";
import { isScorerRole } from "../utils/roles";
import { USER_ROLES } from "../services/firebase/constants";
import { setSentryUser } from "../services/monitoring/sentryService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const role = useMemo(() => (user ? resolveRole(profile) : null), [user, profile]);
  const isScorer = Boolean(role && isScorerRole(role));
  const isViewer = role === USER_ROLES.VIEWER;
  const isAuthenticated = Boolean(user);
  const isEmailVerified = Boolean(user?.emailVerified);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setSentryUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    let cancelled = false;
    setProfileLoading(true);

    ensureUserProfile(user, USER_ROLES.VIEWER)
      .then((initialProfile) => {
        if (!cancelled) {
          setProfile(initialProfile);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
        }
      });

    const unsubscribeProfile = subscribeToUserProfile(
      user.uid,
      (nextProfile) => {
        if (!cancelled) {
          setProfile(nextProfile);
          setProfileLoading(false);
        }
      },
      () => {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribeProfile();
    };
  }, [user]);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
    setProfile(null);
  }, []);

  const value = {
    user,
    profile,
    role,
    isScorer,
    isViewer,
    isAuthenticated,
    isEmailVerified,
    authLoading,
    profileLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
