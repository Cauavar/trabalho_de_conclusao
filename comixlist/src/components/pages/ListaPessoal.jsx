import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";
import { AuthContext } from "../contexts/auth";
import { firestore } from "../bd/FireBase";
import SeriesCardFirestore from "./SeriesCardFirestore";
import "./ComicsGrid.css";

const ListaPessoal = () => {
  const { user } = useContext(AuthContext);
  const [listaPessoal, setListaPessoal] = useState([]);
  const [allSeriesData, setAllSeriesData] = useState([]);

  useEffect(() => {
    // Passo 1: Obter os IDs das séries
    const fetchAllSeriesDataFromFirestore = async () => {
      try {
        const seriesCollectionRef = collection(firestore, "serie");
        const querySnapshot = await getDocs(seriesCollectionRef);
        const seriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllSeriesData(seriesData);
      } catch (error) {
        console.error("Error fetching series data from Firestore:", error);
      }
    };

    fetchAllSeriesDataFromFirestore();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Passo 2: Obter os IDs da lista pessoal do usuário
    const fetchListaPessoal = async () => {
      const listaPessoalRef = collection(firestore, "users", user.uid, "listaPessoal");
      const q = query(listaPessoalRef);

      try {
        const querySnapshot = await getDocs(q);
        const listaPessoalIds = querySnapshot.docs.map((doc) => doc.data().serieId);

        // Passo 3: Encontrar séries correspondentes aos IDs da lista pessoal
        const seriesNaLista = allSeriesData.filter((serie) =>
          listaPessoalIds.includes(serie.id)
        );

        setListaPessoal(seriesNaLista);
      } catch (error) {
        console.error("Erro ao buscar lista pessoal:", error);
      }
    };

    fetchListaPessoal();
  }, [user, allSeriesData]);

  useEffect(() => {
    console.log("Lista Pessoal Atualizada:", listaPessoal);
  }, [listaPessoal]);

  console.log("Renderização de ListaPessoal");

  return (
    <div className="container">
      <h2 className="title">Lista Pessoal:</h2>
      <div className="comics_container">
        {listaPessoal.map((item) => (
          <SeriesCardFirestore key={item.id} serie={item} />
        ))}
      </div>
    </div>
  );
};

export default ListaPessoal;
