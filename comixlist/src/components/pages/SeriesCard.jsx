import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const SeriesCard = ({ serie, showLink = true }) => {
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
        <FaStar />
        {serie.rating}
      </div>
    </div>
  );
};

export default SeriesCard;
