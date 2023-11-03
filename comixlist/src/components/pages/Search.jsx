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
import UserCard from './UserCard';

const seriesURL = 'https://gateway.marvel.com/v1/public/series';
const apiPublicKey = '82e3617a5bd9bb2f84486128360cd96a';
const apiPrivateKey = '6e79be75b2993ae4f1eaaf7bdf75531a77a3f0f8';

const Search = () => {
  const { searchTerm } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [myUsers, setMyUsers] = useState([]);

  const getSeriesBySearchTerm = async (searchTerm) => {
    const timestamp = new Date().getTime();
    const hash = md5(`${timestamp}${apiPrivateKey}${apiPublicKey}`);

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
        keys: ['nomeSerie', 'title'],
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

  const getUsersFromFirestore = async (searchTerm) => {
    try {
      const usersCollectionRef = collection(firestore, 'users');
      const querySnapshot = await getDocs(usersCollectionRef);
      const firestoreResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      const fuse = new Fuse(firestoreResults, {
        keys: ['nome'],
        includeScore: true,
        threshold: 0.4, 
      });
  
      const searchResults = fuse.search(searchTerm);
  
      const results = searchResults.map((result) => result.item);
  
      return results;
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      return [];
    }
  };

  const fetchMyUsersFromFirestore = async () => {
    try {
      const usersCollectionRef = collection(firestore, 'users');
      const querySnapshot = await getDocs(query(usersCollectionRef));
      const firestoreResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyUsers(firestoreResults);
    } catch (error) {
      console.error('Error listing users:', error);
    }
  };

  useEffect(() => {
    fetchMyUsersFromFirestore();
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) {
      const fetchSearchResults = async () => {
        let apiResults = await getSeriesBySearchTerm(searchTerm);
        let firestoreResults = await getSeriesFromFirestore(searchTerm);
        let usersResults = await getUsersFromFirestore(searchTerm);

        const combinedResults = [];
        const uniqueNames = new Set();

        firestoreResults.forEach((result) => {
          combinedResults.push(result);
          uniqueNames.add(result.nomeSerie);
        });

        apiResults.forEach((result) => {
          if (!uniqueNames.has(result.title)) {
            combinedResults.push(result);
            uniqueNames.add(result.title);
          }
        });

        usersResults.forEach((result) => {
          if (!uniqueNames.has(result.nome)) {
            combinedResults.push(result);
            uniqueNames.add(result.nome);
          }
        });

        setSearchResults(combinedResults);
        setIsLoading(false);
      };

      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  return (
    <div className="container">
      <h2 className="title">Resultados encontrados para: "{searchTerm}"</h2>
      <div className="comics_container">
        {isLoading ? (
          <p>Carregando...</p>
        ) : searchResults.length === 0 ? (
          <p>Nenhum resultado encontrado.</p>
        ) : (
          searchResults.map((result) => {
            if (result.thumbnail) {
              return <SeriesCardApi key={result.id} serie={result} />;
            } else if (result.nomeSerie) {
              return <SeriesCardFirestore key={result.id} serie={result} />;
            } else {
              return <UserCard key={result.id} user={result} />;
            }
          })
        )}
      </div>
    </div>
  );
};

export default Search;
