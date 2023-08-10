import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../bd/FireBase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';


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
      await auth.signInWithEmailAndPassword(email, senha);
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
      // Cria o usuário no serviço de autenticação
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      
      // consegue o ID do usuário recém-criado
      const userId = userCredential.user.uid;
      
      await database.ref('users/' + userId).set({
        nome: nome,
        email: email,
      });
      
      // Atualiza o nome de exibição do usuário no serviço de autenticação
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
