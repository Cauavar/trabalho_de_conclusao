import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../bd/FireBase";
import { AuthContext } from "../contexts/auth";
import { doc, getDoc, collection, query, where, getDocs  } from "firebase/firestore";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Resenha.css";
import { useNavigate } from "react-router-dom";
import md5 from "md5";


const Resenha = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [userData, setUserData] = useState(null);
  const [resenhas, setResenhas] = useState([]);

  const isMarvelApiId = (id) => {
    return !isNaN(parseInt(id));
  };

  useEffect(() => {
    if (!user) return;
  
    const fetchData = async () => {
      if (isMarvelApiId(id)) {
        const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
        const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';
  
        const timestamp = Date.now().toString();
        const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);
        const seriesUrl = `https://gateway.marvel.com/v1/public/series/${id}?apikey=${apiPublicKey}&ts=${timestamp}&hash=${hash}`;
  
        try {
          const response = await axios.get(seriesUrl);
          const seriesData = response.data.data.results[0];
          console.log("Série da API Marvel:", seriesData);
          setSerie(seriesData);
        } catch (error) {
          console.error("Erro ao buscar detalhes da série da API Marvel:", error);
          setSerie(null); 
        }
        const resenhasQuery = query(collection(firestore, "listaPessoal"), where("serieId", "==", id));
        console.log("Resenhas Query:", resenhasQuery);

        const resenhasSnapshot = await getDocs(resenhasQuery);
        console.log("Resenhas Snapshot:", resenhasSnapshot);
        const resenhasData = [];
  
        resenhasSnapshot.forEach((doc) => {
          console.log("Resenha Data:", doc.data());
          resenhasData.push(doc.data());
        });
        console.log("Resenhas Data:", resenhasData);
        setResenhas(resenhasData);
      } else {
        const fetchUserData = async () => {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
  
          if (userDocSnapshot.exists()) {
            setUserData(userDocSnapshot.data());
          }
        };
  
        const fetchSerieData = async () => {
          if (!userData) return;
  
          const matchingSerie = userData?.listaPessoal.find(item => item.serieId === id);
  
          if (matchingSerie) {
            const { nota, review, imagemSerie, nomeSerie } = matchingSerie;
            console.log('Nota da resenha:', nota);
            console.log('Review da resenha:', review);
            console.log('Imagem da série:', imagemSerie);
            console.log('Nome da série:', nomeSerie);
            if (matchingSerie.isApiData) {
              try {
                const response = await axios.get(matchingSerie.urlDaApi);
                const apiData = response.data;
                console.log("Dados da API do usuário:", apiData);
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
      }
    };
  
    fetchData();
  }, [id, user, userData]);

  const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png';

  return (
    <div className="resenha-container">
      <Link to="/listaPessoal" className="back-button">
        <FiArrowLeft className="back-icon" /> Voltar
      </Link>

      {serie ? (
        <>
          <img
            src={isMarvelApiId(id) ? (serie.thumbnail.path + "." + serie.thumbnail.extension) : serie.imagemSerie}
            alt={isMarvelApiId(id) ? serie.title : serie.nomeSerie}
            className="resenha-image"
          />
          <h1 className="resenha-title">{isMarvelApiId(id) ? serie.title : `${serie.nomeSerie} (${serie.ano})`}</h1>
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
          <p className="resenha-rating">Nota: {serie.nota || "N/A"}</p>
          {isMarvelApiId(id) ? (
            <p>Data da Edição: {serie.dataUltimaAtualizacao || "N/A"}</p>
          ) : null}
          <p className="resenha-review"> Resenha: {serie.review || "N/A"}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
      

      <div className="barra-preta"></div>
    </div>
  );
};

export default Resenha;
