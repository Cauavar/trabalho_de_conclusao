import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../bd/FireBase";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from "react-icons/fi";

const ResenhaPublica = () => {
  const { id } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate(); 
  const userId = location.state.id; 

  const [serie, setSerie] = useState(null);
  const [autor, setAutor] = useState(null);

  useEffect(() => {
    const fetchResenhaData = async () => {
      try {
        const seriesCollectionRef = collection(firestore, "serie");
        const serieDocRef = doc(seriesCollectionRef, id);
        const serieDocSnapshot = await getDoc(serieDocRef);

        if (serieDocSnapshot.exists()) {
          const serieData = serieDocSnapshot.data();

         
          if (serieData && serieData.userId) {
            const usersCollectionRef = collection(firestore, "users");
            const q = query(usersCollectionRef, where("userId", "==", serieData.userId));
            const usersQuerySnapshot = await getDocs(q);

          
            if (!usersQuerySnapshot.empty) {
              const userData = usersQuerySnapshot.docs[0].data(); 
              setAutor(userData);
            } else {
              console.log("Dados do autor não encontrados.");
            }
          }

          setSerie(serieData);
        } else {
          console.log("Dados da série não encontrados.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados da série no Firestore:", error);
      }
    };

    fetchResenhaData();
  }, [id]);

  return (
    <div className="resenha-container">
      <button onClick={() => navigate(`/listaPessoal/${userId}`)} className="back-button">
        <FiArrowLeft className="back-icon" /> Voltar
      </button>

      {serie && autor ? (
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
            Resenha por:{" "}
            <span className="resenha-reviewer">{autor.nome || "N/A"}</span>
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
