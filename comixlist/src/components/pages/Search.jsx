import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SeriesCard from './SeriesCard';
import md5 from 'md5';
import './ComicsGrid.css';
import { useParams } from 'react-router-dom';

const seriesURL = 'https://gateway.marvel.com/v1/public/series';
const apiPublicKey = '1f9dc1c5fe6d097dde3bb4ca36ecbff0';
const apiPrivateKey = '219b41d0053667342c94897c56048704ecc93e7e';

const Search = ({}) => {
  const { searchTerm  } = useParams();
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

      const data = response.data.data;
      const results = data.results;
      setSeries(results);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      getSeriesBySearchTerm(searchTerm);
    } else {
      setSeries([]);
    }
  }, [searchTerm]);

  return (
    <div className="container">
      <h2 className="title">Pesquisar Séries de Quadrinhos</h2>
      <div className="comics_container">
        {series.length === 0 && <p>Nenhum resultado encontrado.</p>}
        {series.map((serie) => (
          <SeriesCard key={serie.id} serie={serie} />
        ))}
      </div>
    </div>
  );
};

export default Search;
