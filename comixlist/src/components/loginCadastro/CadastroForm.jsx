import React, { useState, useContext } from 'react';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './CadastroForm.module.css';
import { AuthContext } from '../contexts/auth';
import ReCAPTCHA from "react-google-recaptcha";

function CadastroForm({ btnText }) {
  const { signup } = useContext(AuthContext);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  }

  const handleToggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recaptchaValue) {
      try {
        console.log("submit", { nome, email, senha });
        await signup(nome, email, senha);
      } catch (error) {
        console.error('Error during login', error);
      } 
    }  else {
        console.log("Please complete the reCAPTCHA.");
      }
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
        type={showPassword ? "text" : "password"}
        text="Senha"
        name="password"
        placeholder="Insira uma senha"
        value={senha} 
        onChange={(e) => setSenha(e.target.value)}
      />
      <button // componentizar botao e usar o react icons depois
        type="button"
        onClick={handleToggleShowPassword}
        className={styles.showPasswordButton}
      >
        {showPassword ? "🙈" : "👁️"}
      </button>
      <ReCAPTCHA
        sitekey="6LfYeJgnAAAAADdYBPsx2VapcoHVFX2CVhRRKT1Y"
        onChange={handleRecaptchaChange}
      />

      <SubmitButton text={btnText} />
    </form>
  );
}

export default CadastroForm;
