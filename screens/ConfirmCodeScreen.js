import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
// import { Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";

import { db, auth } from "../firebaseConfig";
import firebase from "firebase/compat/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";

import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../slices/userSlice";
import { setPerson, selectPerson } from "../slices/personSlice";

import { useNavigation } from "@react-navigation/native";

const ConfirmCodeScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const person = useSelector(selectPerson);

  const { phoneNumber, expectedCode, firstDocID } = route.params;
  const [code, setCode] = useState("");
  const [isValidCode, setIsValidCode] = useState(true);
  const [profile, setProfile] = useState([]);
  const [updateProfile, setUpdateProfile] = useState("");
  
  
  console.log("##*****## - ", firstDocID)


  const [errorMessage, setErrorMessage] = useState("");

  // Format Date Date and Time
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Month is 0-indexed
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDateTime;
  }

  // Check Whether the Document for Whom OTP is being Confirmed Exists,
  // Set Profile Data

  const handleSignIn = () => {
    // First check if OTP is Correct
    if (expectedCode == code) {
      console.log("The Code is Correct");

      // Check if authID exists for the given phone number
      const personRef = db
        .collection("drivers")
        .where("phone", "==", phoneNumber);

      personRef
        .get()
        .then((querySnapshot) => {
          // Get the first document's data
          const firstDocument = querySnapshot.docs[0];
          const firstDocumentData = firstDocument.data();

          if (firstDocumentData.email) {
            // This means the User Profile Exists
            // Add the document ID as a field in the data object
            firstDocumentData.id = firstDocument.id;

            console.log("User Data: ", firstDocumentData);

            // Set the profile state to the first document's data
            setProfile(firstDocumentData);
            setPerson(firstDocumentData);

            // Sign In With Email and Password
            auth
              .signInWithEmailAndPassword(
                firstDocumentData["email"],
                firstDocumentData["password"]
              )
              .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                console.log("USER ID: " + user.uid);

                console.log(
                  "Date Registered: " +
                    formatTimestamp(firstDocumentData["dateRegistered"])
                );

                // Dispatch to Person Store
                // Convert non-serializable values to serializable values

                const serializableData = {
                  ...firstDocumentData,
                  dateRegistered: formatTimestamp(
                    firstDocumentData["dateRegistered"]
                  ), // Convert Firestore Timestamp to milliseconds
                  otpDate: formatTimestamp(firstDocumentData["otpDate"]), // Convert Firestore Timestamp to milliseconds
                };
                dispatch(setPerson(serializableData));

                console.log("The Person: ", person);

                navigation.navigate('HomeScreen');
              })
              .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;

                console.log("Error: " + errorMessage);
              });
          } else {
            // This means the User Profile DOES NOT Exists

            console.log("No Documents Found in the Drivers Collection");
            setErrorMessage("No User Exists for that Phone Number");

            console.log("$$$$***#### - ", firstDocID)

            // Send the User to Update their Profile Info
            navigation.navigate("UpdateProfileScreen", {
              phoneNumber: phoneNumber, riderProfileID: firstDocID
            });
          }
        })
        .catch((error) => {
          console.error("Error querying documents:", error);
          setErrorMessage("Error querying documents:", error);
        });
    } else {
      setErrorMessage("The Code is Incorrect");
    }
  };

  const handleResendCode = () => {
    // Handle resend code logic
    console.log("Resend User Code");
  };

  return (
    <SafeAreaView style={tw`flex-1 px-4 pt-10`}>
      <View style={tw`flex-row items-center mb-5`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-outline"
            color="white"
            containerStyle={tw`bg-black p-2 rounded-full`}
          />
        </TouchableOpacity>
        <Text style={tw`text-xl ml-4 font-semibold`}>Enter 6 digit code</Text>
      </View>
      <Text style={tw`text-lg mb-2`}>
        Enter the 6 digit code sent to {phoneNumber}.
      </Text>
      <View style={tw`border border-black rounded-sm px-4 py-2 mb-2`}>
        <TextInput
          style={tw`w-full text-lg`}
          placeholder="Enter code"
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          onFocus={() => setIsValidCode(true)}
        />
      </View>
      {!isValidCode && (
        <Text style={tw`text-red-500 mb-2`}>You entered the wrong code</Text>
      )}
      <TouchableOpacity
        style={tw`bg-yellow-500 py-2 px-4 rounded-sm`}
        onPress={handleSignIn}
      >
        <Text style={tw`text-lg font-bold text-center text-black`}>Verify</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleResendCode}>
        <Text style={tw`text-lg font-bold text-center mt-4`}>Resend Code</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ConfirmCodeScreen;