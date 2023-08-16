import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiBook, BiSearchAlt2 } from 'react-icons/bi';
import './Navbar.css';
import { AuthContext } from '../contexts/auth';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!searchTerm) return;
  
    navigate(`/search/${searchTerm}`);
    setSearchTerm('');
  };

  return (
    <nav id="navbar">
      <h2>
        <Link to="/">
          <BiBook />
          ComixList
        </Link>
      </h2>
      <div className="navbar-links">
        <Link to="/comiclist">ComicList</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/cadastroSerie">CadastroSérie</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/cadastro">Cadastro</Link>
          </>
        )}
      </div>
      <form onSubmit={handleSubmit}>
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
