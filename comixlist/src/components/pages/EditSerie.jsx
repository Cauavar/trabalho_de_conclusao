import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import EditSerieForm from '../loginCadastro/EditSerieForm';
import styles from './Login.module.css';
import { useParams } from 'react-router-dom';

function EditSerie() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);

  useEffect(() => {
    const getSeriesData = async () => {
      if (isMarvelApiId(id)) {
        const seriesData = await getSeriesFromApi(id);
        setSeries(seriesData);
      } else {
        const seriesData = await getSeriesFromFirestore(id);
        setSeries(seriesData);
      }
    };

    getSeriesData();
  }, [id]);

  return (
    <div className={styles.login_container}>
      <h1>Edite a Série</h1>
      <EditSerieForm btnText="Salvar Alterações" serie={series} />
    </div>
  );
}

export default EditSerie;
