import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user, showLink = true }) => {
  if (!user) {
    return <p>Usuário não encontrado</p>;
  }

  const defaultPicture = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png'; 
  return (
    <div className="user-card">
      <img src={user.imagemUsuario || defaultPicture} alt={user.nome} />
      <h2>
        {user.nome}
      </h2>
      {showLink && (
        <Link to={`/profile/${user.id}`} state={{ id: user.id }}>
          Ver Perfil
        </Link>
      )}

      <div className="user-details">
        <p>Email: {user.email}</p>
        <p>Localização: {user.local}</p>
        <p>Data de Aniversário: {user.aniversario}</p>
        <p>Descrição: {user.descricaoUsuario}</p>
        {user.isAdmin && <p>Admin</p>}
      </div>
    </div>
  );
};

export default UserCard;