import React from "react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const SeriesCardFirestore = ({ serie, showLink = true }) => {
  return (
    <div className="series-card">
      <img src={serie.imagemSerie} alt={serie.nomeSerie} />
      <h2>
        {serie.nomeSerie}({new Date(serie.publiSerie).getFullYear()})

      </h2>
      {showLink && (
        <Link to={`/series/${serie.id}`} state={{ id: serie.id }}>
          Detalhes
        </Link>
      )}
      <div className="rating">
        <FaStar />
        {serie.notaMedia}
      </div>
    </div>
  );
};

export default SeriesCardFirestore;
