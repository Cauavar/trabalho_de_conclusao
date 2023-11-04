import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
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

      <div className="user-details">
        <p>Sobre mim: {user.descricaoUsuario}</p>
        {user.isAdmin && <p>Admin</p>}
      </div>
      <Link to={`/profile/${user.id}`} state={{ id: user.id }}>
        Ver Perfil
      </Link>
    </div>
  );
};

export default UserCard;
