import React, { useState, useContext } from 'react';
import './AddListaPessoalModal.css';
import { addListaPessoalToFirestore } from '../bd/FireBase';
import { AuthContext } from '../contexts/auth';

function AddListaPessoalModal({ isOpen, onClose, onAddToList, serieId }) { // Recebe serieId como propriedade
  const { user } = useContext(AuthContext);
  const [nota, setNota] = useState('');
  const [review, setReview] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const notaFloat = parseFloat(nota);
    if (isNaN(notaFloat) || notaFloat < 0 || notaFloat > 10) {
      console.log('A nota deve estar entre 0 e 10.');
      return;
    }

    try {
      if (!user || !serieId) {
        throw new Error('Usuário ou ID da série não definidos.');
      }

      await addListaPessoalToFirestore(user.uid, serieId, parseFloat(nota), review);
      alert('Item adicionado à lista pessoal com sucesso');
      onClose(); 
    } catch (error) {
      alert('Erro ao adicionar item à lista pessoal: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Adicionar à Lista Pessoal</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nota:</label>
            <input type="number" value={nota} onChange={(e) => setNota(e.target.value)} />
          </div>
          <div>
            <label>Review:</label>
            <textarea value={review} onChange={(e) => setReview(e.target.value)} />
          </div>
          <div className="modal-buttons">
            <button className="cancel-button" onClick={onClose}>Cancelar</button>
            <button type="submit">Adicionar à Lista Pessoal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddListaPessoalModal;