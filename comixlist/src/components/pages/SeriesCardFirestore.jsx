import React from "react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const SeriesCardFirestore = ({ serie, showLink = true }) => {
  if (!serie) {
    return <p>Série não encontrada</p>;
  }

  const defaultPicture = 'https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg'; 
  return (
    <div className="series-card">
      <img src={serie.imagemSerie || defaultPicture} alt={serie.nomeSerie} />
      <h2>
        {serie.nomeSerie}({new Date(serie.publiSerie).getFullYear()})
      </h2>
      {showLink && (
        <Link to={`/series/${serie.id}`} state={{ id: serie.id }}>
          Detalhes
        </Link>
      )}
    <div className="rating">
      <p>Nota média:</p>
      {serie.notaMedia !== undefined && serie.notaMedia !== 0.0
              ? serie.notaMedia.toFixed(1)
              : "N/A"}</div>


    </div>
  );
};

export default SeriesCardFirestore;
