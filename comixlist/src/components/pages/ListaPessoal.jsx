import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../contexts/auth";
import { firestore } from "../bd/FireBase";
import SeriesCardFirestore from "./SeriesCardFirestore";
import SeriesCardApi from "./SeriesCardApi";
import "./ComicsGrid.css";

const ListaPessoal = () => {
  const { user } = useContext(AuthContext);
  const [listaPessoal, setListaPessoal] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="container">
      <h2 className="title">Lista Pessoal:</h2>
      <div className="pagination">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {currentPage}</span>
        <button
          onClick={goToNextPage}
          disabled={listaPessoal.length <= endIndex}
        >
          Próxima
        </button>
      </div>
      <div className="comics_container">
        {listaPessoal.slice(startIndex, endIndex).map((item) => {
          const matchingSerie = seriesData.find((serie) => serie.id === item.serieId);

          if (matchingSerie) {
            return (
              <div key={item.id} className="series-card">
                <SeriesCardFirestore serie={matchingSerie} nota={item.nota} />
              </div>
            );
          } else {
            return (
              <div key={item.id} className="series-card">
                <p>Série não encontrada</p>
              </div>
            );
          }
        })}
      </div>
      <div className="pagination">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {currentPage}</span>
        <button
          onClick={goToNextPage}
          disabled={listaPessoal.length <= endIndex}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default ListaPessoal;
