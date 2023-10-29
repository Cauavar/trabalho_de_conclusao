import React from "react";
import { Link } from "react-router-dom";

const SeriesCardApi = ({ serie, showLink = true }) => {
  return (
    <div className="series-card">
      {serie.thumbnail && (
        <img
          src={`${serie.thumbnail.path}.${serie.thumbnail.extension}`}
          alt={serie.title}
        />
      )}
      <h2>{serie.title}</h2>
      {showLink && (
        <Link to={`/series/${serie.id}`} state={{ id: serie.id }}>
          Detalhes
        </Link>
      )}
      <div className="rating">
        <p>Nota média:</p>
        {serie.notaMedia !== undefined ? serie.notaMedia.toFixed(1) : "N/A"}
      </div>
    </div>
  );
};

export default SeriesCardApi;
