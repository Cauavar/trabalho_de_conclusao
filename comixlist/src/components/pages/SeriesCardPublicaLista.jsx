import React from "react";
import { Link } from "react-router-dom";
import "./SeriesCardFirestoreListaPessoal.css";

const SeriesCardPublicaLista = ({ serie, showLink = true }) => {
  if (!serie) {
    return <p>Série não encontrada</p>;
  }

  const defaultPicture =
    "https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg";

  return (
    <div className="series-card-publica">
      <img src={serie.imagemSerie || defaultPicture} alt={serie.nomeSerie} />
      <h2>
        {serie.nomeSerie}({new Date(serie.publiSerie).getFullYear()})
      </h2>
      <p>Nota: {serie.nota}</p>
      <p>Review: {serie.review}</p>
      <p>Progresso: {serie.volumesLidos}/{serie.volumes}</p>
      {showLink && (
        <Link to={`/resenha-publica/${serie.id}`} state={{ id: serie.id }}>
          Resenha Pública
        </Link>
      )}
    </div>
  );
};

export default SeriesCardPublicaLista;
