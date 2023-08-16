import React, { useState, useContext } from 'react';
import styles from './CadastroSerieForm.module.css';
import SubmitButton from '../form/SubmitButton';
import Input from '../form/Input';
import { addSerieToFirestore } from '../bd/FireBase'; 
import { useNavigate } from 'react-router-dom';

function CadastroSerieForm({btnText}) {
    const navigate = useNavigate();
    const [nomeSerie, setNomeSerie] = useState('');
    const [autorSerie, setAutorSerie] = useState('');
    const [descricaoSerie, setDescricaoSerie] = useState('');
    const [publiSerie, setPubliSerie] = useState('');
    const [imagemSerie, setImagemSerie] = useState('');


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
            name="autor"
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

          <Input
            type="text"
            text="Capa da Série"
            name="Capa"
            placeholder="Insira uma capa para a Série"
            value={imagemSerie} 
            onChange={(e) => setImagemSerie(e.target.value)}
          />  
    
          <SubmitButton text={btnText} />
        </form>
      );
      };

export default CadastroSerieForm;