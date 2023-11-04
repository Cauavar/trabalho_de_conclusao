import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Comic from './components/pages/Comic';
import Search from './components/pages/Search';
import Cadastro from './components/pages/Cadastro';
import Login from './components/pages/Login';
import ProfilePage from './components/pages/ProfilePage';
import ListaPessoal from './components/pages/ListaPessoal';
import CadastroSerie from './components/pages/CadastroSerie';
import { AuthProvider, AuthContext } from './components/contexts/auth';
import EditProfile from './components/pages/EditProfile';
import EditSerie from './components/pages/EditSerie';
import Resenha from './components/pages/Resenha';
import AdminPage from './components/pages/AdminPage';
import { getDoc, doc, collection } from 'firebase/firestore'; 
import { firestore } from './components/bd/FireBase';
import PublicListaPessoal from './components/pages/PublicListaPessoal';
import PublicProfile from './components/pages/PublicProfile';
import ResenhaPublica from './components/pages/ResenhaPublica';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className='loading'>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(null); 

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userDocRef = doc(collection(firestore, 'users'), user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setIsAdmin(userData.isAdmin === true);
        } else {
          setIsAdmin(false); 
        }
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        setIsAdmin(false); 
      }
    };

    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, user.uid]);

  if (loading || isAdmin === null) {
    return <div className='loading'>Carregando...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route element={<App />} />
            <Route path="/" element={<Home />} />
            <Route path="series/:id" element={<Comic />} />
            <Route path="/search/:searchTerm" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/listaPessoal" element={<PrivateRoute><ListaPessoal /></PrivateRoute>} />
            <Route path="/editProfile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
            <Route path="/cadastroSerie" element={<PrivateRoute><CadastroSerie /></PrivateRoute>} />
            <Route path="/editSerie/:id" element={<PrivateRoute><EditSerie /></PrivateRoute>} />
            <Route path="/resenha/:id" element={<Resenha />} />
            <Route path="/resenha-publica/:userId/:serieId" element={<ResenhaPublica />} />
            <Route path="/AdminPage" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="/listaPessoal/:id" element={<PublicListaPessoal />} />
          </Routes>

        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoutes />);
