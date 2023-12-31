import React, { useState, useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore'; 
import SeriesCardApi from "./SeriesCardApi"; 
import SeriesCardFirestore from "./SeriesCardFirestore"; 
import { firestore } from "../bd/FireBase";

const SerieList = () => {
  const [series, setSeries] = useState([]);

  const fetchSeriesFromFirestore = async () => {
    try {
      const seriesCollectionRef = collection(firestore, "serie");
      const querySnapshot = await getDocs(seriesCollectionRef);
      const seriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id, 
        ...doc.data(),
      }));
      setSeries(seriesData);
    } catch (error) {
      console.error("Erro ao buscar séries do Firestore:", error);
    }
  };

  useEffect(() => {
    fetchSeriesFromFirestore();
  }, []);

  return (
    <div className="serie-list">
      {series.map((serie) => (
        serie.thumbnail ? (
          <SeriesCardApi key={serie.id} serie={serie} />
        ) : (
          <SeriesCardFirestore key={serie.id} serie={serie} />
        )
      ))}
    </div>
  );
};

export default SerieList;
