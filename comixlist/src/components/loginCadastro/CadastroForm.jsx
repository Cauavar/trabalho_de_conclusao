import React, { useState, useContext, useEffect } from 'react';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './CadastroForm.module.css';
import { AuthContext } from '../contexts/auth';
import ReCAPTCHA from "react-google-recaptcha";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { query } from 'firebase/database';
import { collection, doc, setDoc, where, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '../bd/FireBase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../bd/FireBase';

function CadastroForm({ btnText }) {
  const { signup } = useContext(AuthContext);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aniversario, setAniversario] = useState('');
  const [descricaoUsuario, setDescricaoUsuario] = useState('');
  const [imagemUsuario, setImagemUsuario] = useState('');
  const [local, setLocal] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emailInUseError, setEmailInUseError] = useState(false);
  const [emailInvalidError, setEmailInvalidError] = useState(false);
  const [passwordRequirementsError, setPasswordRequirementsError] = useState(false);
  const navigate = useNavigate();

  const listaPessoalData = {
    dataAdicao: new Date().toISOString(),
    dataConclusao: "",
    favorito: false,
    notaPessoal: 0,
    progresso: 0,
    resenha: "",
    serieId: "", 
    ultimaAtualizacao: new Date().toISOString(),
  };

  const createNewUserWithSubcollection = async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.senha);
    
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        nome: userData.nome,
        email: userData.email,
        aniversario: userData.aniversario || '',
        descricaoUsuario: userData.descricaoUsuario || '',
        imagemUsuario: userData.imagemUsuario || '',
        local: userData.local || '',
      });
  
      const listaPessoalRef = collection(firestore, 'users', userCredential.user.uid, 'listaPessoal');
      await addDoc(listaPessoalRef, listaPessoalData); 
        
      console.log('Cadastro realizado com sucesso!');
    } catch (error) {
      console.error('Erro durante o cadastro', error);
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleToggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  const hideErrors = () => {
    setEmailInUseError(false);
    setEmailInvalidError(false);
    setPasswordRequirementsError(false);
  };

  const showErrorForSeconds = (errorSetter, duration) => {
    errorSetter(true);
    setTimeout(() => errorSetter(false), duration);
  };

  const validatePassword = (password) => {
    if (password.length < 6 || !/\d/.test(password)) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hideErrors();
    if (recaptchaValue) {
      try {
        const userData = {
          nome,
          email,
          senha,
          aniversario,
          descricaoUsuario,
          imagemUsuario,
          local,
        };
        
        if (!isValidEmail(email)) {
          showErrorForSeconds(setEmailInvalidError, 3000);
          return;
        }

        if (!validatePassword(senha)) {
          showErrorForSeconds(setPasswordRequirementsError, 3000);
          return;
        }

        const emailExistsQuery = query(collection(firestore, 'users'), where('email', '==', email));
        const emailExistsSnapshot = await getDocs(emailExistsQuery);
        if (!emailExistsSnapshot.empty) {
          showErrorForSeconds(setEmailInUseError, 3000);
          return;
        }
        
        await createNewUserWithSubcollection(userData);
        navigate('/profile');
        console.log('Cadastro realizado com sucesso!');
      } catch (error) {
        console.log('Erro durante o cadastro', error);
      }
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return emailRegex.test(email);
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
            <br></br>

      <Input
        type="email"
        text="Email"
        name="email"
        placeholder="Insira um E-mail"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          hideErrors(); 
        }}
      />
      {emailInUseError && <p className={styles.errorText}>Este email já está em uso.</p>}
      {emailInvalidError && <p className={styles.errorText}>Este email não é válido.</p>}
      <br></br>


      <Input
        type={showPassword ? 'text' : 'password'}
        text="Senha"
        name="password"
        placeholder="Insira uma senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      {passwordRequirementsError && <p className={styles.errorText}>A senha deve ter ao menos 6 caracteres.</p>}
      <br></br>
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
      {uploading && <p>Uploading image...</p>}
      <SubmitButton text={btnText} />
    </form>
  );
}

export default CadastroForm;
