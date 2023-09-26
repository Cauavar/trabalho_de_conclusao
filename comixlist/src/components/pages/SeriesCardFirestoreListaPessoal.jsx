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
  return (
    <div className="series-card">
      <img src={serie.imagemSerie || defaultPicture} alt={serie.nomeSerie} />
      <h2>
        {serie.nomeSerie}({new Date(serie.publiSerie).getFullYear()})
      </h2>
      <p>Nota: {nota}</p> 
      <p>Review: {review}</p> 
      <p>Progresso: {volumesLidos}/{serie.volumes}</p>
      <button className="editInListButton" onClick={openModal}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Editar na Lista
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
          serieId: serie.id, // Passa o ID da série para o modal.
        }}
      />
      {showLink && (
        <Link to={`/series/${serie.id}`} state={{ id: serie.id }}>
          Detalhes
        </Link>
      )}
    </div>
  );
};

export default SeriesCardFirestoreListaPessoal;
