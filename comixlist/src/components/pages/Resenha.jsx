import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { firestore } from "../bd/FireBase";
import { AuthContext } from "../contexts/auth";
import { doc, getDoc, collection } from "firebase/firestore";
import LinkButton from "../layout/LinkButton";
import { FiArrowLeft } from "react-icons/fi";
import "./Comic.css";
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
            dataResenha: matchingSerie.dataResenha, // Certifique-se de ter essa informação em sua estrutura de dados
          });
        }
      }
    };

    fetchUserData();
    fetchSerieData();
  }, [id, user, userData]);

  return (
    <div className="comic-page">
      <div className="conContainer">
        <button
          type="button"
          className="backButton"
          onClick={() => navigate("/listaPessoal")}
        >
          <FiArrowLeft className="backIcon " /> Voltar
        </button>
      </div>

      {serie ? (
        <>
          <div className="comic-card">
            <img
              src={serie.imagemSerie}
              alt={serie.nomeSerie}
              className="serieImage"
            />
            <h1>
              {serie.nomeSerie} ({serie.ano})
            </h1>
            <p>Resenha feita por: {userData ? userData.nome : "N/A"}</p>
            <p>Nota: {serie.nota}</p>
            <p>Data da Resenha: {serie.dataResenha}</p>
            <p>Data da Edição: {serie.dataUltimaAtualizacao}</p>
            <p>Resenha: {serie.review}</p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Resenha;
