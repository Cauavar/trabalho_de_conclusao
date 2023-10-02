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
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";

const apiPublicKey = "1f9dc1c5fe6d097dde3bb4ca36ecbff0";
const apiPrivateKey = "219b41d0053667342c94897c56048704ecc93e7e";

const Comic = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [series, setSeries] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiComic, setApiComic] = useState(null);
    const [tituloSerie, setTituloSerie] = useState("");
    const [descricaoSerie, setDescricaoSerie] = useState("");
    const [autorSerie, setAutorSerie] = useState("");
    const [dataPublicacaoSerie, setDataPublicacaoSerie] = useState("");
    const [numeroVolumesSerie, setNumeroVolumesSerie] = useState("");
  
    const openModal = () => {
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
    };
  
    const getSeriesFromApi = async () => {
      if (!isNaN(parseInt(id))) {
        const timestamp = Date.now().toString();
        const hash = md5(timestamp + apiPrivateKey + apiPublicKey);
        const seriesUrl = `https://gateway.marvel.com/v1/public/series/${id}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
  
        try {
          const res = await fetch(seriesUrl);
          const data = await res.json();
          const apiSeries = data.data.results[0];
          setSeries(apiSeries);
  
          // Buscar detalhes específicos da série aqui
          const seriesDetailsUrl = `https://gateway.marvel.com/v1/public/comics/${id}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
          const detailsRes = await fetch(seriesDetailsUrl);
          const detailsData = await detailsRes.json();
          const comic = detailsData.data.results[0];
          setApiComic(apiSeries);
          
          // Agora você pode acessar as informações detalhadas da série no objeto "comic"
          console.log("Título da Série:", comic.title);
          console.log("Descrição/Sinopse:", comic.description);
          console.log("Autor:", comic.creators.items[0]?.name);
          console.log("Data de Publicação:", comic.dates.find(date => date.type === "onsaleDate")?.date);
          console.log("Número de Volumes:", comic.pageCount);

        setTituloSerie(comic.title);
        setDescricaoSerie(comic.description);
        setAutorSerie(comic.creators.items[0]?.name);
        setDataPublicacaoSerie(
          (comic.dates &&
            comic.dates.find((date) => date.type === "onsaleDate")?.date) ||
            "N/A"
        );
        setNumeroVolumesSerie(comic.pageCount);
      } catch (error) {
        console.error("Error fetching series from API:", error);
      }
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

  const isMarvelApiId = (id) => {
    return !isNaN(parseInt(id));
  };
  
  useEffect(() => {
    if (isMarvelApiId(id)) {
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
      <div className="conContainer">
          <button type="button" className="backButton" onClick={() => navigate('/')}>
          <FiArrowLeft className="backIcon "/> Voltar
          </button>
      </div>

      <div className="profile-header">
        <LinkButton to="/editSerie" text="Edit Series" />
      </div>

      {series ? (
        <>
          <div className="comic-card">
            {isMarvelApiId(id) ? (
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
              getSeries={series}
            />
          </div>

          <div className="info">
            <p className="tagLine">
              {isMarvelApiId(id)
                ? apiComic && apiComic.tagline
                : series && series.tagLine}
            </p>

            {/* Exibir outras informações relevantes da série */}
            {isMarvelApiId(id) ? (
              <>
                <h3>
                  <BsFillFileEarmarkTextFill /> Descrição:
                </h3>
                <p>{descricaoSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Autor:
                </h3>
                <p>{autorSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Data de Publicação:
                </h3>
                <p>{dataPublicacaoSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Número de Volumes:
                </h3>
                <p>{numeroVolumesSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Nota Média:
                </h3>
                <p>{series.notaMedia || "N/A"}</p>
              </>
            ) : (
              // Detalhes do banco de dados, se não for uma série da API
              <>
                <h3>
                  <BsFillFileEarmarkTextFill /> Descrição:
                </h3>
                <p>{series && series.descricaoSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Autor:
                </h3>
                <p>{series && series.autorSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Data de Publicação:
                </h3>
                <p>{series && series.publiSerie || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Número de Volumes:
                </h3>
                <p>{series && series.volumes || "N/A"}</p>
                <h3>
                  <BsFillFileEarmarkTextFill /> Nota Média:
                </h3>
                <p>{series.notaMedia || "N/A"}</p>
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
