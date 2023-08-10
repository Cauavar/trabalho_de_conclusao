import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const ComicsCard = ({ comic, showLink = true }) => {
  return (
    <div className="comic-card">
      {comic.thumbnail && (
        <img
          src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
          alt={comic.title}
        />
      )}
      <h2>{comic.title}</h2>
      {showLink && (
        <Link to={`/comics/${comic.id}`} state={{ id: comic.id }}>
          Detalhes
        </Link>


      )}
      <div className="rating">
        <FaStar />
        {comic.rating}
      </div>
    </div>
  );
};

export default ComicsCard;