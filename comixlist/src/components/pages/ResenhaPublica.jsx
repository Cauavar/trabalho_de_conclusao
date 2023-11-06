import React, { useState, useEffect } from "react";
import { doc, getDoc, collection } from "firebase/firestore";
import { firestore } from "../bd/FireBase";
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from "react-icons/fi";
import "./Resenha.css";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import md5 from "md5";

const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';

const ResenhaPublica = () => {
  const navigate = useNavigate();
  const { userId, serieId } = useParams();
  const [serie, setSerie] = useState(null);
  const [autor, setAutor] = useState(null);

  const fetchMarvelSerieData = async (serieId) => {
    const timestamp = Date.now().toString();
    const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);
    const seriesUrl = `https://gateway.marvel.com/v1/public/series/${serieId}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
    try {
      const response = await axios.get(seriesUrl);
      const apiData = response.data.data.results[0];
      setSerie(apiData);
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
    }
  };

  const isMarvelApiId = (id) => {
    return !isNaN(parseInt(id));
  };

  useEffect(() => {
    const fetchResenhaData = async () => {
      try {
        const userDocRef = doc(firestore, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setAutor(userData);
          if (userData.listaPessoal) {
            const serieEntry = userData.listaPessoal.find(entry => entry.serieId === serieId);
            if (serieEntry) {
              if (isMarvelApiId(serieId)) {
                fetchMarvelSerieData(serieId);
              } else {
                const serieDocRef = doc(firestore, "serie", serieId);
                const serieDocSnapshot = await getDoc(serieDocRef);

                if (serieDocSnapshot.exists()) {
                  const serieData = serieDocSnapshot.data();
                  const tempSerie = {
                    ...serieData,
                    nota: serieEntry.nota,
                    review: serieEntry.review,
                  };
                  setSerie(tempSerie);
                }
              }
            }
          }
        } else {
          console.log("Dados do autor não encontrados.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados da série e do autor no Firestore:", error);
      }
    };

    fetchResenhaData();
  }, [userId, serieId]);

  const defaultAvatar =
    "https://www.promoview.com.br/uploads/images/unnamed%2819%29.png";

  return (
    <div className="resenha-container">
      <button onClick={() => navigate(`/listaPessoal/${userId}`)} className="back-button">
        <FiArrowLeft className="back-icon" /> Voltar
      </button>

      {serie && autor ? (
        <>
          {isMarvelApiId(serieId) && serie.thumbnail ? (
            <>
              <img
                src={`${serie.thumbnail.path}.${serie.thumbnail.extension}`}
                alt={serie.title}
                className="resenha-image"
              />
              <h1 className="resenha-title">
                {serie.title} ({serie.dates && serie.dates[0] ? serie.dates[0].date.slice(0, 4) : 'N/A'})
              </h1>
              <p className="resenha-author">
                <Link to={`/profile/${userId}`}>
                  <img
                    src={autor.imagemUsuario || defaultAvatar}
                    alt="Imagem de perfil"
                    className="author-image"
                  />
                </Link>
                Resenha por:{" "}
                <span className="resenha-reviewer">
                  {autor.nome || "N/A"}
                </span>
              </p>
              <p className="resenha-rating">Nota: {serie.nota || "N/A"}</p>
              <p className="resenha-review">Resenha: {serie.review || "N/A"}</p>
            </>
          ) : (
            <>
              <img
                src={serie.imagemSerie}
                alt={serie.nomeSerie}
                className="resenha-image"
              />
              <h1 className="resenha-title">
                {serie.nomeSerie} ({serie.publiSerie || 'N/A'})
              </h1>
              <p className="resenha-author">
                <Link to={`/profile/${userId}`}>
                  <img
                    src={autor.imagemUsuario || defaultAvatar}
                    alt="Imagem de perfil"
                    className="author-image"
                  />
                </Link>
                Resenha por:{" "}
                <span className="resenha-reviewer">
                  {autor.nome || "N/A"}
                </span>
              </p>
              <p className="resenha-rating">Nota: {serie.nota || "N/A"}</p>
              <h2>Resenha:</h2>
              <p className="resenha-review">{serie.review || "N/A"}</p>
            </>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}

      <div className="barra-preta"></div>
    </div>
  );
};

export default ResenhaPublica;
