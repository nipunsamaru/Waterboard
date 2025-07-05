import React, { createContext, useContext, useEffect, useState } from 'react';
<<<<<<< HEAD
import { auth, rtdb } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
=======
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from './firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const database = getDatabase(app);
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
<<<<<<< HEAD
        // Fetch user role from Firestore
        const userRef = ref(rtdb, `users/${user.uid}`);
=======
        const userRef = ref(database, `users/${user.uid}`);
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserRole(snapshot.val().role);
        } else {
<<<<<<< HEAD
          setUserRole(null); // Or a default role if user doc doesn't exist
=======
          setUserRole(null);
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
<<<<<<< HEAD
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
=======
  }, [auth, database]);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
>>>>>>> aa7b0d9f7c4a74912b4f3080cb6eeb5448b89f1e
