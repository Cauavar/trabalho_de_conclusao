import React, { useState, useContext } from 'react';
import styles from './CadastroSerieForm.module.css';
import SubmitButton from '../form/SubmitButton';
import Input from '../form/Input';
import { addSerieToFirestore, storage } from '../bd/FireBase'; 
import { useNavigate } from 'react-router-dom';
import { ref } from 'firebase/database';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function CadastroSerieForm({ btnText }) {
  const navigate = useNavigate();
  const [nomeSerie, setNomeSerie] = useState('');
  const [autorSerie, setAutorSerie] = useState('');
  const [descricaoSerie, setDescricaoSerie] = useState('');
  const [publiSerie, setPubliSerie] = useState('');
  const [imagemSerie, setImagemSerie] = useState('');
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e) => {
    e.preventDefault();

    const file = e.target[0]?.files[0];
    if (!file) return;

    const storageRef = ref(storage, `ims/${file.name}`); 
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_change",
      null,
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      error =>{
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          setImagemSerie(url);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serieData = {
        nomeSerie,
        autorSerie,
        descricaoSerie,
        publiSerie,
        imagemSerie, 
      };
      await addSerieToFirestore(serieData); 
      console.log('Série cadastrada com sucesso:', serieData);
      navigate('/');
    } catch (error) {
      console.error('Erro durante o cadastro da Série', error);
    } 
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        type="text"
        text="Nome da Série"
        name="name"
        placeholder="Insira o nome da Série"
        value={nomeSerie} 
        onChange={(e) => setNomeSerie(e.target.value)}
      />
  
      <Input
        type="text"
        text="Nome do Autor"
        name="autor"
        placeholder="Insira o nome do Autor"
        value={autorSerie} 
        onChange={(e) => setAutorSerie(e.target.value)}
      />

      <Input
        type="text"
        text="Descrição da Série"
        name="descricao"
        placeholder="Insira a descrição da Série"
        value={descricaoSerie} 
        onChange={(e) => setDescricaoSerie(e.target.value)}
      />

      <Input
        type="date"
        text="Data da Públicação"
        name="publicação"
        placeholder="Insira a data da Públicação"
        value={publiSerie} 
        onChange={(e) => setPubliSerie(e.target.value)}
      />  
      <form className={styles.form} onSubmit={handleUpload}>
        <Input
          type="file"
          text="Capa da Série"
          name="Capa"
          placeholder="Insira uma capa para a Série"
          onChange={handleUpload} 
        />
        <br />
        {!imagemSerie && <progress value={progress} max="100" />} 
      </form>

      <SubmitButton text={btnText} />
    </form>
  );
}

export default CadastroSerieForm;
