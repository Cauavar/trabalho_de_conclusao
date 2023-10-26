import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import LinkButton from '../layout/LinkButton';
import CommentBar from '../layout/CommentBar';
import { AuthContext } from '../contexts/auth';
import { firestore } from '../bd/FireBase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Profile() {
  const { user } = useContext(AuthContext);
  const [userComments, setUserComments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [commentsWithUserInfo, setCommentsWithUserInfo] = useState([]); 
  const commentsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(0);

  const next = () => {
    if (currentPage < Math.floor(commentsWithUserInfo.length / commentsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previous = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getUserInfo = async (userId) => {
    const userDocRef = doc(collection(firestore, "users"), userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.data();
  };

  useEffect(() => {
    if (user) {
      const userDocRef = doc(collection(firestore, "users"), user.uid);

      getDoc(userDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();

            if (userData && userData.comments) {
              const userComments = userData.comments;
              setUserComments(userComments);
            }

            setUserProfile(userData);
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar dados do usuário:", error);
        });
    }
  }, [user]);

  useEffect(() => {
    const fetchCommentsWithUserInfo = async () => {
      const commentsWithInfo = await Promise.all(
        userComments.map(async (comment) => {
          if (comment.userId) {
            const userInfo = await getUserInfo(comment.userId);
            return { ...comment, userInfo };
          }
          return comment;
        })
      );
      setCommentsWithUserInfo(commentsWithInfo);
    };

    fetchCommentsWithUserInfo();
  }, [userComments]);

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png';

  const CommentsToDisplay = commentsWithUserInfo.slice(currentPage * commentsPerPage, (currentPage + 1) * commentsPerPage);


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
              <LinkButton to="/listaPessoal" text="Minha Lista" />
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
            <div className="comics-section">
              <h3><Link to={`/listaPessoal?tipo=completo`}>Completo</Link></h3>
            </div>
            <div className="comics-section">
              <h3><Link to={`/listaPessoal?tipo=lendo`}>Lendo</Link></h3>
            </div>
            <div className="comics-section">
              <h3><Link to={`/listaPessoal?tipo=dropado`}>Largado</Link></h3>
            </div>
            <div className="comics-section">
              <h3><Link to={`/listaPessoal?tipo=planejo-ler`}>Planejo Ler</Link></h3>
            </div>
          </div>
        </div>
      </div>
      <CommentBar
        commentsWithUserInfo={commentsWithUserInfo}
        setCommentsWithUserInfo={setCommentsWithUserInfo}
      />
      <ul className="comment-list">
      {CommentsToDisplay.map((comment, index) => (
    <li key={index}>
      <Link to={`/profile/${comment.userId}`}>
        <img
          src={comment.userInfo.imagemUsuario}
          alt="Foto de perfil do usuário"
        />
              </Link>
              <div className="comment-content">
        <strong>{comment.userInfo.nome}</strong>
        <p>{comment.text}</p>
        <p className="comment-date">{comment.commentDate}</p> 
      </div>
    </li>
    
  ))}
</ul>
<div className="pagination">
        <button className="previous" onClick={previous} disabled={currentPage === 0}>
          Anterior
        </button>
        <button
          className="next"
          onClick={next}
          disabled={currentPage === Math.floor(commentsWithUserInfo.length / commentsPerPage)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export default Profile;
