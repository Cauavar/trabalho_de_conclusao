import React, { useState, useEffect, useContext } from "react";
import md5 from "md5";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { firestore } from "../bd/FireBase";
import SeriesCardApi from "./SeriesCardApi";
import SeriesCardFirestore from "./SeriesCardFirestore";
import "./ComicsGrid.css";
import { AuthContext } from "../contexts/auth";

const Home = () => {
  const [topSeries, setTopSeries] = useState([]);
  const [mySeries, setMySeries] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const seriesURL = "https://gateway.marvel.com/v1/public/series";
  const apiPublicKey = "1f9dc1c5fe6d097dde3bb4ca36ecbff0";
  const apiPrivateKey = "219b41d0053667342c94897c56048704ecc93e7e";

  const getTopRatedSeries = async (url) => {
    const timestamp = Date.now();
    const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);

    try {
      const response = await fetch(
        `${url}?ts=${timestamp}&apikey=${apiPublicKey}&hash=${hash}&limit=50`
      );
      const data = await response.json();
      setTopSeries(data.data.results);
    } catch (error) {
      console.error("Error fetching top rated series:", error);
    }
  };

  const fetchMySeriesFromFirestore = async () => {
    try {
      const seriesCollectionRef = collection(firestore, "serie");
      const querySnapshot = await getDocs(seriesCollectionRef);
      const seriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMySeries(seriesData);
    } catch (error) {
      console.error("Error fetching your series from Firestore:", error);
    }
  };

  useEffect(() => {
    getTopRatedSeries(seriesURL);
    fetchMySeriesFromFirestore();
  }, []);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="container">
      <h2 className="title">Séries:</h2>
      <div className="navbar-links">
        {isAuthenticated ? (
          <Link to="/cadastroSerie">Cadastre uma Série</Link>
        ) : null}
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
          disabled={topSeries.length <= endIndex}
        >
          Próxima
        </button>
      </div>
      <div className="comics_container">
        {topSeries.slice(startIndex, endIndex).map((serie) => (
          <SeriesCardApi key={serie.id} serie={serie} />
        ))}
        {mySeries.slice(startIndex, endIndex).map((serie) => (
          <SeriesCardFirestore key={serie.id} serie={serie} />
        ))}
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
          disabled={topSeries.length <= endIndex}
        >
          Próxima
        </button>
      </div>
  
      <br />
      <br />

    </div>
  );
  
};

export default Home;
