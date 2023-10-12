import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BsFillFileEarmarkTextFill } from "react-icons/bs";
import "./Comic.css";
import md5 from "md5";
import SeriesCardApi from "./SeriesCardApi";
import SeriesCardFirestore from "./SeriesCardFirestore";
import { getDoc, doc, collection, getDocs, query, where, addDoc } from "firebase/firestore"; // Importe a função getDocs aqui
import { firestore } from "../bd/FireBase";
import AddListaPessoalModal from "../modals/AddListaPessoalModal";
import LinkButton from "../layout/LinkButton";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const apiPublicKey = "1f9dc1c5fe6d097dde3bb4ca36ecbff0";
const apiPrivateKey = "219b41d0053667342c94897c56048704ecc93e7e";


const Comic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tituloSerie, setTituloSerie] = useState(""); // Adicionado
  const [descricaoSerie, setDescricaoSerie] = useState(""); // Adicionado
  const [autorSerie, setAutorSerie] = useState(""); // Adicionado
  const [dataPublicacaoSerie, setDataPublicacaoSerie] = useState(""); // Adicionado
  const [numeroVolumesSerie, setNumeroVolumesSerie] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getSeriesFromApi = async (id, setSeries) => {
    if (!isNaN(parseInt(id)) && setSeries) {
      const timestamp = Date.now().toString();
      const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);
      const seriesUrl = `https://gateway.marvel.com/v1/public/series/${id}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
  
      try {
        const res = await fetch(seriesUrl);
        const data = await res.json();
        const seriesData = data.data.results[0];
  
        setSeries(seriesData);
        setTituloSerie(seriesData.title); // Atualizando o título da série
        setDescricaoSerie(seriesData.description); // Atualizando a descrição
        setAutorSerie(seriesData.creators.items[0]?.name); // Atualizando o autor
        const onSaleDate = (seriesData.dates || []).find((date) => date.type === "onsaleDate");
        setDataPublicacaoSerie(onSaleDate ? onSaleDate.date : "N/A"); // Atualizando a data de publicação
        setNumeroVolumesSerie(seriesData.totalIssues); // Atualizando o número de volumes
  
        // Verifique se a série existe no Firestore
        checkSeriesInFirestore(id, seriesData);
      } catch (error) {
        console.error("Error fetching comic series from API:", error);
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
        console.log("No data returned!");
      }
    } catch (error) {
      console.error("Error fetching series from Firestore:", error);
    }
  };

  const isMarvelApiId = (id) => {
    return !isNaN(parseInt(id));
  };

  const checkSeriesInFirestore = async (serieId, series) => {
    const seriesCollectionRef = collection(firestore, "serie");
    const q = query(seriesCollectionRef, where("id", "==", serieId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size === 0) {
      // A série não existe no Firestore, então a adicionaremos
      addSeriesToFirestore(serieId, series);
    }
  };

  const addSeriesToFirestore = async (serieId, seriesData) => {
    try {
      const seriesCollectionRef = collection(firestore, "serie");
      await addDoc(seriesCollectionRef, {
        id: `${serieId}`,
        Aprovada: true,
        nomeSerie: seriesData.title,
        descricaoSerie: seriesData.description || "N/A",
        imagemSerie: seriesData.thumbnail.path + "." + seriesData.thumbnail.extension,
        autorSerie: seriesData.creators.items[0]?.name || "N/A",
        publiSerie:
          (seriesData.dates &&
            seriesData.dates.find((date) => date.type === "onsaleDate")?.date) || "N/A",
        numeroVolumesSerie: seriesData.pageCount || "N/A",
        notaMedia: 0,
      });
      console.log("Série adicionada ao Firestore com sucesso:", seriesData.title);
    } catch (error) {
      console.error("Erro ao adicionar a série ao Firestore", error);
    }
  };

  useEffect(() => {
    if (isMarvelApiId(id)) {
      getSeriesFromApi(id, setSeries);
    } else {
      getSeriesFromFirestore();
    }
  }, [id]);

  

  const handleAddToList = () => {
    console.log("Adicionado à lista!");
  };


  return (
    <div className="comic-page">
      <div className="conContainer">
        <button type="button" className="backButton" onClick={() => navigate('/')}>
          <FiArrowLeft className="backIcon" /> Voltar
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
              {isMarvelApiId(id) ? (
                <>
                  <h3>
                    <BsFillFileEarmarkTextFill /> Descrição:
                  </h3>
                  <p>{series.description || "N/A"}</p>
                  <h3>
                    <BsFillFileEarmarkTextFill /> Autor:
                  </h3>
                  <p>{series.creators.items[0]?.name || "N/A"}</p>
                  <h3>
                    <BsFillFileEarmarkTextFill /> Data de Publicação:
                  </h3>
                  <p>
                    {series.dates &&
                      series.dates.find((date) => date.type === "onsaleDate")?.date ||
                      "N/A"}
                  </p>
                  <h3>
                    <BsFillFileEarmarkTextFill /> Número de Volumes:
                  </h3>
                  <p>{series.pageCount || "N/A"}</p>
                  <h3>
                    <BsFillFileEarmarkTextFill /> Nota Média:
                  </h3>
                  <p>{series.notaMedia || "N/A"}</p>
                </>
              ) : (
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
                  <p>{series && series.numeroVolumesSerie || "N/A"}</p>
                  <h3>
                    <BsFillFileEarmarkTextFill /> Nota Média:
                  </h3>
                  <p>{series.notaMedia || "N/A"}</p>
                </>
              )}
            </p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
      };

export default Comic;