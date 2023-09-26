  import React, { useState, useContext } from 'react';
  import './AddListaPessoalModal.css';
  import { AuthContext } from '../contexts/auth';

  function EditListaPessoalModal({ isOpen, onClose, onEdit, initialData }) {
    const { user } = useContext(AuthContext);
    const [nota, setNota] = useState(initialData.nota);
    const [review, setReview] = useState(initialData.review);
    const [volumesLidos, setVolumesLidos] = useState(initialData.volumesLidos);
    const [tipo, setTipo] = useState(initialData.tipo);

  
  const handleSubmit = async (e) => {
      e.preventDefault();
    
      const notaFloat = parseFloat(nota);
      if (isNaN(notaFloat) || notaFloat < 0 || notaFloat > 10) {
        console.log('A nota deve estar entre 0 e 10.');
        return;
      }
    
      try {
        if (!user || !initialData.serieId) {
          throw new Error('Usuário ou ID da série não definidos.');
        }
    
        const editedData = {
          user: user.uid, 
          serieId: initialData.serieId, 
          nota: parseFloat(nota),
          review,
          volumesLidos,
          tipo,
        };
        
        console.log('Dados a serem editados:', editedData); 
    
        
        onEdit(editedData);
    
        alert('Item editado na lista pessoal com sucesso');
        onClose();
      } catch (error) {
        alert('Erro ao editar item na lista pessoal: ' + error.message);
      }
    };
    if (!isOpen) return null;

    return (
      <div className={`modal-overlay ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-content">
          <h2>Editar na Lista Pessoal</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Nota:</label>
              <input type="number" value={nota} onChange={(e) => setNota(e.target.value)} />
            </div>
            <div>
              <label>Review:</label>
              <textarea placeholder="Escreva sua Resenha..." value={review} onChange={(e) => setReview(e.target.value)} />
            </div>
            <div>
              <label>Volumes Lidos:</label>
              <input type="number" value={volumesLidos} onChange={(e) => setVolumesLidos(e.target.value)} />
            </div>
            <div>
              <label>Tipo:</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="null">...</option>
                <option value="completo">Completo</option>
                <option value="lendo">Lendo</option>
                <option value="dropado">Dropado</option>
                <option value="planejo-ler">Planejo Ler</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  export default EditListaPessoalModal;
