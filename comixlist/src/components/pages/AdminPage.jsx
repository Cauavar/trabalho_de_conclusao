import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { firestore } from '../bd/FireBase';
import { Link } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  const [unapprovedSeries, setUnapprovedSeries] = useState([]);
  const [unapprovedEdits, setUnapprovedEdits] = useState([]);
  const { user } = useContext(AuthContext);
  const defaultPicture = 'https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg';
  const seriesPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const [seriesData, setSeriesData] = useState({});

  useEffect(() => {
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
        const querySnapshot = await getDocs(query(editsCollectionRef, where('aprovada', '==', false)));
        const unapprovedEdits = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUnapprovedEdits(unapprovedEdits);
      } catch (error) {
        console.error('Erro ao listar propostas de edição não aprovadas:', error);
      }
    };

    const fetchSeriesDataFromFirestore = async () => {
      try {
        const seriesCollectionRef = collection(firestore, 'serie');
        const seriesQuerySnapshot = await getDocs(seriesCollectionRef);
        const seriesData = {};
  
        seriesQuerySnapshot.forEach((doc) => {
          seriesData[doc.id] = doc.data();
        });
  
        setSeriesData(seriesData);
      } catch (error) {
        console.error('Erro ao listar séries:', error);
      }
    };

    if (user) {
      fetchUnapprovedSeriesFromFirestore();
      fetchUnapprovedEditsFromFirestore();
      fetchSeriesDataFromFirestore();
    }
  }, [user]);

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

  const acceptEdit = async (editId, idSerieOriginal, changes) => {
    try {
      if (editId && idSerieOriginal) {
        const editDocRef = doc(firestore, 'edicoesPendentes', editId);
        const editDoc = await getDoc(editDocRef);
  
        if (editDoc.exists() && !editDoc.data().aprovada) {
          const serieDocRef = doc(firestore, 'serie', idSerieOriginal);
          const currentSerie = await getDoc(serieDocRef);
  
          if (currentSerie.exists()) {
            const serieData = currentSerie.data();
  
            for (const change in changes) {
              const { newValue } = changes[change];
              serieData[change] = newValue;
            }
  
            await updateDoc(serieDocRef, serieData);
            await updateDoc(editDocRef, { aprovada: true });

            const editToDeleteRef = doc(firestore, 'edicoesPendentes', editId);
            await deleteDoc(editToDeleteRef);
  
            setUnapprovedSeries((prevState) =>
              prevState.map((serie) => {
                if (serie.id === idSerieOriginal) {
                  return {
                    ...serie,
                    ...serieData,
                  };
                }
                return serie;
              })
            );
  
            setUnapprovedEdits((prevState) =>
              prevState.filter((edit) => edit.id !== editId)
            );
  
            console.log('Edição aceita com sucesso.');
          } else {
            console.error('Série original não encontrada.');
          }
        } else {
          console.error('Edição já aprovada ou não encontrada.');
        }
      } else {
        console.error('Parâmetros editId, serieIdOriginal ou changes são indefinidos.');
      }
    } catch (error) {
      console.error('Erro ao aceitar a edição:', error);
    }
  };
  

  const rejectEdit = async (editId) => {
    try {
      const editDocRef = doc(firestore, 'edicoesPendentes', editId);
      await deleteDoc(editDocRef);

      setUnapprovedEdits((prevState) =>
        prevState.filter((edit) => edit.id !== editId)
      );

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

  const seriesToDisplay = unapprovedSeries.slice(
    currentPage * seriesPerPage,
    (currentPage + 1) * seriesPerPage
  );

  return (
    <div className="admin-page">
      <h2 className="admin-header">Página de Administração</h2>
      <h3>Séries Pendentes de Aprovação</h3>
      <div className="series-list">
            {unapprovedSeries.length === 0 ? (
        <p>Nenhuma solicitação de série pendente de aprovação.</p>
      ) : (
        seriesToDisplay.map((serie) => (
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
        ))
      )}

      </div>

      <h3>Propostas de Edição Pendentes</h3>
      <div className="series-list">
      {unapprovedEdits.length === 0 ? (
  <p>Nenhuma proposta de edição pendente.</p>
) : (
  unapprovedEdits.map((edit) => (
    <div key={edit.id} className="series-item">
      <div className="series-cardi">
        <div className="series-info">
          <h2>{`Edição proposta para: ${seriesData[edit.idSerieOriginal].nomeSerie}`}</h2>
          {Object.entries(edit.changes).map(([campo, { oldValue, newValue }]) => (
            <div key={campo}>
              <p>{`Campo a ser editado: ${campo}`}</p>
              {campo === 'imagemSerie' ? (
                <>
                  <p>Valor antigo:</p>
                  <img src={oldValue || defaultPicture} alt={`Valor antigo ${campo}`} />
                  <p>Valor novo:</p>
                  <img src={newValue || defaultPicture} alt={`Valor novo ${campo}`} />
                </>
              ) : (
                <>
                  <p>{`Valor antigo: ${oldValue}`}</p>
                  <p>{`Novo valor: ${newValue}`}</p>
                </>
              )}
            </div>
          ))}
        </div>
        <button
          className="approve-button"
          onClick={() => acceptEdit(edit.id, edit.idSerieOriginal, edit.changes)}
        >
          Aceitar
        </button>
        <button className="reject-button" style={{ maxWidth: '100px' }} onClick={() => rejectEdit(edit.id)}>
          Rejeitar
        </button>
      </div>
    </div>
  ))
)}

</div>
      <div className="pagination">
        <button className="previous" onClick={previous} disabled={currentPage === 0}>
          Anterior
        </button>
        <button
          className="next"
          onClick={next}
          disabled={currentPage === Math.floor(unapprovedSeries.length / seriesPerPage)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export default AdminPage;