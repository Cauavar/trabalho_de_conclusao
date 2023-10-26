import React, { useState, useContext, useEffect } from 'react';
import './AddListaPessoalModal.css';
import { addListaPessoalToFirestore } from '../bd/FireBase';
import { AuthContext } from '../contexts/auth';
import md5 from "md5";

function AddListaPessoalModal({ isOpen, onClose, onAddToList, serieId, getSeries }) {
  const { user } = useContext(AuthContext);
  const [nota, setNota] = useState('');
  const [review, setReview] = useState('');
  const [volumesLidos, setVolumesLidos] = useState(0);
  const [tipo, setTipo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataAtual = new Date();
    const dataResenha = dataAtual.toISOString();
    const dataUltimaAtualizacao = dataAtual.toISOString();

    const notaFloat = parseFloat(nota);
    if (isNaN(notaFloat) || notaFloat < 0 || notaFloat > 10) {
      console.log('A nota deve estar entre 0 e 10.');
      return;
    }

    try {
      if (!user || !serieId) {
        throw new Error('Usuário ou ID da série não definidos.');
      }

      await addListaPessoalToFirestore(
        user.uid,
        serieId,
        parseFloat(nota),
        review,
        volumesLidos,
        tipo,
        dataResenha,
        dataUltimaAtualizacao
      );
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
            {getSeries?.nomeSerie} ({new Date(getSeries?.publiSerie).getFullYear()})
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
                max={getSeries?.volumes}
              />
              <span className="total-volumes"> / {getSeries?.volumes}</span>
              </div>
              <div>
              <label>Tipo:</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="null">...</option>
                <option value="completo">Completo</option>
                <option value="lendo">Lendo</option>
                <option value="dropado">Largado</option>
                <option value="planejo-ler">Planejo Ler</option>
              </select>
              </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <br></br>
          <div>
            <label>Nota:</label>
            <input type="number" value={nota} onChange={(e) => setNota(e.target.value)} id='totalVolumes' max={10}/>
            <span className="total-volumes" id='totalVolumes'> / 10</span>
          </div>
          <div>
            <label>Resenha:</label>
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
