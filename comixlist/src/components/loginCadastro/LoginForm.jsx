import React, { useState, useContext } from 'react';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './LoginForm.module.css';
import { AuthContext } from '../contexts/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import ReCAPTCHA from "react-google-recaptcha";
import { auth, firestore } from '../bd/FireBase'; 
import { useNavigate } from 'react-router-dom';

function LoginForm({ btnText }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recaptchaValue) {
      try {
        await signInWithEmailAndPassword(auth, email, senha);
        navigate('/');
      } catch (error) {
        console.error('Error during login', error);
        if (error.code === "auth/user-not-found") {
          setLoginError("Usuário não encontrado. Verifique o endereço de e-mail.");
        } else if (error.code === "auth/wrong-password") {
          setLoginError("Senha incorreta. Verifique sua senha.");
        } else {
          setLoginError("Erro ao fazer login. Tente novamente mais tarde.");
        }
      }
    } else {
      console.log("Please complete the reCAPTCHA.");
    }
  }

  const handleToggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {loginError && <p className={styles.errorText}>{loginError}</p>}
      <br></br>
      <Input
        type="text"
        text="E-mail"
        name="email"
        placeholder="Insira o E-mail do usuário"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type={showPassword ? "text" : "password"}
        text="Senha"
        name="password"
        placeholder="Insira a senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button
        type="button"
        onClick={handleToggleShowPassword}
        className={styles.showPasswordButton}
      >
        {showPassword ? '🙈' : '👁️'}
      </button>
      <ReCAPTCHA
        sitekey="6LfYeJgnAAAAADdYBPsx2VapcoHVFX2CVhRRKT1Y"
        onChange={handleRecaptchaChange}
      />
      <SubmitButton text={btnText} />
    </form>
  );
}

export default LoginForm;
