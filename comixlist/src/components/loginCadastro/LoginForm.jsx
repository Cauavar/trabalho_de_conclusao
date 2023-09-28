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
  const navigate = useNavigate();

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recaptchaValue){
    try {
      await signInWithEmailAndPassword(auth, email, senha); 
      navigate('/');
    } catch (error) {
        console.error('Error during login', error);
        console.log(error.code); 
        console.log(error.message); 
    }
  }  else {
    console.log("Please complete the reCAPTCHA.");
  }
  };
  const handleToggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  }



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
