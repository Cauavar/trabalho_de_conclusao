import React, { useState, useContext } from 'react';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './CadastroForm.module.css';
import { AuthContext } from '../contexts/auth';
import ReCAPTCHA from "react-google-recaptcha";
import { storage } from '../bd/FireBase';
import { ref } from 'firebase/database';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore'; 


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


  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `user_images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error(error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImagemUsuario(url);
          setUploading(false);
        });
      }
    );
  };

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
  }

  const handleToggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        await createNewUserWithSubcollection(userData);
        await signup(userData);

        console.log('Cadastro realizado com sucesso!');
      } catch (error) {
        console.log('Erro durante o cadastro', error);
      }
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
        type={showPassword ? 'text' : 'password'}
        text="Senha"
        name="password"
        placeholder="Insira uma senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      {/* Botão para alternar a exibição da senha */}
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
