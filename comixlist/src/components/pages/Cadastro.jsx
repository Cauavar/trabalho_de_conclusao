import React, { useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import CadastroForm from '../loginCadastro/CadastroForm';
import styles from './Cadastro.module.css';
import Footer from '../layout/Footer';

const Cadastro = () => {


  return (
    <div className={styles.cadastroContainer}>
      <h2>Cadastro de Usuário</h2>
      <CadastroForm btnText="Cadastrar" /> 
      <Footer />
    </div>
  );
};

export default Cadastro;
