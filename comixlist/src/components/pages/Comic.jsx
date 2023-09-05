import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BsFillFileEarmarkTextFill } from "react-icons/bs";
import "./Comic.css";
import md5 from "md5";
import SeriesCardApi from "./SeriesCardApi";
import SeriesCardFirestore from "./SeriesCardFirestore";
import { getDoc, doc, collection } from 'firebase/firestore';
import { firestore } from "../bd/FireBase";
import AddListaPessoalModal from "../modals/AddListaPessoalModal";
import LinkButton from '../layout/LinkButton';

const apiPublicKey = "1f9dc1c5fe6d097dde3bb4ca36ecbff0";
const apiPrivateKey = "219b41d0053667342c94897c56048704ecc93e7e";

const Comic = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getSeriesFromApi = async () => {
    const timestamp = Date.now().toString();
    const hash = md5(timestamp + apiPrivateKey + apiPublicKey);
    const seriesUrl = `https://gateway.marvel.com/v1/public/series/${id.substr(3)}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;

    try {
      const res = await fetch(seriesUrl);
      const data = await res.json();
      const apiSeries = data.data.results[0];
      apiSeries.origin = 'API'; 
      setSeries(apiSeries);
    } catch (error) {
      console.error("Error fetching series from API:", error);
    }
  };

  const getSeriesFromFirestore = async () => {
    try {
      const docRef = doc(collection(firestore, "serie"), id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSeries(docSnap.data());
      } else {
        console.log('No data returned!');
      }
    } catch (error) {
      console.error('Error fetching series from Firestore:', error);
    }
  };

  useEffect(() => {
    if (id.startsWith('API')) {
      getSeriesFromApi();
    } else {
      getSeriesFromFirestore();
    }
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
      <div className="profile-header">
        <LinkButton to="/editSerie" text="Edit Series" />
      </div>
      {series ? (
        <>
          <div className="comic-card">
            {series.thumbnail ? (
              <SeriesCardApi serie={series} showLink={false} />
            ) : (
              <SeriesCardFirestore serie={series} showLink={false} />
            )}
            <button className="addToListButton" onClick={openModal}>
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
            <AddListaPessoalModal
              isOpen={isModalOpen}
              onClose={closeModal}
              onAddToList={handleAddToList}
              serieId={id}
              getSeries={() => series} 
            />
          </div>

          <div className="info">
            <p className="tagLine">{series.tagline}</p>
            <h3>
              <BsFillFileEarmarkTextFill /> Descrição:
            </h3>
            <p>{id.startsWith('API') ? series.description : series.descriçãoSerie || "Description not available"}</p>
  
            {/* Exibir outras informações relevantes da série */}
            {series.origin === 'API' ? (
              <>
                <h3>
                  <BsFillFileEarmarkTextFill /> Autor:
                </h3>
                <p>{series.someProperty || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Data de Publicação:
                </h3>
                <p>{formatPublishDate(series.dates)}</p>
              </>
            ) : (
              <>
                {/* Detalhes do banco de dados */}
                <h3>
                  <BsFillFileEarmarkTextFill /> Autor:
                </h3>
                <p>{series.autorSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Data de Publicação:
                </h3>
                <p>{series.publiSerie}</p>
                                <h3>
                  <BsFillFileEarmarkTextFill /> Data de Publicação:
                </h3>
                <p>{series.publiSerie}</p>
              </>
            )}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
  
  
};

export default Comic;