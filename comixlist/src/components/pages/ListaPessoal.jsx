import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../contexts/auth";
import { firestore } from "../bd/FireBase";
import SeriesCardFirestore from "./SeriesCardFirestore";
import SeriesCardApi from "./SeriesCardApi"; // Importe o componente da API
import "./ComicsGrid.css";

const ListaPessoal = () => {
  const { user } = useContext(AuthContext);
  const [listaPessoal, setListaPessoal] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchListaPessoal = async () => {
      const listaPessoalRef = collection(firestore, "users", user.uid, "listaPessoal");
      const q = query(listaPessoalRef);
      
      try {
        const querySnapshot = await getDocs(q);
        const listaPessoalData = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const serieId = data.serieId;

          // Verifique se o ID é da API ou do Firestore
          if (isApiId(serieId)) {
            // Consulta para obter dados da série da API com base no ID
            // Certifique-se de ter os dados da série da API disponíveis no seu estado
            const apiSerieData = {}; // Substitua pelo objeto real da série da API
            listaPessoalData.push({ ...data, serieData: { api: apiSerieData } });
          } else {
            // Consulta para obter dados da série do Firestore com base no ID
            const serieRef = collection(firestore, "serie");
            const serieQuery = query(serieRef, where("id", "==", serieId));
            const serieSnapshot = await getDocs(serieQuery);

            if (!serieSnapshot.empty) {
              const serieData = serieSnapshot.docs[0].data();
              listaPessoalData.push({ ...data, serieData });
            }
          }
        }

        setListaPessoal(listaPessoalData);
      } catch (error) {
        console.error("Erro ao buscar lista pessoal:", error);
      }
    };

    fetchListaPessoal();
  }, [user]);

  return (
    <div className="container">
      <h2 className="title">Lista Pessoal:</h2>
      <div className="comics_container">
        {listaPessoal.map((item) => (
          <div key={item.id} className="series-card">
            {/* Verifique se a série vem da API ou do Firestore e renderize o componente apropriado */}
            {isApiId(item.serieData.id) ? (
              <SeriesCardApi serie={item.serieData.api} />
            ) : (
              <SeriesCardFirestore serie={item.serieData} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaPessoal;
