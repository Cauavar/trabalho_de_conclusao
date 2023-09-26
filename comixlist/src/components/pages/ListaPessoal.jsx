import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../contexts/auth";
import { firestore } from "../bd/FireBase";
import SeriesCardFirestoreListaPessoal from "./SeriesCardFirestoreListaPessoal";
import styles from './ListaPessoal.module.css';

const ListaPessoal = () => {
  const { user } = useContext(AuthContext);
  const [listaPessoal, setListaPessoal] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tipoSelecionado, setTipoSelecionado] = useState("todos");
  const itemsPerPage = 18;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    if (!user) return;

    const fetchListaPessoal = async () => {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const listaPessoalData = userData.listaPessoal || [];

        console.log("Lista Pessoal:", listaPessoalData);

        setListaPessoal(listaPessoalData);
      }
    };

    const fetchSeriesData = async () => {
      const seriesCollectionRef = collection(firestore, "serie");
      const querySnapshot = await getDocs(seriesCollectionRef);
      const seriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSeriesData(seriesData);
    };

    fetchListaPessoal();
    fetchSeriesData();
  }, [user]);

  const listaFiltrada = listaPessoal.filter((item) => {
    if (tipoSelecionado === "todos") {
      return true;
    } else {
      return item.tipo === tipoSelecionado;
    }
  });

  const totalItems = listaFiltrada.length;

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lista Pessoal:</h2>
      <div>
        <button onClick={() => setTipoSelecionado("todos")}>Todos</button>
        <button onClick={() => setTipoSelecionado("completo")}>Completo</button>
        <button onClick={() => setTipoSelecionado("lendo")}>Lendo</button>
        <button onClick={() => setTipoSelecionado("dropado")}>Dropado</button>
        <button onClick={() => setTipoSelecionado("planejo-ler")}>Planejo Ler</button>
      </div>
      <div className={styles.pagination}>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={styles.button}
        >
          Anterior
        </button>
        <span>Página {currentPage}</span>
        <button
          onClick={goToNextPage}
          disabled={endIndex >= totalItems}
          className={styles.button}
        >
          Próxima
        </button>
      </div>
      <div className={styles.comics_container}>
        {listaFiltrada.slice(startIndex, endIndex).map((item) => {
          const matchingSerie = seriesData.find((serie) => serie.id === item.serieId);
          if (matchingSerie) {
            return (
              <div key={item.id} className={styles.seriesCard}>
                <SeriesCardFirestoreListaPessoal
                  serie={matchingSerie}
                  nota={item.nota}
                  tipo={item.tipo}
                  review={item.review}
                  volumesLidos={item.volumesLidos}
                />
              </div>
            );
          } else {
            return (
              <div key={item.id} className={styles.seriesCard}>
                <p>Série não encontrada</p>
              </div>
            );
          }
        })}
      </div>
      <div className={styles.pagination}>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={styles.button}
        >
          Anterior
        </button>
        <span>Página {currentPage}</span>
        <button
          onClick={goToNextPage}
          disabled={endIndex >= totalItems}
          className={styles.button}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};  

export default ListaPessoal;
