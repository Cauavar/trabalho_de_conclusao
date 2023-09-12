import React, { useState, useContext } from 'react';
import './AddListaPessoalModal.css';
import { addListaPessoalToFirestore } from '../bd/FireBase';
import { AuthContext } from '../contexts/auth';

function AddListaPessoalModal({ isOpen, onClose, onAddToList, serieId, getSeries }) {
  const { user } = useContext(AuthContext);
  const [nota, setNota] = useState('');
  const [review, setReview] = useState('');
  const [volumesLidos, setVolumesLidos] = useState(0);

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

      await addListaPessoalToFirestore(user.uid, serieId, parseFloat(nota), review, volumesLidos);
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
        <div>
          <img src={getSeries?.imagemSerie} alt={getSeries?.nomeSerie} />
        </div>
        <div>
          <h3>
            {getSeries.nomeSerie}({new Date(getSeries.publiSerie).getFullYear()})
          </h3>
          <div>
  <label htmlFor="volumesLidos">Volumes Lidos:</label>
  <div className="volume-input">
    <input
      type="number"
      id="volumesLidos"
      value={volumesLidos}
      onChange={(e) => setVolumesLidos(e.target.value)} 
      min="0"
      max={getSeries.volumes}
    />
    <span className="total-volumes"> / {getSeries.volumes}</span>
  </div>
</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nota:</label>
            <input type="number" value={nota} onChange={(e) => setNota(e.target.value)} />
          </div>
          <div>
            <label>Review:</label>
            <textarea placeholder="Escreva sua Resenha..." value={review} onChange={(e) => setReview(e.target.value)} />
          </div>
          <div className="modal-buttons">
            <button className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Adicionar à Lista Pessoal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddListaPessoalModal;
