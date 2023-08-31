import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage }  from 'firebase/storage';

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


export const storage = getStorage(app);
