import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import LinkButton from '../layout/LinkButton';
import CommentBar from '../layout/CommentBar';
import { firestore } from '../bd/FireBase';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore'; // Importe 'query' e 'where' aqui
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
import { useNavigate } from 'react-router-dom';

function PublicProfile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [commentsWithUserInfo, setCommentsWithUserInfo] = useState([]);
  const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png';

  const getUserInfo = async (userId) => {
    const userDocRef = doc(collection(firestore, 'users'), userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.data();
  };

  useEffect(() => {
    console.log('Fetching user profile...');
    if (!id) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(collection(firestore, 'users'), id);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUserProfile(userData);
        } else {
          console.log('User profile not found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (user && user.uid === id) {
      return navigate('/profile');
    }

    fetchUserProfile();
  }, [id, user, navigate]);

  useEffect(() => {
    const fetchCommentsWithUserInfo = async () => {
      if (userProfile) {
        const commentsWithInfo = await Promise.all(
          userProfile.comments.map(async (comment) => {
            if (comment.userId) {
              const userInfo = await getUserInfo(comment.userId);
              return { ...comment, userInfo };
            }
            return comment;
          })
        );
        setCommentsWithUserInfo(commentsWithInfo);
      }
    };

    fetchCommentsWithUserInfo();
  }, [userProfile]);

  // Configurar uma escuta em tempo real para os comentários no Firestore
  useEffect(() => {
    const commentsCollectionRef = collection(firestore, 'comments'); // Substitua pelo nome da sua coleção de comentários
    const q = query(commentsCollectionRef, where('userId', '==', id)); // Substitua 'userId' pelo campo que indica o autor do comentário

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedComments = querySnapshot.docs.map((doc) => doc.data());
      setCommentsWithUserInfo(updatedComments);
    });

    return () => {
      // Certifique-se de cancelar a escuta quando o componente for desmontado
      unsubscribe();
    };
  }, [id]);

  if (!userProfile) {
    return <div>Loading...</div>;
  }


  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <img
              className="profile-avatar"
              src={userProfile?.imagemUsuario ? `${userProfile.imagemUsuario}?${new Date().getTime()}` : defaultAvatar}
              alt="Profile Avatar"
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-username">Nome: {userProfile?.nome || "N/A"}</h1>
          </div>
          <div className="profile-details">
            <h2>Informações do Perfil</h2>
            <div className="detail-row">
              <span className="detail-label">Local:</span>
              <span className="detail-value">{userProfile?.local || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Aniversário:</span>
              <span className="detail-value">{userProfile?.aniversario || "N/A"}</span>
            </div>
            <div className='button'>
              <LinkButton to={`/listaPessoal/${id}`} text="ComixList" />
            </div>
          </div>
        </div>

        <div className="profile-description">
          <h2>Sobre Mim</h2>
          <p>{userProfile?.descricaoUsuario || "N/A"}</p>
        </div>

        <div className="profile-comments">
        </div>
      </div>
      <CommentBar />
      <ul className="comment-list">
  {commentsWithUserInfo.map((comment, index) => (
    <li key={index}>
      <img
        src={comment.userInfo.imagemUsuario}
        alt="Foto de perfil do usuário"
      />
      <div className="comment-content">
        <strong>{comment.userInfo.nome}</strong>
        <p>{comment.text}</p>
      </div>
    </li>
  ))}
</ul>

    </div>
  );
}

export default PublicProfile;
