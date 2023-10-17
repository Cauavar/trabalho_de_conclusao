import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage }  from 'firebase/storage';
import { doc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { arrayUnion } from 'firebase/firestore';

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

export { app, auth, database, analytics, firestore, collection, addDoc, doc, getDoc  }; 



export const addSerieToFirestore = async (serieData) => {
  try {
    const seriesCollectionRef = collection(firestore, 'serie');
    await addDoc(seriesCollectionRef, { ...serieData, Aprovada: false });
    console.log('Série cadastrada com sucesso:', serieData);
  } catch (error) {
    console.error('Erro durante o cadastro da série', error);
  }
};

export const saveEditProposal = async (serieId, editData) => {
  try {
    const editProposalCollectionRef = collection(firestore, 'edicoesPendentes');
    const newEditProposal = {
      idSerieOriginal: serieId,
      ...editData, 
      aprovada: false, 
    };
    await addDoc(editProposalCollectionRef, newEditProposal);
    console.log('Edição proposta enviada para aprovação com sucesso.');
  } catch (error) {
    console.error('Erro ao salvar a edição proposta:', error);
  }
};


export const applyEditToSerie = async (serieId, campoEditado, valorEditado) => {
  try {
    const serieDocRef = doc(collection(firestore, 'serie'), serieId);
    const updateData = {
      [campoEditado]: valorEditado,
    };

    await updateDoc(serieDocRef, updateData);
    console.log('Edição aplicada à série com sucesso.');
  } catch (error) {
    console.error('Erro ao aplicar edição à série:', error);
  }
};


export const addCommentToFirestore = async (userId, commentText, commentedUserId) => {

  const dataAtual = new Date();
  const commentDate = dataAtual.toISOString();

  try {
    const userRef = doc(firestore, 'users', commentedUserId); 
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const newComment = {
          text: commentText,
          userId: currentUser.uid,
          commentDate,
        };

  
        await updateDoc(userRef, {
          comments: arrayUnion(newComment),
        });

        console.log('Comentário adicionado com sucesso.');
      } else {
        console.error('Usuário não autenticado.');
      }
    } else {
      console.error('Documento do usuário não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
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
const isMarvelApiId = (id) => {
  return !isNaN(parseInt(id));
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

//const calcularNotaMediaParaSeriesAPI = async () => {
  try {
    const seriesCollectionRef = collection(firestore, 'serie');
    const querySnapshot = await getDocs(seriesCollectionRef);

    for (const doc of querySnapshot.docs) {
      const serieData = doc.data();
      const serieId = doc.id;

      if (isMarvelApiId(serieId)) {
        const usuariosComNotaRef = collection(firestore, 'users');
        const usuariosQuerySnapshot = await getDocs(usuariosComNotaRef);

        let somaTotalNotas = 0;
        let numUsuariosQueDeramNota = 0;

        for (const userDoc of usuariosQuerySnapshot.docs) {
          const userData = userDoc.data();

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
        await updateDoc(doc.ref, { notaMedia: novaMedia });
      }
    }
  } catch (error) {
    console.error('Erro ao calcular e atualizar a média de notas para as séries da API:', error);
  }
//};

//calcularNotaMediaParaSeriesAPI();


export const getApprovedSeries = async () => {
  try {
    const seriesCollectionRef = collection(firestore, 'serie');
    const querySnapshot = await getDocs(query(seriesCollectionRef, where('Aprovada', '==', true)));
    const approvedSeries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return approvedSeries;
  } catch (error) {
    console.error('Erro ao listar séries aprovadas:', error);
    return [];
  }
};

export const getUnapprovedSeries = async () => {
  try {
    const seriesCollectionRef = collection(firestore, 'serie');
    const querySnapshot = await getDocs(query(seriesCollectionRef, where('Aprovada', '==', false)));
    const unapprovedSeries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return unapprovedSeries;
  } catch (error) {
    console.error('Erro ao listar séries não aprovadas:', error);
    return [];
  }
};


  

export const storage = getStorage(app);