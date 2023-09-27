  import React, { useState, useEffect } from "react";
  import { Link } from "react-router-dom";
  import EditListaPessoalModal from "../modals/EditListaPessoalModal";
  import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

  const SeriesCardFirestoreListaPessoal = ({ serie, showLink = true, nota, tipo, review, volumesLidos, onDeleteFromList, onEdit }) => {
    if (!serie) {
      return <p>Série não encontrada</p>;
    }
    const [editButtonHover, setEditButtonHover] = useState(false);
  const [deleteButtonHover, setDeleteButtonHover] = useState(false);


    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };


    const defaultPicture = 'https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg';

    const iconContainerStyle = {
      display: "flex",
      flexDirection: "row", 
      justifyContent: "space-between",
      alignItems: "center",
    };


    const editButtonHoverStyle = {
      backgroundColor: "#f7d354", 
      color: "#000", 
    };
    const editButtonStyle = {
      backgroundColor: "transparent",
      border: "none",
      color: "#f7d354",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background-color 0.4s, color 0.4s",
      ...(editButtonHover && editButtonHoverStyle), 
    };

    const deleteButtonStyle = {
      backgroundColor: "transparent",
      border: "none",
      color: "red",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background-color 0.4s, color 0.4s",
      ...(deleteButtonHover && deleteButtonHoverStyle),
    };
    
    const deleteButtonHoverStyle = {
      backgroundColor: "red",
      color: "#fff",
    };

    const handleEditInList = async (editedData) => {
      try {
        
        await onEdit(editedData);
    
        
        closeModal();
    
        
        setEditButtonHover(false);
        setDeleteButtonHover(false);
      } catch (error) {
        console.error('Erro ao editar a lista pessoal:', error);
      }
    };

    return (
      <div className="series-card">
        <div style={iconContainerStyle}>
        <button
    style={editButtonStyle}
    onMouseEnter={() => setEditButtonHover(true)}
    onMouseLeave={() => setEditButtonHover(false)}
    onClick={openModal}
  >
    <FaPencilAlt />
  </button>
          <button style={deleteButtonStyle} onClick={onDeleteFromList}>
            <FaTrashAlt /> 
          </button>
        </div>
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
          <Link to={`/resenha/${serie.id}`} state={{ id: serie.id }}>
            Resenha
          </Link>
        )}
      </div>
    );
  };

  export default SeriesCardFirestoreListaPessoal;
