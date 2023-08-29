import React from 'react';
import EditProfileForm from '../loginCadastro/EditProfileForm';
import styles from './Cadastro.module.css';

const EditProfile = () => {
  return (
    <div className={styles.cadastroContainer}>
      <EditProfileForm btnText="Salvar Alterações" />
    </div>
  );
};

export default EditProfile;

