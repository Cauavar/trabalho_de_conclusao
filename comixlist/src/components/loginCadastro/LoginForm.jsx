import React, { useState, useContext } from 'react';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './LoginForm.module.css';
import { AuthContext } from '../contexts/auth';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import ReCAPTCHA from "react-google-recaptcha";

function LoginForm({ btnText }) {
  const { auth } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (recaptchaValue){
    try {
      await signInWithEmailAndPassword(auth, email, senha); 
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
        <ReCAPTCHA
        sitekey="6LfYeJgnAAAAADdYBPsx2VapcoHVFX2CVhRRKT1Y"
        onChange={handleRecaptchaChange}
      />
      <SubmitButton text={btnText} />
    </form>
  );
}

export default LoginForm;
