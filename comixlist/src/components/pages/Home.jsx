import React, { useState, useEffect, useContext  } from "react";
import md5 from "md5";
import SeriesCard from "./SeriesCard"; 
import { collection, getDocs } from 'firebase/firestore'; 
import { firestore } from "../bd/FireBase";
import "./ComicsGrid.css";
import { AuthContext } from "../contexts/auth";
import { Link } from 'react-router-dom';

const Home = () => {
  const [topSeries, setTopSeries] = useState([]);
  const [mySeries, setMySeries] = useState([]);
  const { isAuthenticated} = useContext(AuthContext);

  const seriesURL = "https://gateway.marvel.com/v1/public/series";
  const apiPublicKey = "1f9dc1c5fe6d097dde3bb4ca36ecbff0";
  const apiPrivateKey = "219b41d0053667342c94897c56048704ecc93e7e";

  const getTopRatedSeries = async (url) => {
    const timestamp = Date.now();
    const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);

    const res = await fetch(
      `${url}?ts=${timestamp}&apikey=${apiPublicKey}&hash=${hash}&limit=21`
    );
    const data = await res.json();

    setTopSeries(data.data.results);
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
      console.error("Erro ao buscar suas séries do Firestore:", error);
    }
  };

  useEffect(() => {
    getTopRatedSeries(seriesURL);
    fetchMySeriesFromFirestore();
  }, []);

  return (
    <div className="container">
      <h2 className="title">Séries:</h2>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/cadastroSerie">Cadastre uma Série</Link>
          </>
        ) : (
          <>
          </>
        )}
      </div>
      <div className="comics_container">
        {topSeries.length === 0 && <p>Carregando...</p>}
        {topSeries.length > 0 &&
          topSeries.map((serie) => (
            <SeriesCard key={serie.id} serie={serie} />
          ))}
        {mySeries.length === 0 && <p>Nenhuma série encontrada.</p>}
        {mySeries.length > 0 &&
          mySeries.map((serie) => (
            <SeriesCard key={serie.id} serie={serie} />
          ))}
      </div>
    </div>
  );
};

export default Home;
