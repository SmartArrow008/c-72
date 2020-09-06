import *as firebase from 'firebase'
require('@firebase/firestore')


var firebaseConfig = {
    apiKey: "AIzaSyC0DnnNTTlM6WqFnTg1PeB_0GMzNwbxdw8",
    authDomain: "wireleibrary-df707.firebaseapp.com",
    databaseURL: "https://wireleibrary-df707.firebaseio.com",
    projectId: "wireleibrary-df707",
    storageBucket: "wireleibrary-df707.appspot.com",
    messagingSenderId: "621105012548",
    appId: "1:621105012548:web:147c087d75d09656ccc111",
    measurementId: "G-MQ245N5VNR"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();