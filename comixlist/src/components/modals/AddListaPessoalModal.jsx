import React, { useState, useContext, useEffect } from 'react';
import './AddListaPessoalModal.css';
import { addListaPessoalToFirestore } from '../bd/FireBase'; 
import { AuthContext } from '../contexts/auth';
import md5 from 'md5';
import { getDoc, doc, collection, getDocs, query, where, addDoc } from "firebase/firestore"; 
import { firestore } from "../bd/FireBase";

const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';

function AddListaPessoalModal({ isOpen, onClose, onAddToList, serieId, getSeries }) {
  const { user } = useContext(AuthContext);
  const [nota, setNota] = useState('');
  const [review, setReview] = useState('');
  const [volumesLidos, setVolumesLidos] = useState(0);
  const [tipo, setTipo] = useState('');
  const [apiSeries, setApiSeries] = useState(null);

  const getSeriesFromApi = async (id) => {
    if (!isNaN(parseInt(id)) && isMarvelApiId(id)) {
      const timestamp = Date.now().toString();
      const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);
      const seriesUrl = `https://gateway.marvel.com/v1/public/series/${id}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
  
      try {
        const res = await fetch(seriesUrl);
        const data = await res.json();
        const seriesData = data.data.results[0];
        setApiSeries(seriesData);
      } catch (error) {
        console.error("Error fetching comic series from API:", error);
        // Não foi possível encontrar a série na API, você pode lidar com isso aqui.
      }
    }
  };
  

  const isMarvelApiId = (id) => {
    return !isNaN(parseInt(id));
  };

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

  useEffect(() => {
    if (serieId) {
      getSeriesFromApi(serieId);
    }
  }, [serieId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Adicionar à Lista Pessoal</h2>
        <div>
        {(apiSeries || getSeries) ? (
          <div className="comic-details">
            <img
              src={apiSeries ? `${apiSeries.thumbnail.path}.${apiSeries.thumbnail.extension}` : getSeries.imagemSerie}
              alt={apiSeries ? apiSeries.title : getSeries.nomeSerie}
            />
            <h3>{apiSeries ? apiSeries.title : getSeries.nomeSerie}</h3>
          </div>
        ) : (
          <p>Série não encontrada na API da Marvel e sem imagem no Firestore.</p>
        )}
      </div>
      <br></br>
        <div>
          <div>
            <label htmlFor="volumesLidos">Volumes Lidos:</label>
            <div className="volume-input">
              <input
                type="number"
                id="volumesLidos"
                value={volumesLidos}
                onChange={(e) => setVolumesLidos(e.target.value)}
                min="0"
                max={apiSeries ? apiSeries.pageCount : getSeries?.volumes || 'N/A'}
              />
              <span className="total-volumes"> / {apiSeries ? apiSeries.pageCount : getSeries?.volumes || 'N/A'}</span>
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
            <input type="number" value={nota} onChange={(e) => setNota(e.target.value)} id="totalVolumes" max={10} />
            <span className="total-volumes" id="totalVolumes"> / 10</span>
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
