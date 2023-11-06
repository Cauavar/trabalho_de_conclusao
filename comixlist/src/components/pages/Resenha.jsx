import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../bd/FireBase";
import { AuthContext } from "../contexts/auth";
import { doc, getDoc, collection } from "firebase/firestore";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Resenha.css";
import { useNavigate } from "react-router-dom";
import md5 from "md5";

const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';
const isMarvelApiId = (id) => {
  return !isNaN(parseInt(id));
};
const Resenha = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        setUserData(userDocSnapshot.data());
      }
    };

    const fetchSerieData = async () => {
      if (!userData) return;

      const matchingSerie = userData.listaPessoal.find(
        (item) => item.serieId === id
      );

      if (matchingSerie) {
        if (isMarvelApiId(matchingSerie.serieId)) {
          const timestamp = Date.now().toString();
          const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);
          const seriesUrl = `https://gateway.marvel.com/v1/public/series/${matchingSerie.serieId}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
          try {
            const response = await axios.get(seriesUrl);
            const apiData = response.data.data.results[0];
            setSerie({
              ...apiData,
              nota: matchingSerie.nota,
              review: matchingSerie.review,
              dataResenha: matchingSerie.dataResenha,
            });
          } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
          }
        } else {
          const seriesCollectionRef = collection(firestore, "serie");
          const serieDocRef = doc(seriesCollectionRef, matchingSerie.serieId);
          const serieDocSnapshot = await getDoc(serieDocRef);

          if (serieDocSnapshot.exists()) {
            setSerie({
              ...serieDocSnapshot.data(),
              nota: matchingSerie.nota,
              review: matchingSerie.review,
              dataResenha: matchingSerie.dataResenha,
            });
          }
        }
      }
    };

    fetchUserData();
    fetchSerieData();
  }, [id, user, userData]);

  const defaultAvatar =
    "https://www.promoview.com.br/uploads/images/unnamed%2819%29.png";

  return (
    <div className="resenha-container">
      <Link to="/listaPessoal" className="back-button">
        <FiArrowLeft className="back-icon" /> Voltar
      </Link>
<br></br>
      {serie ? (
  <>
    {isMarvelApiId(id) && serie.thumbnail ? (
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
          <Link to={`/profile/${user.uid}`}>
            <img
              src={userData?.imagemUsuario || defaultAvatar}
              alt="Imagem de perfil"
              className="author-image"
            />
          </Link>
          Resenha por:{" "}
          <span className="resenha-reviewer">
            {userData ? userData.nome : "N/A"}
          </span>
        </p>
        <p className="resenha-rating">Nota: {serie.nota}</p>
        <p className="resenha-review">Resenha: {serie.review}</p>
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
          <Link to={`/profile/${user.uid}`}>
            <img
              src={userData?.imagemUsuario || defaultAvatar}
              alt="Imagem de perfil"
              className="author-image"
            />
          </Link>
          Resenha por:{" "}
          <span className="resenha-reviewer">
            {userData ? userData.nome : "N/A"}
          </span>
        </p>
        <p className="resenha-rating">Nota: {serie.nota}</p>
        <h2>Resenha:</h2>
        <p className="resenha-review">{serie.review}</p>
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

export default Resenha;