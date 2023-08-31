import React, { useState, useEffect } from 'react';
import styles from './CadastroSerieForm.module.css';
import SubmitButton from '../form/SubmitButton';
import Input from '../form/Input';
import { useNavigate } from 'react-router-dom';
import { ref } from 'firebase/database';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  collection,
  doc,
  getDoc,
  updateDoc, 
} from 'firebase/firestore'; 
import { storage, firestore } from '../bd/FireBase'; 
import { useContext } from 'react';
import { AuthContext } from '../contexts/auth';

function EditSerieForm({ btnText }) {
  const {serie} = useContext(AuthContext);
  const navigate = useNavigate();
  const [editedSerie, setEditedSerie] = useState({
    nomeSerie: serie.nomeSerie || '',
    descricaoSerie: serie.descricaoSerie || '',
    autorSerie: serie.autorSerie || '',
    editora: serie.editora || '',
    publiSerie: serie.publiSerie || '',
    imagemSerie: serie.imagemSerie || '',
    volumes: serie.volumes || '',
  });
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const getSeries = async () => {
      try {
        const seriesCollectionRef = doc(collection(firestore, 'serie'), serie.id);
        const docSnapshot = await getDoc(seriesCollectionRef);
        if (docSnapshot.exists()) {
          setEditedSerie(docSnapshot.data());
        }
      } catch (error) {
        console.error('Erro ao buscar série:', error);
      }
    };
    getSeries();
  }, [serie.id]);

  const handleEditSerie = async (e) => {
    e.preventDefault();

    try {
      const seriesCollectionRef = doc(collection(firestore, 'serie'), serie.id);
      await updateDoc(seriesCollectionRef, editedSerie);
      console.log('Serie atualizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao atualizar serie:', error);
    }
  };


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

  const handleChange = (field, value) => {
    setEditedSerie((prevSerie) => ({
      ...prevSerie,
      [field]: value,
    }));
  };

  return (
    <form className={styles.form} onSubmit={handleEditSerie}>
<Input
  type="text"
  text="Nome da Série"
  name="name"
  placeholder="Editar nome da Série"
  value={editedSerie.nomeSerie} 
  onChange={(e) => handleChange('nomeSerie', e.target.value)}
/>

<Input
  type="text"
  text="Nome do Autor"
  name="autor"
  placeholder="Editar nome do Autor"
  value={editedSerie.autorSerie} 
  onChange={(e) => handleChange('autorSerie', e.target.value)}
/>

<Input
  type="text"
  text="Descrição da Série"
  name="descricao"
  placeholder="Editar descrição da Série"
  value={editedSerie.descricaoSerie} 
  onChange={(e) => handleChange('descricaoSerie', e.target.value)}
/>

<Input
  type="date"
  text="Data da Públicação"
  name="publicação"
  placeholder="Editar data da Públicação"
  value={editedSerie.publiSerie} 
  onChange={(e) => handleChange('publiSerie', e.target.value)}
/>

<Input
  type="text"
  text="Editora"
  name="editora"
  placeholder="Editar Editora"
  value={editedSerie.editora} 
  onChange={(e) => handleChange('editora', e.target.value)}
/>

<Input
  type="number"
  text="Volumes"
  name="volimes"
  placeholder="Editar número de Volumes"
  value={editedSerie.volumes} 
  onChange={(e) => handleChange('volumes', e.target.value)}
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
  {!editedSerie.imagemSerie && <progress value={progress} max="100" />} 
</form>


      <SubmitButton text={btnText} />
    </form>
  );
}

export default EditSerieForm;
