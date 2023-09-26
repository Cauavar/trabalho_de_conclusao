import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import LinkButton from '../layout/LinkButton';
import CommentBar from '../layout/CommentBar';
import { AuthContext } from '../contexts/auth';
import { firestore } from '../bd/FireBase';
import { collection, doc, getDoc } from 'firebase/firestore';

function Profile() {
  const { user } = useContext(AuthContext);

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

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png';



  return (
    <div className="profile-container">
    <div className="profile-header">
       <LinkButton to="/editProfile" text="Editar Perfil" />
    </div>
      <div className="profile-content">
        <div className="profile-card">
        <div className="profile-header">
              <img
                className="profile-avatar"
                src={userProfile.imagemUsuario ? `${userProfile.imagemUsuario}?${new Date().getTime()}` : defaultAvatar}
                alt="Profile Avatar"
              />
          </div>
          <div className="profile-info">
            <h1 className="profile-username">Nome: {userProfile.nome}</h1>
          </div>
          <div className="profile-details">
            <h2>Informações do Perfil</h2>
            <div className="detail-row">
              <span className="detail-label">Local:</span>
              <span className="detail-value">{userProfile.local}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Aniversário:</span>
              <span className="detail-value">{userProfile.aniversario}</span>
            </div>
            <div className='button'>
              <LinkButton to="/listaPessoal" text="ComixList" />
            </div>
          </div>
        </div>

        <div className="profile-description">
          <h2>Sobre Mim</h2>
              <p>{userProfile.descricaoUsuario}</p>
        </div>

        <div className="profile-comics">
          <h2>ComixList</h2>
          <div className="comics-grid">
            {/* Add comic list sections here */}
            <div className="comics-section">
              <h3>Completos</h3>
              {/* Add completed comics */}
            </div>
            <div className="comics-section">
              <h3>Lendo</h3>
              {/* Add reading comics */}
            </div>
            <div className="comics-section">
              <h3>Em Espera</h3>
              {/* Add on-hold comics */}
            </div>
            <div className="comics-section">
              <h3>Planejo Ler</h3>
              {/* Add plan-to-read comics */}
            </div>
          </div>
        </div>
      </div>
      <CommentBar />
    </div>
  );
}

export default Profile;
