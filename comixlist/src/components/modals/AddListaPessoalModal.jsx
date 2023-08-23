import React, { useState } from 'react';
import './AddListaPessoalModal.css';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../bd/FireBase';
import { AuthContext } from '../contexts/auth';
import { useContext } from 'react';

function AddListaPessoalModal({ isOpen, onClose, onAddToList, getSeries }) {
    const [review, setReview] = useState('');
    const { user } = useContext(AuthContext);
  
    const handleAddToList = async () => {
        const serie = getSeries();
        if (!user || !serie || !serie.id) {
          console.log(serie);
          console.log(user);
          console.log('Usuário não autenticado ou série não definida.');
          return;
        }
      
        const reviewData = {
          dataAdicao: new Date().toISOString(),
          dataConclusao: "",
          favorito: false,
          notaPessoal: 0,
          progresso: 0,
          resenha: review,
          serieId: `/serie/${serie.id}`,
          ultimaAtualizacao: new Date().toISOString(),
        };
      
        try {
          const listaPessoalRef = collection(firestore, 'usuarios', user.uid, 'listaPessoal');
          await addDoc(listaPessoalRef, reviewData);
      
          console.log('Dados salvos no Firestore:', reviewData);
          onAddToList();
        } catch (error) {
          console.error('Erro ao salvar dados no Firestore:', error);
        }
      };
  
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Adicionar à Lista Pessoal</h2>
          <textarea
            placeholder="Escreva uma resenha..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <div className="modal-buttons">
            <button className="cancel-button" onClick={onClose}>Cancelar</button>
            <button className="add-button" onClick={handleAddToList}>Adicionar</button>
          </div>
        </div>
      </div>
    );
  }
  
  export default AddListaPessoalModal;
  