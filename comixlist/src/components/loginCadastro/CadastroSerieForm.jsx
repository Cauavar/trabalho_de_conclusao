import React, { useState, useContext } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './CadastroSerieForm.module.css';
import SubmitButton from '../form/SubmitButton';
import Input from '../form/Input';
import { addSerieToFirestore, storage } from '../bd/FireBase';
import { useNavigate } from 'react-router-dom';
import { ref } from 'firebase/storage';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../contexts/auth';

function CadastroSerieForm({ btnText }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serieData, setSerieData] = useState({
    nomeSerie: '',
    autorSerie: '',
    descricaoSerie: '',
    publiSerie: '',
    volumes: '',
    imagemSerie: '',
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (e) => {
    e.preventDefault();
  
    const file = e.target.files[0];
    if (!file) return;
  
    const imageName = `${Date.now()}_${file.name}`;
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
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setSerieData({ ...serieData, imagemSerie: url });
        } catch (error) {
          console.error('Erro ao obter o URL da imagem:', error);
        }
      }
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadProgress < 100) {
      console.log('Progress not at 100%, do not submit yet.');
      return;
    }
    
    try {
      await addSerieToFirestore(serieData);
      alert('Cadastro da proposta de série enviada para aprovação com sucesso.', serieData);
      navigate('/');
    } catch (error) {
      console.error('Erro durante o cadastro da Série', error);
    }
  };
  return (
    <div>
      {user ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.iconContainer}>
            <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
              <FiArrowLeft className={styles.backIcon} /> Voltar
            </button>
          </div>
          <Input
            type="text"
            text="Nome da Série"
            name="name"
            placeholder="Insira o nome da Série"
            value={serieData.nomeSerie}
            onChange={(e) => setSerieData({ ...serieData, nomeSerie: e.target.value })}
          />

          <Input
            type="text"
            text="Nome do Autor"
            name="autor"
            placeholder="Insira o nome do Autor"
            value={serieData.autorSerie}
            onChange={(e) => setSerieData({ ...serieData, autorSerie: e.target.value })}
          />

          <Input
            type="text"
            text="Descrição da Série"
            name="descricao"
            placeholder="Insira a descrição da Série"
            value={serieData.descricaoSerie}
            onChange={(e) => setSerieData({ ...serieData, descricaoSerie: e.target.value })}
          />

          <Input
            type="date"
            text="Data da Públicação"
            name="publicação"
            placeholder="Insira a data da Públicação"
            value={serieData.publiSerie}
            onChange={(e) => setSerieData({ ...serieData, publiSerie: e.target.value })}
          />
          <Input
            type="number"
            text="Número de Volumes"
            name="volumes"
            placeholder="Insira o Número de Volumes"
            value={serieData.volumes}
            onChange={(e) => setSerieData({ ...serieData, volumes: e.target.value })}
          />
          <Input
            type="file"
            text="Capa da Série"
            name="imagemSerie"
            placeholder="Insira uma capa para a Série"
            onChange={handleUpload}
          />

          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className={styles.progressText}>{uploadProgress}%</div>
              )}
            </div>
          </div>
          <br></br>

          <SubmitButton text={btnText} />
        </form>
      ) : (
        <p>Faça login para cadastrar uma série.</p>
      )}
    </div>
  );
}

export default CadastroSerieForm;
