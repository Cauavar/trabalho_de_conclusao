import React, { useState, useContext } from 'react';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './LoginForm.module.css';
import { AuthContext } from '../contexts/auth';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importe o método correto

function LoginForm({ btnText }) {
  const { auth } = useContext(AuthContext); // Certifique-se de que auth está sendo importado e fornecido pelo AuthContext

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha); // Use a função correta
    } catch (error) {
      console.error('Error during login', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        type="text"
        text="E-mail"
        name="email"
        placeholder="Insira o E-mail do usuário"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        text="Senha"
        name="password"
        placeholder="Insira a senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <SubmitButton text={btnText} />
    </form>
  );
}

export default LoginForm;
