import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './EditSerieForm.module.css';
import { firestore } from '../bd/FireBase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../bd/FireBase';
import { useParams } from 'react-router-dom';
import { saveEditProposal } from '../bd/FireBase';

function EditSerieForm({ btnText, serie }) {
  const { id } = useParams();
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const [editedSerie, setEditedSerie] = useState({
    nomeSerie: serie ? serie.nomeSerie || '' : '',
    autorSerie: serie ? serie.autorSerie || '' : '',
    descricaoSerie: serie ? serie.descricaoSerie || '' : '',
    publiSerie: serie ? serie.publiSerie || '' : '',
    volumes: serie ? serie.volumes || '' : '',
    imagemSerie: serie ? serie.imagemSerie || '' : '',
  });

  useEffect(() => {

    const getSerieData = async () => {
      const serieDocRef = doc(collection(firestore, 'serie'), id);
      const docSnapshot = await getDoc(serieDocRef);
      if (docSnapshot.exists()) {
        setEditedSerie(docSnapshot.data());
      }
    };
    getSerieData();
  }, [id]);

  const handleEditSerie = async (e) => {
    e.preventDefault();
  
    try {
      const editData = { ...editedSerie };
      editData.imagemSerie = editedSerie.imagemSerie;
      
      await saveEditProposal(id, editData);
  
      alert('Edição proposta enviada para aprovação com sucesso.');
      navigate(`/series/${id}`);
    } catch (error) {
      console.error('Erro ao editar série:', error);
    }
  }
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageName = `${id}_${Date.now()}_${file.name}`;

    const storageRef = ref(storage, `ims/${imageName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Erro no Upload:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => {
            handleChange('imagemSerie', url);
            setUploadProgress(100);
          })
          .catch((error) => {
            console.error('Erro ao obter o URL da imagem:', error);
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
      <div className={styles.iconContainer}>
        <button type="button" className={styles.backButton} onClick={() => navigate(`/series/${id}`)}>
          <FiArrowLeft className={styles.backIcon} /> Voltar
        </button>
      </div>

      <Input
        type="text"
        text="Nome da Série"
        name="nomeSerie"
        placeholder="Editar nome da Série"
        value={editedSerie.nomeSerie}
        onChange={(e) => handleChange('nomeSerie', e.target.value)}
      />

      <Input
        type="text"
        text="Nome do Autor"
        name="autorSerie"
        placeholder="Editar nome do Autor"
        value={editedSerie.autorSerie}
        onChange={(e) => handleChange('autorSerie', e.target.value)}
      />

      <Input
        type="text"
        text="Descrição da Série"
        name="descricaoSerie"
        placeholder="Editar descrição da Série"
        value={editedSerie.descricaoSerie}
        onChange={(e) => handleChange('descricaoSerie', e.target.value)}
      />

      <Input
        type="date"
        text="Data da Publicação"
        name="publiSerie"
        placeholder="Editar data da Publicação"
        value={editedSerie.publiSerie}
        onChange={(e) => handleChange('publiSerie', e.target.value)}
      />

      <Input
        type="number"
        text="Volumes"
        name="volumes"
        placeholder="Editar número de Volumes"
        value={editedSerie.volumes}
        onChange={(e) => handleChange('volumes', e.target.value)}
      />

<Input
        type="file"
        text="Editar Imagem da Série"
        name="imagemSerie"
        onChange={handleUpload}
      />
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className={styles.progressText}>{uploadProgress}%</div>
          )}
        </div>
      </div>
      <br />
      <SubmitButton text={btnText} />
    </form>
  );
}

export default EditSerieForm;
