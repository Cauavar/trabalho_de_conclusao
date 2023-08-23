import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import LinkButton from '../layout/LinkButton';
import CommentBar from '../layout/CommentBar';
import { AuthContext } from '../contexts/auth';
import { firestore } from '../bd/FireBase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';

function Profile() {
  const { user } = useContext(AuthContext);

  const [userProfile, setUserProfile] = useState(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    if (user) {
      const userDocRef = doc(collection(firestore, "users"), user.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserProfile(docSnapshot.data());
          setEditedDescription(docSnapshot.data().descricaoUsuario);
        }
      });
    }
  }, [user]);

  const handleEditDescription = () => {
    setEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    const userDocRef = doc(collection(firestore, "users"), user.uid);
    await updateDoc(userDocRef, { descricaoUsuario: editedDescription });
    setEditingDescription(false);
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }


  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <img className="profile-avatar" src={userProfile.imagemUsuario} alt="Profile Avatar" />
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
          <h2>Descrição</h2>
          {editingDescription ? (
            <div>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
              <button onClick={handleSaveDescription}>Salvar</button>
            </div>
          ) : (
            <div>
              <p>{userProfile.descricaoUsuario}</p>
              <button onClick={handleEditDescription}>Editar</button>
            </div>
          )}
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
