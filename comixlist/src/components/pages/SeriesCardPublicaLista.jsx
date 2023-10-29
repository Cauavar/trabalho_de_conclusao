import React from "react";
import { Link } from "react-router-dom";
import "./SeriesCardFirestoreListaPessoal.css";

const SeriesCardPublicaLista = ({ serie, showLink = true, nota, tipo, review, volumesLidos, listaPessoalId }) => {
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
      <p>Nota: {nota}</p>
      <p>Review: {review}</p>
      <p>Progresso: {volumesLidos}/{serie.volumes}</p>
      <Link to={`/resenhaPublica/${serie.id}`} state={{ id: listaPessoalId }}>
  Resenha
</Link>

    </div>
  );
};

export default SeriesCardPublicaLista;
