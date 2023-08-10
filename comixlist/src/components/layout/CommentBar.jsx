import React from 'react';
import './CommentBar.css'
import SubmitButton from '../form/SubmitButton';

function CommentBar() {
  return (
    <div className="comment-bar">
      <h2>Comentários</h2>
      <div className="comment-input">
        <textarea placeholder="Escreva um comentário"></textarea>
      </div>
      <SubmitButton text={'Enviar'}/>
    </div>
  );
}

export default CommentBar;
