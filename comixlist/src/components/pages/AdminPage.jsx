import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import SeriesCardFirestore from './SeriesCardFirestore';
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../bd/FireBase"; 
import "./ComicsGrid.css";

function AdminPage() {
  const [unapprovedSeries, setUnapprovedSeries] = useState([]);
  const { user } = useContext(AuthContext); 

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

  const handleApprove = async (serieId) => {
    try {
      const serieDocRef = doc(firestore, 'serie', serieId);
      await updateDoc(serieDocRef, {
        Aprovada: true,
      });

      // Atualize o estado para refletir a aprovação
      setUnapprovedSeries((prevState) =>
        prevState.map((serie) =>
          serie.id === serieId ? { ...serie, Aprovada: true } : serie
        )
      );
    } catch (error) {
      console.error('Erro ao aprovar série:', error);
    }
  };

  return (
    <div>
      <h2>Página de Administração</h2>
      <h3>Séries Pendentes de Aprovação</h3>
      <ul>
        {unapprovedSeries.map((serie) => (
          <li key={serie.id}>
            <SeriesCardFirestore serie={serie} />
            <button onClick={() => handleApprove(serie.id)}>Aprovar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPage;
