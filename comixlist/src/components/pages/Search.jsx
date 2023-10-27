import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SeriesCardApi from './SeriesCardApi';
import SeriesCardFirestore from './SeriesCardFirestore';
import md5 from 'md5';
import './ComicsGrid.css';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../bd/FireBase';
import Fuse from 'fuse.js';


const seriesURL = 'https://gateway.marvel.com/v1/public/series';
const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';

const Search = () => {
  const { searchTerm } = useParams();
  const [series, setSeries] = useState([]);

  const getSeriesBySearchTerm = async (searchTerm) => {
    const timestamp = new Date().getTime();
    const hash = md5(timestamp + apiPrivateKey + apiPublicKey);

    try {
      const response = await axios.get(seriesURL, {
        params: {
          titleStartsWith: searchTerm, 
          apikey: apiPublicKey,
          ts: timestamp,
          hash: hash,
        },
      });

      const apiResults = response.data.data.results;
      return apiResults;
    } catch (error) {
      console.error('Error fetching series from API:', error);
      return [];
    }
  };

  const getSeriesFromFirestore = async (searchTerm) => {
    try {
      const seriesCollectionRef = collection(firestore, 'serie');
      const queryRef = query(seriesCollectionRef, where('Aprovada', '==', true));
      const querySnapshot = await getDocs(query(queryRef));
      const firestoreResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  

      const fuse = new Fuse(firestoreResults, {
        keys: ['nomeSerie'], 
        includeScore: true, 
        threshold: 0.4, 
      });
  
      const searchResults = fuse.search(searchTerm);
  
      const results = searchResults.map((result) => result.item);
  
      return results;
    } catch (error) {
      console.error('Error fetching series from Firestore:', error);
      return [];
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const fetchSearchResults = async () => {
        const apiResults = await getSeriesBySearchTerm(searchTerm);
        const firestoreResults = await getSeriesFromFirestore(searchTerm);
        
        const uniqueFirestoreResults = firestoreResults.filter(
          (serie) => !apiResults.some((apiSerie) => apiSerie.id === serie.id)
        );
  
        const combinedResults = [...apiResults, ...uniqueFirestoreResults];
        setSeries(combinedResults);
      };
  
      fetchSearchResults();
    } else {
      setSeries([]);
    }
  }, [searchTerm]);
  
  
  return (
    <div className="container">
      <h2 className="title">Pesquisar Séries de Quadrinhos</h2>
      <div className="comics_container">
        {series.length === 0 ? (
          <p>Nenhum resultado encontrado.</p>
        ) : (
          series.map((serie) =>
            serie.thumbnail ? (
              <SeriesCardApi key={serie.id} serie={serie} />
            ) : (
              <SeriesCardFirestore key={serie.id} serie={serie} />
            )
          )
        )}
      </div>
    </div>
  );
};

export default Search;
