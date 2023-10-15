import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../bd/FireBase';
import { Link } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  const [unapprovedSeries, setUnapprovedSeries] = useState([]);
  const { user } = useContext(AuthContext);
  const defaultPicture = 'https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg';
  const seriesPerPage = 3;

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

  useEffect(() => {
    if (user) {
      fetchUnapprovedSeriesFromFirestore();
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
