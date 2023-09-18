import CadastroSerieForm from '../loginCadastro/CadastroSerieForm';
import styles from './Login.module.css';
import { addSerieToFirestore } from '../bd/FireBase';

function CadastroSerie() {
  const handleSignup = (nomeSerie, autorSerie, descricaoSerie, publiSerie, imagemSerie) => {
    const serieData = {
      nomeSerie,
      autorSerie,
      descricaoSerie,
      publiSerie,
      imagemSerie,
    };
    addSerieToFirestore(serieData);
  };

  return (
    <div className={styles.login_container}>
      <h1>Cadastre uma Série</h1>
      <CadastroSerieForm btnText="Cadastrar" onSubmit={handleSignup} />
    </div>
  );
}


export default CadastroSerie;
