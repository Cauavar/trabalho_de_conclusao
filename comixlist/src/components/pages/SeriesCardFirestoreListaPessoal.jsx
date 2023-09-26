import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditListaPessoalModal from "../modals/EditListaPessoalModal";

const SeriesCardFirestoreListaPessoal = ({ serie, showLink = true, nota, tipo, review, volumesLidos }) => {
  if (!serie) {
    return <p>Série não encontrada</p>;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEditInList = (editedData) => {
    console.log('Dados editados na lista pessoal:', editedData);
    closeModal();
  };

  const defaultPicture = 'https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg'; 


  const editButtonStyle = {
    backgroundColor: "transparent",
    border: "none",
    color: "#f7d354", 
    fontSize: "1rem",
    padding: "0.3rem 0.5rem",
    marginTop: "0.5rem",
    cursor: "pointer",
    transition: "background-color 0.4s, color 0.4s",
  };

  const editButtonHoverStyle = {
    backgroundColor: "#f7d354", 
    color: "#000", 
  };

  return (
    <div className="series-card">
      <button
        style={editButtonStyle}
        onMouseEnter={() => this.style = editButtonHoverStyle}
        onMouseLeave={() => this.style = editButtonStyle}
        onClick={openModal}
      >
        Editar
      </button>
      <EditListaPessoalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onEdit={handleEditInList}
        initialData={{
          nota,
          review,
          volumesLidos,
          tipo,
          serieId: serie.id, 
        }}
      />
      <img src={serie.imagemSerie || defaultPicture} alt={serie.nomeSerie} />
      <h2>
        {serie.nomeSerie}({new Date(serie.publiSerie).getFullYear()})
      </h2>
      <p>Nota: {nota}</p> 
      <p>Review: {review}</p> 
      <p>Progresso: {volumesLidos}/{serie.volumes}</p>
      {showLink && (
        <Link to={`/series/${serie.id}`} state={{ id: serie.id }}>
          Detalhes
        </Link>
      )}
    </div>
  );
};

export default SeriesCardFirestoreListaPessoal;
