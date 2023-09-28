import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage }  from 'firebase/storage';
import { doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdEkAj4hkN5om83TRSHF0HcxPMFoE34vM",
  authDomain: "tcccomixlist.firebaseapp.com",
  databaseURL: "https://tcccomixlist-default-rtdb.firebaseio.com",
  projectId: "tcccomixlist",
  storageBucket: "tcccomixlist.appspot.com",
  messagingSenderId: "299354265800",
  appId: "1:299354265800:web:7a428260830240f11aedfd",
  measurementId: "G-VFQYV56G6D"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

export { app, auth, database, analytics, firestore, collection, addDoc }; 

export const addSerieToFirestore = async (serieData) => {
  try {
    const seriesCollectionRef = collection(firestore, 'serie');
    await addDoc(seriesCollectionRef, serieData);
  } catch (error) {
    throw new Error('Erro ao adicionar série ao Firestore: ' + error.message);
  }
};

export const addListaPessoalToFirestore = async (userId, serieId, nota, review, volumesLidos, tipo) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const listaPessoal = userDoc.data().listaPessoal || [];

      // Verifique se a série já existe na lista
      const serieIndex = listaPessoal.findIndex((item) => item.serieId === serieId);

      if (serieIndex !== -1) {
        // Se a série já existe, atualize os dados
        listaPessoal[serieIndex] = {
          ...listaPessoal[serieIndex],
            nota,
            review,
            volumesLidos,
            tipo,
        };
      } else {
        // Se a série não existe na lista, adicione-a
        const itemNaLista = {
          serieId,
          nota,
          review,
          volumesLidos,
          tipo,
        };
        listaPessoal.push(itemNaLista);
      }

      await updateDoc(userRef, { listaPessoal });

      // Após atualizar a lista pessoal, calcule a nota média
      await calcularNotaMedia(serieId, userId); 
      
      console.log('Item adicionado/atualizado à lista pessoal com sucesso');
    } else {
      throw new Error('Usuário não encontrado');
    }
  } catch (error) {
    throw new Error('Erro ao adicionar/atualizar item à lista pessoal: ' + error.message);
  }
};

const calcularNotaMedia = async (serieId, userId) => {
  const seriesCollectionRef = collection(firestore, 'serie');
  const serieRef = doc(seriesCollectionRef, serieId);
  const serieDoc = await getDoc(serieRef);

  if (serieDoc.exists()) {
    const usuariosComNotaRef = collection(firestore, 'users');
    const usuariosQuerySnapshot = await getDocs(usuariosComNotaRef);

    let somaTotalNotas = 0;
    let numUsuariosQueDeramNota = 0;

    for (const userDoc of usuariosQuerySnapshot.docs) {
      const userData = userDoc.data();

      // Verifica se listaPessoal existe e é um array
      if (userData.listaPessoal && Array.isArray(userData.listaPessoal)) {
        const serieNaLista = userData.listaPessoal.find(item => item.serieId === serieId);

        if (serieNaLista && typeof serieNaLista.nota === 'number') {
          somaTotalNotas += serieNaLista.nota;
          numUsuariosQueDeramNota++;
        }
      }
    }

    const novaMedia = numUsuariosQueDeramNota > 0 ? somaTotalNotas / numUsuariosQueDeramNota : 0;

    // Atualize o campo "notaMedia" na série
    await updateDoc(serieRef, { notaMedia: novaMedia });
    console.log('Média de notas calculada e atualizada com sucesso:', novaMedia);
  } else {
    throw new Error('Série não encontrada');
  }
};

export const storage = getStorage(app);