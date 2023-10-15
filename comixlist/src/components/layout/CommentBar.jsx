import React, { useState, useContext } from 'react';
import './CommentBar.css';
import { AuthContext } from '../contexts/auth';
import { addCommentToFirestore, auth } from '../bd/FireBase';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../bd/FireBase';


function CommentBar() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [commentText, setCommentText] = useState('');
  
  const handleCommentSubmit = async () => {
    if (commentText.trim() === '') {
      return;
    }
  
    console.log('commenterUserId:', user.uid);
    console.log('userId:', id);
    console.log('commentText:', commentText);
  
    try {
      const currentUser = user;
  
      if (currentUser) {
        const userRef = doc(firestore, 'users', id); 
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          await addCommentToFirestore(currentUser.uid, commentText, id); 
          setCommentText('');
          console.log('Comentário enviado com sucesso.');
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
      <button onClick={handleCommentSubmit}>Enviar</button>
    </div>
  );
}

export default CommentBar;

