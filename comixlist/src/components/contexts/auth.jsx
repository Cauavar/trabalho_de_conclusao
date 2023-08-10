import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../bd/FireBase'; // Apenas importe auth e firestore
import { doc, setDoc } from 'firebase/firestore'; // Importe as funções corretas
import { createUserWithEmailAndPassword} from 'firebase/auth';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, senha) => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/');
    } catch (error) {
      console.error('Error during login', error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout', error);
    }
  };

  const signup = async (nome, email, senha) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;
  
      const userDocRef = doc(firestore, 'users', userId);
      await setDoc(userDocRef, {
        nome: nome,
        email: email,
      });
  
      await updateProfile(auth.currentUser, {
        displayName: nome,
      });
  
      navigate('/');
    } catch (error) {
      console.error('Error during signup', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, signup }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
