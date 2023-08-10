import React, { useState, useContext } from 'react';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './CadastroForm.module.css';
import { AuthContext } from '../contexts/auth';

function CadastroForm({ btnText }) {
  const { signup } = useContext(AuthContext);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submit", { nome, email, senha });
    await signup(nome, email, senha);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        type="text"
        text="Nome de Usuário"
        name="name"
        placeholder="Insira o nome do usuário"
        value={nome} 
        onChange={(e) => setNome(e.target.value)}
      />

      <Input
        type="email"
        text="Email"
        name="email"
        placeholder="Insira um E-mail"
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        text="Senha"
        name="password"
        placeholder="Insira uma senha"
        value={senha} 
        onChange={(e) => setSenha(e.target.value)}
      />
      
      <SubmitButton text={btnText} />
    </form>
  );
}

export default CadastroForm;
