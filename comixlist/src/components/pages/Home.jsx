import React, { useState, useEffect, useContext } from "react";
import md5 from "md5";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { firestore } from "../bd/FireBase";
import SeriesCardApi from "./SeriesCardApi";
import SeriesCardFirestore from "./SeriesCardFirestore";
import "./ComicsGrid.css";
import { AuthContext } from "../contexts/auth";

const Home = () => {
  const [allApiSeries, setAllApiSeries] = useState([]);
  const [mySeries, setMySeries] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const seriesURL = "https://gateway.marvel.com/v1/public/series";
  const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
  const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';
  const limit = 50;

  const getTopRatedSeries = async () => {
    if (allApiSeries.length < currentPage * itemsPerPage) {
      const timestamp = Date.now();
      const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);
      let offset = (currentPage - 1) * limit;

      try {
        const response = await fetch(
          `${seriesURL}?ts=${timestamp}&apikey=${apiPublicKey}&hash=${hash}&limit=${limit}&offset=${offset}`
        );
        const data = await response.json();

        if (data.data && data.data.results && data.data.results.length > 0) {
          const uniqueApiSeries = data.data.results.filter((apiSerie) => {
            // Verifique se o ID da série já existe em mySeries.
            return !mySeries.some((mySerie) => mySerie.id === apiSerie.id);
          });

          setAllApiSeries((prevSeries) => [...prevSeries, ...uniqueApiSeries]);
        } else {
          console.error("No results found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching top-rated series:", error);
      }
    }
  };

  const fetchMySeriesFromFirestore = async () => {
    try {
      const seriesCollectionRef = collection(firestore, "serie");
      const querySnapshot = await getDocs(query(seriesCollectionRef, where("Aprovada", "==", true)));
      const approvedSeries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMySeries(approvedSeries);
    } catch (error) {
      console.error("Error listing approved series:", error);
    }
  };

  useEffect(() => {
    fetchMySeriesFromFirestore();
    getTopRatedSeries();
  }, [currentPage, mySeries, allApiSeries]); // Certifique-se de incluir mySeries e allApiSeries como dependências.

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Séries:</h2>
      <div className="navbar-links">
        {isAuthenticated ? <Link to="/cadastroSerie">Cadastre uma Série</Link> : null}
      </div>
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage}</span>
        <button onClick={goToNextPage} disabled={allApiSeries.length < currentPage * itemsPerPage}>
          Próxima
        </button>
      </div>
      <div className="comics_container">
        {allApiSeries.slice(startIndex, endIndex).map((serie) => (
          <SeriesCardApi key={serie.id} serie={serie} />
        ))}
        {mySeries.slice(startIndex, endIndex).map((serie) => (
          <SeriesCardFirestore key={serie.id} serie={serie} />
        ))}
      </div>

      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage}</span>
        <button onClick={goToNextPage} disabled={allApiSeries.length < currentPage * itemsPerPage}>
          Próxima
        </button>
      </div>

      <br />
      <br />
    </div>
  );
};

export default Home;
