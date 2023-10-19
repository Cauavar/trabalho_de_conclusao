import React from 'react';
import EditProfileForm from '../loginCadastro/EditProfileForm';
import styles from './Cadastro.module.css';

const EditProfile = () => {
  return (
    <div className={styles.cadastroContainer}>
            <h1>Editar Perfil</h1>
      <EditProfileForm btnText="Salvar Alterações" />
    </div>
  );
};

export default EditProfile;

