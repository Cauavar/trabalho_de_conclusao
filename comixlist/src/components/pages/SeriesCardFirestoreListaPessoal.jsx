import React, { useState } from "react";
import { Link } from "react-router-dom";
import EditListaPessoalModal from "../modals/EditListaPessoalModal";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import Modal from 'react-modal'; 
import "./SeriesCardFirestoreListaPessoal.css";

const SeriesCardFirestoreListaPessoal = ({ serie, showLink = true, nota, tipo, review, volumesLidos, onDeleteFromList, onEdit }) => {
  if (!serie) {
    return <p>Série não encontrada</p>;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
  };

  const confirmDelete = () => {
    setIsDeleteConfirmationOpen(false);
    onDeleteFromList();
    toast.success("Série excluída da lista pessoal com sucesso", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleEditInList = async (editedData) => {
    try {
      await onEdit(editedData);
      closeModal();
    } catch (error) {
      console.error('Erro ao editar a lista pessoal:', error);
    }
  };

  const defaultPicture =
    "https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg";

  return (
    <div className="series-card">
      <div className="icon-container">
        <FaPencilAlt
          className="edit-button"
          onClick={openModal}
        />
        <FaTrashAlt
          className="delete-button"
          onClick={() => setIsDeleteConfirmationOpen(true)}
        />
      </div>
      <Modal
        isOpen={isDeleteConfirmationOpen}
        onRequestClose={() => setIsDeleteConfirmationOpen(false)}
        contentLabel="Confirmar exclusão"
        ariaHideApp={false}
        className="modal-content delete-modal" 
        overlayClassName="modal-overlay" 
      >
        <p>Tem certeza de que deseja excluir esta série?</p>
        <button onClick={confirmDelete} className="add-button">Sim</button>
        <button onClick={cancelDelete} className="cancel-button">Cancelar</button>
      </Modal>
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
