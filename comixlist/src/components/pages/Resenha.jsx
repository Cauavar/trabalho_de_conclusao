import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../bd/FireBase";
import { AuthContext } from "../contexts/auth";
import { doc, getDoc, collection } from "firebase/firestore";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Resenha.css";
import { useNavigate } from "react-router-dom";

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
    };

    fetchUserData();
    fetchSerieData();
  }, [id, user, userData]);

  return (
    <div className="resenha-container">
      <Link to="/listaPessoal" className="back-button">
        <FiArrowLeft className="back-icon" /> Voltar
      </Link>

      {serie ? (
        <>
          <img
            src={serie.imagemSerie}
            alt={serie.nomeSerie}
            className="resenha-image"
          />
          <h1 className="resenha-title">
            {serie.nomeSerie} ({serie.ano})
          </h1>
          <p className="resenha-author">
            <img
              src={userData?.imagemUsuario || "URL_PADRAO_DA_IMAGEM"} // Substitua pela URL padrão da imagem de perfil
              alt="Imagem de perfil"
              className="author-image"
            />
            Resenha por:{" "}
            <span className="resenha-reviewer">
              {userData ? userData.nome : "N/A"}
            </span>
          </p>
          <p className="resenha-rating">Nota: {serie.nota}</p>
          <p>Data da Resenha: {serie.dataResenha}</p>
          <p>Data da Edição: {serie.dataUltimaAtualizacao}</p>
          <p className="resenha-review">{serie.review}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}

      <div className="barra-preta"></div>
    </div>
  );
};

export default Resenha;
