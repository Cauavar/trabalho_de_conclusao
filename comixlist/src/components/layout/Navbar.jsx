import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiBook, BiSearchAlt2 } from 'react-icons/bi';
import './Navbar.css';
import { AuthContext } from '../contexts/auth';
import { firestore } from '../bd/FireBase';
import { collection, doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(collection(firestore, "users"), user.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserProfile(docSnapshot.data());
        }
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!searchTerm) return;

    navigate(`/search/${searchTerm}`);
    setSearchTerm('');
  };

  const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png'; 

  return (
    <nav id="navbar">
      <h2>
        <Link to="/">
          <BiBook />
          ComixList
        </Link>
      </h2>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            {userProfile ? (
              <Link to="/profile">
              <img
                className="profile-avatar"
                src={userProfile.imagemUsuario ? `${userProfile.imagemUsuario}?${new Date().getTime()}` : defaultAvatar}
                alt="Profile Avatar"
              />
              </Link>
            ) : (
              <div>Loading Profile...</div>
            )}
            <Link to="/listaPessoal">Lists</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/cadastro">Cadastro</Link>
          </>
        )}
      </div>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Buscar"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
        <button type="submit">
          <BiSearchAlt2 />
        </button>
      </form>
    </nav>
  );
};

export default Navbar;
