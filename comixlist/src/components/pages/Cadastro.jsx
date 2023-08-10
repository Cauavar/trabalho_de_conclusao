import React, { useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import CadastroForm from '../loginCadastro/CadastroForm';
import styles from './Cadastro.module.css';

const Cadastro = () => {
  const { signup } = useContext(AuthContext);

  const handleSignup = (nome, email, senha) => {
    signup(nome, email, senha); 
  };

  return (
    <div className={styles.cadastroContainer}>
      <h2>Cadastro de Usuário</h2>
      <CadastroForm btnText="Cadastrar" onSubmit={handleSignup} />
    </div>
  );
};

export default Cadastro;
