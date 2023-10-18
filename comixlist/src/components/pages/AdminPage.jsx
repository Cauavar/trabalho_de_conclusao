import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../bd/FireBase';
import { Link } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  const [unapprovedSeries, setUnapprovedSeries] = useState([]);
  const [unapprovedEdits, setUnapprovedEdits] = useState([]); 
  const { user } = useContext(AuthContext);
  const defaultPicture = 'https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg';
  const seriesPerPage = 3;
  const editsPerPage = 3;

  const fetchUnapprovedSeriesFromFirestore = async () => {
    try {
      const seriesCollectionRef = collection(firestore, 'serie');
      const querySnapshot = await getDocs(query(seriesCollectionRef, where('Aprovada', '==', false)));
      const unapprovedSeries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUnapprovedSeries(unapprovedSeries);
    } catch (error) {
      console.error('Erro ao listar séries não aprovadas:', error);
    }
  };

  const fetchUnapprovedEditsFromFirestore = async () => {
    try {
      const editsCollectionRef = collection(firestore, 'edicoesPendentes');
      const querySnapshot = await getDocs(query(editsCollectionRef));
      const unapprovedEdits = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUnapprovedEdits(unapprovedEdits);
    } catch (error) {
      console.error('Erro ao listar propostas de edição não aprovadas:', error);
    }
  };


  useEffect(() => {
    if (user) {
      fetchUnapprovedSeriesFromFirestore();
      fetchUnapprovedEditsFromFirestore();
    }
  }, [user]);

  const [currentPage, setCurrentPage] = useState(0);

  const handleApprove = async (serieId) => {
    try {
      const serieDocRef = doc(firestore, 'serie', serieId);
      await updateDoc(serieDocRef, {
        Aprovada: true,
      });

      setUnapprovedSeries((prevState) =>
        prevState.filter((serie) => serie.id !== serieId)
      );
    } catch (error) {
      console.error('Erro ao aprovar série:', error);
    }
  };

  const handleReject = async (serieId) => {
    try {
      const serieDocRef = doc(firestore, 'serie', serieId);
      await deleteDoc(serieDocRef); 

      setUnapprovedSeries((prevState) => prevState.filter((serie) => serie.id !== serieId));
    } catch (error) {
      console.error('Erro ao reprovar série:', error);
    }
  };

const acceptEdit = async (editId, serieId, campoEditado, valorEditado) => {
  try {
    if (editId && serieId) { // Verifique se editId e serieId estão definidos
      // Verifique se a edição foi aprovada
      const editDocRef = doc(firestore, 'edicoesPendentes', editId);
      const editDoc = await getDoc(editDocRef);

      if (editDoc.exists() && !editDoc.data().aprovada) {
        // Atualize a série com a edição aceita
        const serieDocRef = doc(firestore, 'serie', serieId);
        const updateData = {
          [campoEditado]: valorEditado,
        };
        await updateDoc(serieDocRef, updateData);

        // Marque a edição como aprovada
        await updateDoc(editDocRef, { aprovada: true });

        console.log('Edição aceita com sucesso.');
      } else {
        console.error('Edição já aprovada ou não encontrada.');
      }
    } else {
      console.error('Parâmetros editId e serieId não definidos corretamente.');
    }
  } catch (error) {
    console.error('Erro ao aceitar a edição:', error);
  }
};
  
  // Função para rejeitar uma edição
  const rejectEdit = async (editId) => {
    try {
      const editDocRef = doc(firestore, 'edicoesPendentes', editId);
      await deleteDoc(editDocRef);
  
      console.log('Edição rejeitada com sucesso.');
    } catch (error) {
      console.error('Erro ao rejeitar a edição:', error);
    }
  };

  const next = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const previous = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const seriesToDisplay = unapprovedSeries.slice(currentPage * seriesPerPage, (currentPage + 1) * seriesPerPage);

  return (
    <div className="admin-page">
      <h2 className="admin-header">Página de Administração</h2>
      <h3>Séries Pendentes de Aprovação</h3>
      <div className="series-list">
        {seriesToDisplay.map((serie) => (
          <div key={serie.id} className="series-item">
            <div className="series-cardi">
              <img src={serie.imagemSerie || defaultPicture} alt={serie.nomeSerie} />
              <div className="series-info">
                <h2>
                  {serie.nomeSerie}({new Date(serie.publiSerie).getFullYear()})
                </h2>
                <Link to={`/series/${serie.id}`} state={{ id: serie.id }}>
                  Detalhes
                </Link>
              </div>
            </div>
            <button className="approve-button" onClick={() => handleApprove(serie.id)}>
              Aprovar
            </button>
            <button className="reject-button" onClick={() => handleReject(serie.id)}>
              Reprovar
            </button>
          </div>
        ))}
      </div>

      <div className="edit-list">
        {unapprovedEdits.map((edit) => (
          <div key={edit.id} className="edit-item">
            <div className="edit-info">
              <h2>{`Edição proposta para: ${edit.serieId}`}</h2>
              <p>{`Campo a ser editado: ${edit.campoEditado}`}</p>
              <p>{`Novo valor: ${edit.valorEditado}`}</p>
            </div>
            <button className="accept-edit-button" onClick={() => acceptEdit(edit.id, edit.serieId, edit.campoEditado, edit.valorEditado)}>
              Aceitar
            </button>
            <button className="reject-edit-button" onClick={() => rejectEdit(edit.id)}>
              Rejeitar
            </button>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button className="previous" onClick={previous} disabled={currentPage === 0}>
          Anterior
        </button>
        <button className="next" onClick={next} disabled={currentPage === Math.floor(unapprovedSeries.length / seriesPerPage)}>
          Próxima
        </button>
      </div>
    </div>
  );
}

export default AdminPage;
