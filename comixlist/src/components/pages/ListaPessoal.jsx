import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { AuthContext } from "../contexts/auth";
import { firestore } from "../bd/FireBase";
import SeriesCardFirestoreListaPessoal from "./SeriesCardFirestoreListaPessoal";
import styles from "./ListaPessoal.module.css";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FiArrowLeft } from "react-icons/fi";


const ListaPessoal = () => {
  const { user } = useContext(AuthContext);
  const [listaPessoal, setListaPessoal] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tipoQueryParam = queryParams.get('tipo');
  const itemsPerPage = 20;
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
    if (tipoQueryParam === "completo") {
      return item.tipo === "completo";
    } else if (tipoQueryParam === "lendo") {
      return item.tipo === "lendo";
    } else if (tipoQueryParam === "dropado") {
      return item.tipo === "dropado";
    } else if (tipoQueryParam === "planejo-ler") {
      return item.tipo === "planejo-ler";
    } else {
      return true;
    }
  });

  const handleDeleteFromList = async (serieId) => {
    try {
      const serieIndex = listaPessoal.findIndex((item) => item.serieId === serieId);

      if (serieIndex !== -1) {
        const novaListaPessoal = [...listaPessoal];
        novaListaPessoal.splice(serieIndex, 1);

        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, { listaPessoal: novaListaPessoal });

        setListaPessoal(novaListaPessoal);

        console.log('Série excluída da lista pessoal com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao excluir a série da lista pessoal:', error);
    }
  };

  const handleEditInList = async (editedData) => {
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const listaPessoalData = userData.listaPessoal || [];
  
        const itemIndex = listaPessoalData.findIndex((item) => item.serieId === editedData.serieId);
  
        if (itemIndex !== -1) {
          listaPessoalData[itemIndex] = editedData;
  
          await updateDoc(userDocRef, { listaPessoal: listaPessoalData });
  
          console.log('Item editado na lista pessoal com sucesso.');
  
          setListaPessoal(listaPessoalData);
        } else {
          console.error('Item não encontrado na lista pessoal.');
        }
      }
    } catch (error) {
      console.error('Erro ao editar item na lista pessoal:', error);
    }
  };
  

  const totalItems = listaFiltrada.length;

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className={styles.container}>
        <button type="button" className={styles.backButton} onClick={() => navigate('/profile/')}>
          <FiArrowLeft className={styles.backIcon} /> Voltar
        </button>
      <h2 className={styles.title}>Lista Pessoal:</h2>
      <div className={styles.buttonContainer}>
        <button onClick={() => navigate('/listaPessoal/?tipo=')}>Todos</button>
        <button onClick={() => navigate('/listaPessoal/?tipo=completo')}>Completo</button>
        <button onClick={() => navigate('/listaPessoal/?tipo=lendo')}>Lendo</button>
        <button onClick={() => navigate('/listaPessoal/?tipo=dropado')}>Largado</button>
        <button onClick={() => navigate('/listaPessoal/?tipo=planejo-ler')}>Planejo Ler</button>
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

      <div className={styles["comics_container"]}>
        {searchResults.length > 0 ? (
          searchResults.slice(startIndex, endIndex).map((item) => (
            <div key={item.id} className={styles["comics_container__item"]}>
              {renderComic(item)}
            </div>
          ))
        ) : (
          listaFiltrada.slice(startIndex, endIndex).map((item) => (
            <div key={item.id} className={styles["comics_container__item"]}>
              {renderComic(item)}
            </div>
          ))
        )}
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

  function renderComic(item) {
    const matchingSerie = seriesData.find((serie) => serie.id === item.serieId);
    if (matchingSerie) {
      return (
        <SeriesCardFirestoreListaPessoal
          serie={matchingSerie}
          nota={item.nota}
          tipo={item.tipo}
          review={item.review}
          volumesLidos={item.volumesLidos}
          onDeleteFromList={() => handleDeleteFromList(item.serieId)}
          onEdit={handleEditInList}
        />
      );
    } else {
      return <p>Série não encontrada</p>;
    }
  }
};

export default ListaPessoal;