import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BsFillFileEarmarkTextFill } from "react-icons/bs";
import "./Comic.css";
import md5 from "md5";
import SeriesCard from "./SeriesCard";

const apiPublicKey = "1f9dc1c5fe6d097dde3bb4ca36ecbff0";
const apiPrivateKey = "219b41d0053667342c94897c56048704ecc93e7e";

const Comic = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);

  const getSeries = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    setSeries(data.data.results[0]);
  };

  useEffect(() => {
    const timestamp = Date.now().toString();
    const hash = md5(timestamp + apiPrivateKey + apiPublicKey);

    const seriesUrl = `https://gateway.marvel.com/v1/public/series/${id}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
    getSeries(seriesUrl);
  }, [id]);

  const handleAddToList = () => {
    console.log("Adicionado à lista!");
  };

  const formatPublishDate = (dates) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    const onSaleDate = dates && dates.find((date) => date.type === "onsaleDate");
    return onSaleDate ? new Date(onSaleDate.date).toLocaleDateString(undefined, options) : "Not available";
  };
  

  return (
    <div className="comic-page">
      {series ? (
        <>
          <div className="comic-card">
            <SeriesCard serie={series} showLink={false} />
            <button className="addToListButton" onClick={handleAddToList}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Adicionar à Lista
            </button>
          </div>
          <div className="info">
            <p className="tagLine">{series.tagline}</p>
            <h3>
              <BsFillFileEarmarkTextFill /> Descrição:
            </h3>
            <p>{series.description || "Description not available"}</p>

            {/* Exibir outras informações relevantes da série */}
            <h3>
              <BsFillFileEarmarkTextFill /> Outra Informação:
            </h3>
            <p>{series.someProperty || "N/A"}</p>

            <h3>
              <BsFillFileEarmarkTextFill /> Data de Publicação:
            </h3>
            <p>{formatPublishDate(series.dates)}</p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Comic;
