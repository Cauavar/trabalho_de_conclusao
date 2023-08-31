import React from 'react';
import EditSerieForm from '../loginCadastro/EditSerieForm';
import styles from './Login.module.css';


function EditSerie() {
  return (
    <div className={styles.login_container}>
      <h1>Edite a Série</h1>
      <EditSerieForm btnText="Salvar Alterações" />
    </div>
  );
}

export default EditSerie;
