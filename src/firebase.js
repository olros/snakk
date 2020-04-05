import firebase from 'firebase/app';
import 'firebase/firestore';
const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "snakk-2020.firebaseapp.com",
  databaseURL: "https://snakk-2020.firebaseio.com",
  projectId: "snakk-2020",
  storageBucket: "snakk-2020.appspot.com",
  messagingSenderId: "743380259105",
};
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
export default firebase;