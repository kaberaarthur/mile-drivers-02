import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
// import { Icon } from "react-native-elements";
import tw from "tailwind-react-native-classnames";
import * as ImagePicker from "expo-image-picker";

import { useNavigation } from "@react-navigation/native";

import { db, auth } from "../firebaseConfig";
import firebase from "firebase/compat/app";
import { setUser } from "../slices/userSlice";
import { setPerson } from "../slices/personSlice";

const UpdateProfileScreen = ({ navigation, route }) => {
  // const navigation = useNavigation();
  const dispatch = useDispatch();

  const { phoneNumber, riderProfileID } = route.params;
  const [profilePicture, setProfilePicture] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [riderName, setRiderName] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  // const [riderProfileID, setRiderProfileID] = useState(0);
  const [updatedProfile, setUpdatedProfile] = useState(0);
  const [authID, setAuthID] = useState(0);
  const [lastNumber, setLastNumber] = useState(0);
  const [generatedPassword, setGeneratedPassword] = useState(0);

  const [downloadURL, setDownloadURL] = useState("");
  const [iDFileName, setIDFileName] = useState("");
  const [imageError, setImageError] = useState("");


  // Check if User Has Been Created
  const [userCreated, setUserCreated] = useState(false);

  console.log("####### Rider Profile ID ######: ", riderProfileID)

  // Generate a Random Password
  function generatePassword() {
    const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialCharacters = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let password = "";

    // Randomly select one character from each category
    password +=
      uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
    password +=
      lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password +=
      specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

    // Generate remaining characters randomly
    const remainingLength = 7 - password.length;
    for (let i = 0; i < remainingLength; i++) {
      const allCharacters =
        uppercaseLetters + lowercaseLetters + numbers + specialCharacters;
      password +=
        allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    // Shuffle the password characters
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    return password;
  }

  const handleProfilePictureUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!imageResult.canceled) {
      setProfilePicture(imageResult.assets[0].uri);
    }
  };

  // New Photo Upload Function
  const handlePhotoUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();

    if (!pickerResult.canceled) {
      const imageUri = pickerResult.assets[0].uri;
      const userUid = phoneNumber;
      const timestamp = new Date().getTime();

      // Extract file extension from the image's URI
      const fileExtension = imageUri.split(".").pop();
      const filename = `${userUid}-${timestamp}-nid.${fileExtension}`;

      setPhoto(pickerResult.assets[0].uri);
      setProfilePicture(pickerResult.assets[0].uri);
      setIDFileName(filename);
      console.log("File Name: " + filename);

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storageRef = firebase
        .storage()
        .ref()
        .child(`documents/driver-profile-pictures/${filename}`);

      try {
        await storageRef.put(blob);
        console.log("Image uploaded successfully");

        // Get the download URL of the uploaded file
        const downloadLink = await storageRef.getDownloadURL();
        console.log("Download Link:", downloadLink);

        // Now you can use the downloadURL as needed, for example, store it in a state
        setDownloadURL(downloadLink);
      } catch (error) {
        console.error("Error uploading image: ", error);
        setImageError(error.message);
      }
    }
  };

  useEffect(() => {
    // Generate the Password
    setGeneratedPassword(generatePassword());
  }, []);

  useEffect(() => {
    console.log("Generated Password: " + generatedPassword);
  }, [generatedPassword]);

  const handleSubmit = async () => {
    try {
      // Create Firebase User
      auth
        .createUserWithEmailAndPassword(riderEmail, generatedPassword)
        .then((userCredential) => {
          var user = userCredential.user;
          console.log("New User: " + user.uid);
          setAuthID(user.uid);
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("Error Creating User: " + errorMessage);
        });


      // Call the function that needs the updated riderProfileID
      var theRiderRef = db.collection("drivers").doc(riderProfileID);

      const newDriverData = {
        email: riderEmail,
        name: riderName,
        password: generatedPassword,
        authID: riderProfileID,
        activeUser: false,
        partnerCode: lastNumber,
        referralCode: "",
        profilePicture: downloadURL,
        rating: "5.0"
      };

      theRiderRef
        .update(newDriverData)
        .then(() => {
          console.log("Rider Profile Updated Now!");
          setUserCreated(true);

          // Change dateRegistered to String
          const updatedDateRegistered = rideData.dateRegistered.toDate().toISOString();

          // Update the dateCreated field in the document data
          const updatedDriverData = {
            ...newDriverData,
            dateRegistered: updatedDateRegistered,
          };


          dispatch(setPerson(updatedDriverData));
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    } catch (error) {
      console.log("Error getting Driver documents: ", error);
    }
  };

  /*
  useEffect(() => {
    if (riderProfileID && generatedPassword) {
      auth
        .createUserWithEmailAndPassword(riderEmail, generatedPassword)
        .then((userCredential) => {
          var user = userCredential.user;
          console.log("New User: " + user.uid);
          setAuthID(user.uid);
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("Error Creating User: " + errorMessage);
        });
    }
  }, [riderProfileID, generatedPassword]); // Run when both riderProfileID and generatedPassword change
  */

  // Create a combination of two items, day of the Week and Milliseconds
  const getDayAndTime = () => {
    // Create a Date object for the current time
    const now = new Date();

    // Map days of the week to letters
    const days = ["S", "M", "T", "W", "T", "F", "S"];

    // Get the current day of the week as a letter
    const dayLetter = days[now.getDay()];

    // Get the current time in milliseconds, convert to string and take the first two digits
    const timeDigits = Math.floor(Math.random() * 90) + 10;

    // Return the result
    return dayLetter + timeDigits;
  };

  // Get the lastNumber in the lastPartnerCode Collection
  // The lastNumber will be used in creating the partnerCode
  useEffect(() => {
    if (authID) {
      const docRef = db
        .collection("lastPartnerCode")
        .doc("sz9CX7al5MgsvGsvaRYM");
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const newNumber = doc.data().lastNumber + 1;
            const newNumberString = newNumber.toString();
            const newCode = "MTL" + getDayAndTime() + newNumberString;
            console.log("Partner Code:", newCode);

            setLastNumber(newCode);

            // Updating the lastNumber field in the document
            docRef
              .update({
                lastNumber: newNumber,
              })
              .then(() => {
                console.log("lastNumber successfully updated!");
              })
              .catch((error) => {
                console.error("Error updating lastNumber: ", error);
              });
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting lastNumber document:", error);
        });
    }
  }, [authID]);

  /*
  // Update the User Profile Document
  useEffect(() => {
    if (lastNumber) {
      // Call the function that needs the updated riderProfileID
      var theRiderRef = db.collection("drivers").doc(riderProfileID);

      const newDriverData = {
        email: riderEmail,
        name: riderName,
        password: generatedPassword,
        authID: authID,
        activeUser: false,
        partnerCode: lastNumber,
        referralCode: "",
        profilePicture: downloadURL,
      };

      theRiderRef
        .update(newDriverData)
        .then(() => {
          console.log("Rider Profile Updated Now!");
          setUserCreated(true);
          dispatch(setPerson(newDriverData));
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
  }, [lastNumber, dispatch]);
  */

  // Check if AuthID is Set
  useEffect(() => {
    if (authID) {
      console.log("Generated AuthID: " + authID);
    }
  }, [authID]);

  useEffect(() => {
    if (userCreated == true) {
      // Get the Document Data
      var docRef = db.collection("drivers").doc(riderProfileID);

      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            console.log("The Profile data:", doc.data());
            const theProfileData = doc.data();
            const updatedOtpDate = theProfileData.otpDate.toDate().toISOString();
            const updatedDateRegistered = theProfileData.dateRegistered.toDate().toISOString();

            const updatedProfileData = {
              ...theProfileData,
              otpDate: updatedOtpDate,
              dateRegistered: updatedDateRegistered,
            };

            // Store the Person to the Person Store
            dispatch(setPerson(updatedProfileData));
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });

      // Navigate to Home Screen
      navigation.navigate("HomeScreen");
    }
  }, [userCreated]);

  return (
    <SafeAreaView style={tw`flex-1 px-4 pt-10`}>
      {/* Header */}
      <View style={tw`flex-row items-center mb-5`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          
        </TouchableOpacity>
        <Text style={tw`text-xl ml-4 font-semibold`}>
          Enter Profile Details
        </Text>
      </View>

      {/* Profile Picture */}
      <TouchableOpacity
        style={tw`flex items-center justify-center`}
        onPress={handlePhotoUpload}
      >
        {profilePicture ? (
          <Image
            source={{ uri: profilePicture }}
            style={tw`w-40 h-40 rounded-full`}
          />
        ) : (
          <View
            style={tw`w-40 h-40 bg-gray-300 rounded-full items-center justify-center`}
          >
          </View>
        )}
      </TouchableOpacity>

      {/* Name Input */}
      <View style={tw`bg-gray-200 rounded-sm p-4 my-4 border border-gray-900`}>
        <TextInput
          style={tw`text-black`}
          placeholder="Enter your Full Name"
          placeholderTextColor="gray"
          value={riderName}
          onChangeText={setRiderName}
        />
      </View>

      {/* Email Address Input */}
      <View style={tw`bg-gray-200 rounded-sm p-4 my-4 border border-gray-900`}>
        <TextInput
          style={tw`text-black`}
          placeholder="Enter your Email Address"
          placeholderTextColor="gray"
          value={riderEmail}
          onChangeText={setRiderEmail}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={tw`bg-yellow-500 rounded-sm py-4 px-8 justify-center items-center`}
        onPress={handleSubmit}
      >
        <Text style={tw`text-gray-900 text-lg font-semibold`}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UpdateProfileScreen;
