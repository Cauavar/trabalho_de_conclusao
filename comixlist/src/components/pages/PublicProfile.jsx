import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import LinkButton from '../layout/LinkButton';
import CommentBar from '../layout/CommentBar';
import { firestore } from '../bd/FireBase';
import { doc, getDoc, collection, onSnapshot, query, where, deleteDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

function PublicProfile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [commentsWithUserInfo, setCommentsWithUserInfo] = useState([]);
  const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png';
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
    const userDocRef = doc(collection(firestore, 'users'), userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.data();
  };

  useEffect(() => {
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


  useEffect(() => {
    const commentsCollectionRef = collection(firestore, 'comments');
    const q = query(commentsCollectionRef, where('userId', '==', id));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedComments = querySnapshot.docs.map((doc) => doc.data());
      setCommentsWithUserInfo(updatedComments);
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleDeleteComment = async (comment) => {
    if (window.confirm('Tem certeza de que deseja excluir este comentário?')) {
      try {
        if (user.uid === id || user.uid === comment.userInfo.userId) {
          const commentsRef = collection(firestore, 'comments');
          await deleteDoc(doc(commentsRef, comment.commentId));
          console.log('Comentário excluído com sucesso.');

          setCommentsWithUserInfo((comments) =>
            comments.filter((c) => c.commentId !== comment.commentId)
          );
        } else {
          console.error('Você não está autorizado a excluir este comentário.');
        }
      } catch (error) {
        console.error('Erro ao excluir o comentário:', error);
      }
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const CommentsToDisplay = commentsWithUserInfo
    .slice(currentPage * commentsPerPage, (currentPage + 1) * commentsPerPage)
    .sort((commentA, commentB) => {
      const dateA = new Date(commentA.commentDate);
      const dateB = new Date(commentB.commentDate);
      return dateB - dateA;
    });

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
              <LinkButton to={`/listaPessoal/${id}`} text="Ver Lista" />
            </div>
          </div>
        </div>

        <div className="profile-description">
          <h2>Sobre Mim</h2>
          <p>{userProfile?.descricaoUsuario || "N/A"}</p>
        </div>

        <div className="profile-comics">
          <h2>ComixList</h2>
          <div className="comics-grid">
            <div className="comics-section">
              <h3><Link to={`/listaPessoal/${id}?tipo=completo`}>Completo</Link></h3>
            </div>
            <div className="comics-section">
              <h3><Link to={`/listaPessoal/${id}?tipo=lendo`}>Lendo</Link></h3>
            </div>
            <div className="comics-section">
              <h3><Link to={`/listaPessoal/${id}?tipo=dropado`}>Largado</Link></h3>
            </div>
            <div className="comics-section">
              <h3><Link to={`/listaPessoal/${id}?tipo=planejo-ler`}>Planejo Ler</Link></h3>
            </div>
          </div>
        </div>
      </div>

      <CommentBar
        commentsWithUserInfo={commentsWithUserInfo}
        setCommentsWithUserInfo={setCommentsWithUserInfo}
        userProfile={userProfile}
        currentUser={user}
      />

      <ul className="comment-list">
      {CommentsToDisplay.map((comment, index) => (
      <li key={index}>
      <Link to={`/profile/${comment.userId}`}>
        <img
          src={comment.userInfo.imagemUsuario || defaultAvatar}
          alt="Foto de perfil do usuário"
        />
      </Link>
            <div className="comment-content">
              <strong>{comment.userInfo.nome}</strong>
              <p>{comment.text}</p>
              <p className="comment-date">
                {format(new Date(comment.commentDate), 'dd/MM/yyyy HH:mm:ss')}
              </p>
              {(user.uid === id || user.uid === comment.userInfo.userId) && (
                <button onClick={() => handleDeleteComment(comment)}>
                  Excluir
                </button>
              )}
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

export default PublicProfile;
