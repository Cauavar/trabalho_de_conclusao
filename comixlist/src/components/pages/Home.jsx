import React, { useState, useEffect } from "react";
import md5 from "md5";
import SeriesCard from "./SeriesCard"; 
import "./ComicsGrid.css";

const seriesURL = "https://gateway.marvel.com/v1/public/series";
const apiPublicKey = "1f9dc1c5fe6d097dde3bb4ca36ecbff0";
const apiPrivateKey = "219b41d0053667342c94897c56048704ecc93e7e";

const Home = () => {
  const [topSeries, setTopSeries] = useState([]);

  const getTopRatedSeries = async (url) => {
    const timestamp = Date.now();
    const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);

    const res = await fetch(
      `${url}?ts=${timestamp}&apikey=${apiPublicKey}&hash=${hash}&limit=21`
    );
    const data = await res.json();

    setTopSeries(data.data.results);
  };

  useEffect(() => {
    const topRatedSeriesURL = seriesURL;

    getTopRatedSeries(topRatedSeriesURL);
  }, []);

  return (
    <div className="container">
      <h2 className="title">Séries:</h2>
      <div className="comics_container">
        {topSeries.length === 0 && <p>Carregando...</p>}
        {topSeries.length > 0 &&
          topSeries.map((serie) => (
            <SeriesCard key={serie.id} serie={serie} />
          ))}
      </div>
    </div>
  );
};

export default Home;

