import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import Modal from 'react-modal';
import "./SeriesCardFirestoreListaPessoal.css";

const SeriesCardApiListaPessoal = ({ serieData, nota, tipo, review, volumesLidos, onDeleteFromList, onEdit }) => {
  if (!serieData) {
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
  };

  return (
    <div className="series-card">
      <div className="icon-container">
        <button
          className="edit-button"
          onClick={() => onEdit({ serieId: serieData.id, nota, tipo, review, volumesLidos })}
        >
          Editar
        </button>
        <button
          className="delete-button"
          onClick={() => setIsDeleteConfirmationOpen(true)}
        >
          Excluir
        </button>
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
      <div className="series-card-lista-pessoal">
        <img
          src={`${serieData.thumbnail.path}.${serieData.thumbnail.extension}`}
          alt={serieData.title}
        />
        <h2>{serieData.title}</h2>
        <p>Descrição: {serieData.description || "N/A"}</p>
        <p>Autor: {serieData.creators.items[0]?.name || "N/A"}</p>
        <p>Data de Publicação: {(serieData.dates && serieData.dates.find(date => date.type === "onsaleDate")?.date) || "N/A"}</p>
        <p>Número de Volumes: {serieData.pageCount || "N/A"}</p>
        <div className="rating">
          <FaStar /> {nota || "N/A"}
        </div>
      </div>
      <div className="actions">
        <button onClick={() => onDeleteFromList(serieData.id)}>Remover da Lista</button>
      </div>
    </div>
  );
};

export default SeriesCardApiListaPessoal;
