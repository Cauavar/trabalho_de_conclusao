import EditSerieForm from '../loginCadastro/EditSerieForm';
import styles from './Login.module.css';
import Footer from '../layout/Footer';
import { addSerieToFirestore } from '../bd/FireBase';

function EditSerie() {
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
      <h1>Edite a Série</h1>
      <EditSerieForm btnText="Salvar Alterações" onSubmit={handleSignup} />
      <Footer />
    </div>
  );
}

export default EditSerie;
