import React from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";

const SeriesCardApi = ({ serie, showLink = true }) => {

  const fetchSeriesFromFirestoreAsync = async (apiSerie) => {
    const serieId = apiSerie.id.toString();
  
    // Defina a referência à coleção no Firestore onde você armazena as séries
    const seriesCollectionRef = collection(firestore, "serie"); // Substitua "séries" pelo nome correto da sua coleção
  
    // Crie uma consulta para procurar uma série com o mesmo ID da série da API
    const q = query(seriesCollectionRef, where("id", "==", serieId));
  
    try {
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Se houver uma série correspondente no Firestore, obtenha a primeira série correspondente
        const firestoreSerie = querySnapshot.docs[0].data();
  
        // Verifique se o campo "notaMedia" existe na série do Firestore
        if (firestoreSerie.notaMedia !== undefined) {
          apiSerie.notaMedia = firestoreSerie.notaMedia;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar série no Firestore:", error);
    }
  
    setAllApiSeries((prevSeries) => [...prevSeries, apiSerie]);
    setDisplayedSeriesIds((prevIds) => [...prevIds, serieId]);
  };

  

  return (
    <div className="series-card">
      {serie.thumbnail && (
        <img
          src={`${serie.thumbnail.path}.${serie.thumbnail.extension}`}
          alt={serie.title}
        />
      )}
      <h2>{serie.title}</h2>
      {showLink && (
        <Link to={`/series/${serie.id}`} state={{ id: serie.id }}>
          Detalhes
        </Link>
      )}
      <div className="rating">
        <p>Nota média:</p>
        {serie.notaMedia !== undefined && serie.notaMedia !== 0.0
          ? serie.notaMedia.toFixed(1)
          : "N/A"}      </div>
    </div>
  );
};

export default SeriesCardApi;
