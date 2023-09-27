import React, { useContext } from 'react';
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


const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className='loading'>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
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
            <Route path="/cadastroSerie" element={<CadastroSerie />} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/listaPessoal" element={<PrivateRoute><ListaPessoal /></PrivateRoute>} />
            <Route path="/editProfile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
            <Route path="/editSerie" element={<PrivateRoute><EditSerie /></PrivateRoute>} />
            <Route path="/resenha/:id" element={<Resenha />} />
          </Routes>
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoutes />);
