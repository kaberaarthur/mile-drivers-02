import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  StyleSheet,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { selectPerson, setPerson } from "../slices/personSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';


import { db, auth } from "../firebaseConfig";
import firebase from "firebase/compat/app";

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstDocID, setFirstDocID] = useState("");
  const dispatch = useDispatch();

  const person = useSelector(selectPerson);

  useEffect(() => {
    let isMounted = true; // Flag to manage async operations
  
    const initializeAuth = async () => {
      try {
        // Attempt to retrieve the user from AsyncStorage
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("#### A USER EXISTS ####");
          console.log('User UID :', parsedUser.uid);

          navigation.navigate('HomeScreen');
        } 
  
        // Set up auth state listener
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
          if (!isMounted) return; // Avoid state updates if component unmounted
  
          if (authUser) {
            // User is signed in; update AsyncStorage and app state
            await AsyncStorage.setItem('user', JSON.stringify(authUser));
            console.log("######################");
            console.log("The Current User: ", authUser);
            console.log("######################");
            
            navigation.navigate('HomeScreen');
          } else if (!storedUser) {
            // No user in storage and no authUser; direct to SignUpScreen
            console.log("No User Detected - Remain on SignUpScreen");
          }
          setLoading(false); // Update loading state
        });
  
        // Return the unsubscribe function to be called on cleanup
        return () => {
          isMounted = false; // Prevent updates after unmount
          unsubscribe(); // Unsubscribe from auth listener
        };
      } catch (error) {
        console.error('Error initializing app state:', error);
        setLoading(false);
      }
    };
  
    initializeAuth();
  }, [dispatch, navigation]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const generateRandomCode = () => {
    const min = 100000; // Minimum 4-digit number
    const max = 999999; // Maximum 4-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const [phoneNumber, setPhoneNumber] = useState("");

  const sendOTP = () => {
    console.log("Sending OTP Now");
  };

  function getDriverByPhoneNumber(phoneNumber) {
    const driversCollection = db.collection("drivers");
  
    driversCollection
      .where("phone", "==", phoneNumber)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          console.log("No matching documents found.");
          return;
        }
  
        querySnapshot.forEach((doc) => {
          console.log("#### Check Here #### - ", doc.id);
          setFirstDocID(doc.id);
          // Access other fields if needed: doc.data().fieldName
        });
      })
      .catch((error) => {
        console.error("Error getting Driver By Phone Number: ", error);
      });
  };

  const handleSignIn = async () => {
    const expectedCode = generateRandomCode();
  
    // Early return if phoneNumber is not provided
    if (!phoneNumber) {
      console.error("Phone number is required.");
      return;
    }
  
    try {
      const querySnapshot = await db.collection("drivers")
        .where("phone", "==", phoneNumber)
        .get();
  
      let docId; // Variable to hold the document ID
  
      if (querySnapshot.empty) {
        // No existing document found, proceed with creating a new one
        const newDocRef = db.collection("drivers").doc();
        await newDocRef.set({
          dateRegistered: firebase.firestore.FieldValue.serverTimestamp(),
          email: "",
          name: "",
          language: "en",
          phone: phoneNumber,
          authID: "",
          otpDate: firebase.firestore.FieldValue.serverTimestamp(),
          otpCode: expectedCode,
          password: "",
        });
        console.log("Document successfully written!");
        console.log("OTP: " + expectedCode);
  
        // Since this is a new document, use the newly created document's ID
        docId = newDocRef.id;
      } else {
        // Existing document(s) found, update the otpCode for the last document
        const docs = querySnapshot.docs;
        const lastDoc = docs[docs.length - 1]; // Get the last document in the snapshot
  
        await db.collection("drivers").doc(lastDoc.id).update({
          otpCode: expectedCode,
        });
        console.log("OTP: " + expectedCode);
  
        // Use the last document's ID
        docId = lastDoc.id;
      }
  
      // Assuming setFirstDocID is a method to update state or similar
      setFirstDocID(docId);
      console.log("#### Document ID Set ####: ", docId);
  
      // Send the OTP Code
      sendOTP();
  
      // Navigate to Confirm Code Screen after all operations have completed
      navigation.navigate("ConfirmCodeScreen", {
        phoneNumber: phoneNumber,
        expectedCode: expectedCode,
        firstDocID: docId,
      });
    } catch (error) {
      console.error("Error handling sign-in: ", error);
    }
  };
  

  const handleTermsAndConditions = () => {
    Linking.openURL("https://mile.ke");
  };

  return (
    <SafeAreaView style={tw`flex-1 justify-center items-center`}>
      <View style={tw`w-4/5`}>
        <Text style={tw`text-2xl font-bold text-center`}>
          Enter your Phone Number
        </Text>
        <View style={tw`border border-black rounded-sm mt-2`}>
          <TextInput
            style={tw`w-full px-4 py-2`}
            placeholder="+254 7** *** ***"
            onChangeText={(text) => setPhoneNumber(text)} // Update the state variable when the input changes
          />
        </View>
        <TouchableOpacity
          style={[tw`rounded-sm mt-4 px-4 py-2`, styles.customColor]}
          onPress={handleSignIn}
        >
          <Text style={tw`text-black text-lg text-center`}>Sign in</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`p-4 absolute bottom-0`}>
        <Text style={tw`text-sm text-gray-800`}>
          By creating an account or logging in, you agree to our{" "}
          <Text style={tw`underline`} onPress={handleTermsAndConditions}>
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text style={tw`underline`} onPress={handleTermsAndConditions}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  customColor: {
    backgroundColor: "#F5B800",
  },
});

export default SignUpScreen;