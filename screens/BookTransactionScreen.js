import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,TextInput,Image,KeyboardAvoidingView } from 'react-native';
import *as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import db from '../config';
import firebase from 'firebase';


export default class TransactionScreen extends React.Component{
    constructor (){
        super();
        this.state = {
            hasCameraPermissions:null,
            scanned:false,
            scannedBookId:'',
            scannedStudentId:'',
            buttonState:'normal',
            transactionMessage:''
        }
    }
    getCameraPermissions = async(id) =>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            /*
            status === "granted" is true when the user has granted permission
            status ==="granted" is false when the user has not granted the permisssions
            */
           hasCameraPermissions:status ==="granted",
           buttonState:id,
           scanned:false
        })
    }
    handleBarCodeScanned = async({type,data}) =>{
        const {buttonState} = this.state
        if(buttonState === "BookId"){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
            })
        }
        else if(buttonState === "StudentId"){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
        }
    }
    initiateBookIssue = async() =>{
        //add a transacion
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Issue"
        })

        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':false
        })

        //change the number of books issued by that particular student
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
    }
    initiateBookReturn = async() =>{
        //add a transacion
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Return"
        })

        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })

        //change the number of books issued by that particular student
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
    }
    handleTransaction = async() =>{
        var transactionMessage = null;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc) =>{
            var book = doc.data()
            if(book.bookAvailability){
                this.initiateBookIssue();
                transactionMessage = "Book Issued"
                alert(transactionMessage)
            }
            else{
                this.initiateBookReturn();
                transactionMessage = "Book Returned"
                alert(transactionMessage)
            }
        })
        this.setState({
            transactionMessage:transactionMessage
        })
    }

    render(){
       const hasCameraPermissions = this.state.hasCameraPermissions;
       const scanned = this.state.scanned;
       const buttonState = this.state.buttonState;
       if(buttonState!=="normal"&& hasCameraPermissions){
           return(
               <BarCodeScanner
               onBarCodeScanned = {scanned?undefined:this.handleBarCodeScanned}
               style = {StyleSheet.absoluteFillObject}
               />
           )
       }
       else if(buttonState=== "normal"){
           return(
            <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>
                <View>
                    <Image
                    source = {require("../assets/booklogo.jpg")}
                    style = {{width:200,height:200}}/>
                    <Text style = {{textAlign:'center',fontSize:30}}>Wily</Text>
                </View>
                <View style = {styles.inputView}>
                    <TextInput
                    style = {styles.inputBox}
                    placeholder = "bookid"
                    onChangeText = {text => this.setState({scannedBookId:text})}
                    value = {this.state.scannedBookId}/>
                    <TouchableOpacity
                    style = {styles.scannedButton}
                    onPress = {()=>{
                        this.getCameraPermissions("BookId")
                    }}>
                        <Text style = {styles.buttonText}>
                            scanned
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style = {styles.inputView}>
                    <TextInput
                    style = {styles.inputBox}
                    placeholder = "studentid"
                    onChangeText = {text => this.setState({scannedStudentId:text})}
                    value = {this.state.scannedStudentId}/>
                    <TouchableOpacity
                    style = {styles.scannedButton}
                    onPress = {()=>{
                        this.getCameraPermissions("StudentId")
                    }}>
                        <Text style = {styles.buttonText}>
                            scanned
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                style = {styles.submitButton}
                onPress = {async() =>{
                    var transactionMessage = await this.handleTransaction()
                }}>
                    <Text style = {styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
           )
       }
    }
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'

    },
    displayText:{
        fontSize:15,
        textDecorationLine:'underline'
    },
    scannedButton:{
        width:150,
        backgroundColor:'#2196F3',
        padding:10,
        margin:10
    },
    buttonText:{
        fontSize:12,
        textAlign:'center',
        marginTop:10
    },
    inputView:{
        flexDirection:'row',
        margin:20
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },scannedButton:{
        backgroundColor:'#66BB6A',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0
    },
    submitButton:{
        backgroundColor:"blue",
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:"bold",
        color:'black'
    }
})