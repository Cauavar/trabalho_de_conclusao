import React, { useState, useEffect, useContext, useCallback } from "react";
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
  const [displayedSeriesIds, setDisplayedSeriesIds] = useState([]);
  const [filteredApiSeries, setFilteredApiSeries] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const seriesURL = "https://gateway.marvel.com/v1/public/series";
  const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
  const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';
  const limit = 50;

  const sortSeriesAlphabetically = (series, propertyName) => {
    return series.sort((a, b) => {
      const nameA = (a[propertyName] || "").toLowerCase();
      const nameB = (b[propertyName] || "").toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  };

  const getTopRatedSeries = useCallback(async () => {
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
            const serieId = apiSerie.id.toString();
            return (
              !displayedSeriesIds.includes(serieId) &&
              !mySeries.some((mySerie) => mySerie.id === serieId)
            );
          });

          const sortedApiSeries = sortSeriesAlphabetically(uniqueApiSeries, 'title');

          const filteredSeries = sortedApiSeries.filter((apiSerie) => {
            return !filteredApiSeries.some((filteredSerie) => filteredSerie.id === apiSerie.id);
          });

          setAllApiSeries((prevSeries) => [...prevSeries, ...filteredSeries]);
          setDisplayedSeriesIds((prevIds) => [
            ...prevIds,
            ...filteredSeries.map((apiSerie) => apiSerie.id.toString()),
          ]);

          setFilteredApiSeries((prevFilteredSeries) => [...prevFilteredSeries, ...filteredSeries]);
        } else {
          console.error("No results found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching top-rated series:", error);
      }
    }
  }, [allApiSeries, currentPage, displayedSeriesIds, filteredApiSeries, mySeries]);

  const fetchMySeriesFromFirestore = useCallback(async () => {
    try {
      const seriesCollectionRef = collection(firestore, "serie");
      const querySnapshot = await getDocs(query(seriesCollectionRef, where("Aprovada", "==", true)));
      const approvedSeries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedFirestoreSeries = sortSeriesAlphabetically(approvedSeries, 'nomeSerie');
      setMySeries(sortedFirestoreSeries);
    } catch (error) {
      console.error("Error listing approved series:", error);
    }
  }, []);

  useEffect(() => {
    fetchMySeriesFromFirestore();
    getTopRatedSeries();
  }, [fetchMySeriesFromFirestore, getTopRatedSeries]);

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
        {mySeries.slice(startIndex, endIndex).map((serie) => (
          <SeriesCardFirestore key={`firebase-${serie.id}`} serie={serie} />
        ))}

        {filteredApiSeries.slice(startIndex, endIndex).map((serie) => (
          <SeriesCardApi key={`api-${serie.id}`} serie={serie} />
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
