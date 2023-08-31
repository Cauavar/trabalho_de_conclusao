import React from "react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

const SeriesCardFirestore = ({ serie, showLink = true }) => {
  return (
    <div className="series-card">
      <img src={serie.imagemSerie} alt={serie.nomeSerie} />
      <h2>
        {serie.nomeSerie}
        {serie.publiSerie && `(${serie.publiSerie.split("/")[2]})`}
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
