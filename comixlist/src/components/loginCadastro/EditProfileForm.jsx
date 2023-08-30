import React, { useState, useContext, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi'; 
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './EditProfileForm.module.css'; 
import { AuthContext } from '../contexts/auth';
import { firestore } from '../bd/FireBase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../bd/FireBase'; 


function EditProfileForm({ btnText }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [editedProfile, setEditedProfile] = useState({
    nome: user.nome || '',
    email: user.email || '',
    aniversario: user.aniversario || '',
    descricaoUsuario: user.descricaoUsuario || '',
    imagemUsuario: user.imagemUsuario || '',
    local: user.local || '',
  });

  useEffect(() => {
    if (user) {
      const getUserProfile = async () => {
        const userDocRef = doc(collection(firestore, 'users'), user.uid);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          setEditedProfile(docSnapshot.data());
        }
      };
      getUserProfile();
    }
  }, [user]);

  const handleEditProfile = async (e) => {
    e.preventDefault();

    try {
      const userDocRef = doc(collection(firestore, 'users'), user.uid);
      await updateDoc(userDocRef, editedProfile);
      console.log('Perfil atualizado com sucesso!');
      navigate('/profile');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    
    const imageName = `${user.uid}_${Date.now()}_${file.name}`;
  
    const storageRef = ref(storage, `imu/${imageName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Progresso do Upload: ${progress}%`);
      },
      (error) => {
        console.error('Erro no Upload:', error);
      },
      () => {
        
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          handleChange('imagemUsuario', url);
        });
      }
    );
  };
  

  const handleChange = (field, value) => {
    setEditedProfile((prevProfile) => ({
      ...prevProfile,
      [field]: value,
    }));
  };

  return (
    <form className={styles.form} onSubmit={handleEditProfile}>
      <div className={styles.iconContainer}>
        <button type="button" className={styles.backButton} onClick={() => navigate('/profile')}>
          <FiArrowLeft className={styles.backIcon} /> Voltar
        </button>
      </div>

      <Input
        type="text"
        text="Nome de Usuário"
        name="name"
        placeholder="Editar nome do usuário"
        value={editedProfile.nome}
        onChange={(e) => handleChange('nome', e.target.value)}
      />

      <Input
        type="date"
        text="Aniversário"
        name="aniversario"
        placeholder="Editar data de aniversário"
        value={editedProfile.aniversario}
        onChange={(e) => handleChange('aniversario', e.target.value)}
      />

      <Input
        type="text"
        text="Local"
        name="local"
        placeholder="Editar local"
        value={editedProfile.local}
        onChange={(e) => handleChange('local', e.target.value)}
      />

      <Input
        type="text"
        text="Sobre mim"
        name="descricaoUsuario"
        placeholder="Sobre mim"
        value={editedProfile.descricaoUsuario}
        onChange={(e) => handleChange('descricaoUsuario', e.target.value)}
      />

      <form className={styles.form} onSubmit={handleUpload}>
      <Input
        type="file"
        text="Editar Imagem do Usuário"
        name="imagemUsuario"
        onChange={handleUpload}
      />
        <br />
        {!imagemSerie && <progress value={progress} max="100" />} 
      </form>
      
      <SubmitButton text={btnText} />
    </form>
  );
}

export default EditProfileForm;
