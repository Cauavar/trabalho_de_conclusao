import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../bd/FireBase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
      navigate('/profile');
    } catch (error) {
      console.error('Erro durante o login', error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro durante o logout', error);
    }
  };

  const signup = async (userData) => {
    try {
      const { nome, email, senha, aniversario, descricaoUsuario, imagemUsuario, local, isAdmin } = userData;

      if (!nome || !email || !senha) {
        console.error('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;

      const userDocRef = doc(firestore, 'users', userId);
      await setDoc(userDocRef, {
        nome: nome,
        email: email,
        aniversario: aniversario || '',
        descricaoUsuario: descricaoUsuario || '',
        imagemUsuario: imagemUsuario || '',
        local: local || '',
        isAdmin: isAdmin || false,
      });

      navigate('/profile');
    } catch (error) {
      console.error('Erro durante o cadastro', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, signup }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
