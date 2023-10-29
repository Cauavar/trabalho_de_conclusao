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

const ResenhaPublica = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchSerieData = async () => {
      const seriesCollectionRef = collection(firestore, "serie");
      const serieDocRef = doc(seriesCollectionRef, id);
      const serieDocSnapshot = await getDoc(serieDocRef);

      if (serieDocSnapshot.exists()) {
        setSerie({
          ...serieDocSnapshot.data(),
        });
      }
    };

    // Obter informações do perfil com base no ID
    const fetchUserData = async () => {
      try {
        // Substitua 'sua-rota-de-obter-usuario' pela rota correta em sua API
        const response = await axios.get(`/sua-rota-de-obter-usuario/${id}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Erro ao obter informações do perfil:", error);
      }
    };

    fetchSerieData();
    fetchUserData();
  }, [id]);

  const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png';

  return (
    <div className="resenha-container">
      <Link to="/listaPessoal" className="back-button">
        <FiArrowLeft className="back-icon" /> Voltar
      </Link>

      {serie && userData ? (
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
            <Link to={`/profile/${userData.id}`}>
              <img
                src={userData.imagem || defaultAvatar}
                alt="Imagem de perfil"
                className="author-image"
              />
            </Link>
            Resenha por:{" "}
            <span className="resenha-reviewer">
              {userData.nome || "N/A"}
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

export default ResenhaPublica;
