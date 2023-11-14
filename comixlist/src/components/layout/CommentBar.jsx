import React, { useContext, useState, useEffect } from 'react';
import './CommentBar.css';
import { AuthContext } from '../contexts/auth';
import { addCommentToFirestore, auth } from '../bd/FireBase';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../bd/FireBase';

function CommentBar({ setCommentsWithUserInfo, commentsWithUserInfo, userProfile, currentUser }) {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [commentText, setCommentText] = useState('');

  const getUserInfo = async (userId) => {
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.data();
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim() === '') {
      return;
    }

    const userIdToComment = id || user.uid;

    try {
      const currentUser = user;

      if (currentUser) {
        const userRef = doc(firestore, 'users', userIdToComment);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const dataAtual = new Date();
          const commentDate = dataAtual.toISOString();

          await addCommentToFirestore(currentUser.uid, commentText, userIdToComment, commentDate);
          setCommentText('');
          console.log('Comentário enviado com sucesso.');

          const userInfo = await getUserInfo(currentUser.uid);

          const newComment = {
            userId: currentUser.uid,
            text: commentText,
            userInfo: userInfo,
            commentDate: commentDate,
          };

          setCommentsWithUserInfo([...commentsWithUserInfo, newComment]);
        } else {
          console.error('Usuário alvo não encontrado.');
        }
      } else {
        console.error('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao enviar o comentário:', error);
    }
  };

  useEffect(() => {
    if (user && commentsWithUserInfo.length > 0) {
      const lastComment = commentsWithUserInfo[commentsWithUserInfo.length - 1];
      if (!lastComment.userInfo) {
        const fetchUserInfo = async () => {
          const userInfo = await getUserInfo(lastComment.userId);
          const updatedComments = commentsWithUserInfo.map((comment) =>
            comment.userId === lastComment.userId ? { ...comment, userInfo } : comment
          );
          setCommentsWithUserInfo(updatedComments);
        };

        fetchUserInfo();
      }
    }
  }, [user, commentsWithUserInfo]);

  return (
    <div className="comment-bar">
      <h2>Comentários</h2>
      <div className="comment-input">
        <textarea
          placeholder="Escreva um comentário"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        ></textarea>
      </div>

      <div className="comment-input">
        <button className="comment-button" onClick={handleCommentSubmit}>
          Enviar
        </button>
      </div>
    </div>
  );
}

export default CommentBar;
