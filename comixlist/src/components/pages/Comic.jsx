import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BsFillFileEarmarkTextFill } from "react-icons/bs";
import "./Comic.css";
import md5 from "md5";
import SeriesCardApi from "./SeriesCardApi";
import SeriesCardFirestore from "./SeriesCardFirestore";
import { getDoc, doc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { firestore } from "../bd/FireBase";
import AddListaPessoalModal from "../modals/AddListaPessoalModal";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth";
import { useContext } from "react";
import { Link } from "react-router-dom";

const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';

const Comic = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersWithSeries, setUsersWithSeries] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const isMarvelApiId = (id) => {
    return !isNaN(parseInt(id));
  };

  const checkSeriesInFirestore = async (serieId, seriesData) => {
    if (!isMarvelApiId(serieId)) {
      return;
    }

    const seriesCollectionRef = collection(firestore, "serie");
    const q = query(seriesCollectionRef, where("id", "==", serieId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size === 0) {
      addSeriesToFirestore(serieId, seriesData);
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
        publiSerie: (seriesData.dates &&
          seriesData.dates.find((date) => date.type === "onsaleDate")?.date) || "N/A",
        numeroVolumesSerie: seriesData.pageCount || "N/A",
        notaMedia: 0,
      });
      console.log("Série adicionada ao Firestore com sucesso:", seriesData.title);
    } catch (error) {
      console.error("Erro ao adicionar a série ao Firestore", error);
    }
  };

  const fetchData = async () => {
    if (isMarvelApiId(id)) {
      // Fetch series from Marvel API
      const timestamp = Date.now().toString();
      const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);
      const seriesUrl = `https://gateway.marvel.com/v1/public/series/${id}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;

      try {
        const res = await fetch(seriesUrl);
        const data = await res.json();
        const seriesData = data.data.results[0];
        setSeries(seriesData);
        checkSeriesInFirestore(id, seriesData);
      } catch (error) {
        console.error("Error fetching comic series from API:", error);
      }
    } else {
      // Fetch series from Firestore
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
    }
  };

  useEffect(() => {
    fetchData();
    getUsersWithSeries();
  }, [id]);

  const getUsersWithSeries = async () => {
    try {
      const listaPessoalRef = collection(firestore, "listaPessoal");
      const q = query(listaPessoalRef, where("serieId", "==", id));
      const querySnapshot = await getDocs(q);

      const numUsers = querySnapshot.size;

      setUsersWithSeries(numUsers);
    } catch (error) {
      console.error('Erro ao obter o número de usuários com esta série na lista pessoal:', error);
    }
  };

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
        {isAuthenticated ? (
          <Link to={`/editSerie/${id}`}>Editar Série</Link>
        ) : null}
      </div>

      {series ? (
        <>
          <div className="comic-card">
            {isMarvelApiId(id) ? (
              <SeriesCardApi serie={series} showLink={false} />
            ) : (
              <SeriesCardFirestore serie={series} showLink={false} />
            )}
            <button
              className="addToListButton"
              onClick={openModal}
              disabled={!isAuthenticated}
            >
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
                  <p>{series.notaMedia  || "N/A"}</p>
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
                  <p>{series && series.volumes || "N/A"}</p>
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
