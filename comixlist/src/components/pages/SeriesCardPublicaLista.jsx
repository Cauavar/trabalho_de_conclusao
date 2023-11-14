import React from "react";
import { Link } from "react-router-dom";
import "./SeriesCardFirestoreListaPessoal.css";

const SeriesCardPublicaLista = ({ serie, showLink = true, nota, tipo, review, volumesLidos, listaPessoalId, userId }) => {
  if (!serie) {
    return <p>Série não encontrada</p>;
  }

  const defaultPicture =
    "https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg";

    const MAX_RESUMO_LENGTH = 50; 

    const isResumoLong = review.length > MAX_RESUMO_LENGTH;
    
    const truncatedResumo = isResumoLong ? review.slice(0, MAX_RESUMO_LENGTH) + "..." : review;

  return (
    <div className="series-card-publica">
      <img src={serie.imagemSerie || defaultPicture} alt={serie.nomeSerie} />
      <h2>
        {serie.nomeSerie}({new Date(serie.publiSerie).getFullYear()})
      </h2>
      <p>Nota: {nota}</p>
      <p>Resenha: {truncatedResumo}</p>
      <p>Progresso: {volumesLidos}/{serie.volumes}</p>
      <Link to={`/resenha-publica/${userId}/${serie.id}`}> 
        Resenha
      </Link>
    </div>
  );
};


export default SeriesCardPublicaLista;
