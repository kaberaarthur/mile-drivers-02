import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { db, auth } from "../firebaseConfig";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

import { ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { selectPerson, setPerson } from "../slices/personSlice";

const DrivingLicenseScreen = () => {
  const navigation = useNavigation();
  const [photo, setPhoto] = useState("");
  const [licenseFileName, setLicenseFileName] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const person = useSelector(selectPerson);
  console.log("Driving License Person: ", person)

  const handleGoBack = () => {
    navigation.goBack();
  };

  /*

  const handlePhotoUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();

    if (!pickerResult.canceled) {
      setPhoto(pickerResult.assets[0].uri);
    }
  };
  */

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
      const userUid = person.authID;
      const timestamp = new Date().getTime();

      // Extract file extension from the image's URI
      const fileExtension = imageUri.split(".").pop();
      const filename = `${userUid}-${timestamp}-lc.${fileExtension}`;

      setPhoto(pickerResult.assets[0].uri);
      setLicenseFileName(filename);
      console.log("File Name: " + filename);

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storageRef = firebase
        .storage()
        .ref()
        .child(`documents/license/${filename}`);

      try {
        await storageRef.put(blob);
        console.log("Image uploaded successfully");

        // Get the download URL of the uploaded file
        const downloadURL = await storageRef.getDownloadURL();
        console.log("Download URL:", downloadURL);

        // Now you can use the downloadURL as needed, for example, store it in a state
        setDownloadURL(downloadURL);
      } catch (error) {
        console.error("Error uploading image: ", error);
        setImageError(error.message);
      }
    }
  };

  /*
  const handleSubmit = () => {
    console.log("Selected photo:", photo);
    console.log("License Number:", licenseNumber);
    console.log("Expiration Date:", expirationDate);
    console.log("License Download URL:", downloadURL);

    setModalVisible(true);
  };
  */

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("Selected photo:", photo);
    console.log("License Number:", licenseNumber);
    console.log("Expiration Date:", expirationDate);
    console.log("License Download URL:", downloadURL);

    if (!downloadURL) {
      setImageError("You have not uploaded your license card");
      return;
    }

    const userUid = person.authID;

    try {
      const docRef = db.collection("drivingLicense").doc(userUid);

      // Use server timestamp for dateUploaded
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();

      // Create or update the document
      await docRef.set(
        {
          approved: false,
          dateUploaded: timestamp,
          downloadURL: downloadURL,
          licenseNumber: licenseNumber,
          expirationDate: expirationDate,
        },
        { merge: true } // This will merge new values with existing ones if the document already exists
      );

      console.log("Document created/updated successfully");
      setIsLoading(false);
      setModalVisible(true);
    } catch (error) {
      console.error("Error creating/updating document: ", error);
    }
  };

  const handleModalOk = () => {
    setModalVisible(false);
    navigation.goBack(); // Go back to the Document Management Screen
  };

  return (
    <View style={[tw`flex-1 bg-white`, tw`py-10`]}>
      <View style={tw`bg-white items-center`}>
        <Text style={tw`text-xl font-bold`}>Driving License</Text>
        <TouchableOpacity onPress={handleGoBack} style={tw`absolute left-3`}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
      </View>

      <View style={tw`bg-gray-100 flex-1`}>
        <TouchableOpacity
          style={tw`bg-white rounded-md mx-4 my-4 p-4`}
          onPress={handlePhotoUpload}
        >
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={tw`w-full h-40 rounded-md`}
              resizeMode="cover"
            />
          ) : (
            <View
              style={tw`flex-row items-center justify-center h-40 bg-yellow-600 rounded-md mb-4`}
            />
          )}
          <Text style={tw`text-lg font-semibold mt-2`}>
            {photo ? "Update Photo" : "Upload Photo"}
          </Text>
        </TouchableOpacity>

        <View style={tw`bg-white rounded-md mx-4 my-4 p-4`}>
          <View>
            <Text style={tw`text-sm font-semibold mb-1`}>LICENSE NUMBER</Text>
            <TextInput
              style={tw`bg-white p-2 border border-gray-300 rounded`}
              placeholder="DL-0000001"
              onChangeText={setLicenseNumber}
              value={licenseNumber}
            />
          </View>

          <View style={tw`mt-4`}>
            <Text style={tw`text-sm font-semibold mb-1`}>EXPIRATION DATE</Text>
            <View style={tw`mt-4 flex-row`}>
              <TextInput
                style={tw`bg-white p-2 border border-gray-300 rounded flex-1 mr-2`}
                placeholder="DD"
                onChangeText={(day) =>
                  setExpirationDate((prevDate) => ({ ...prevDate, day }))
                }
                value={expirationDate.day}
                keyboardType="number-pad"
              />
              <TextInput
                style={tw`bg-white p-2 border border-gray-300 rounded flex-1 mr-2`}
                placeholder="MM"
                onChangeText={(month) =>
                  setExpirationDate((prevDate) => ({ ...prevDate, month }))
                }
                value={expirationDate.month}
                keyboardType="number-pad"
              />
              <TextInput
                style={tw`bg-white p-2 border border-gray-300 rounded flex-1`}
                placeholder="YYYY"
                onChangeText={(year) =>
                  setExpirationDate((prevDate) => ({ ...prevDate, year }))
                }
                value={expirationDate.year}
                keyboardType="number-pad"
              />
            </View>
            {/* Implement the calendar functionality here */}
          </View>
          <View style={tw`mt-4`}>
            <Text style={tw`text-red-600 text-sm font-semibold`}>
              {imageError}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={tw`bg-yellow-500 mx-4 my-4 p-4 rounded-md items-center`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#030813" />
          ) : (
            <Text style={tw`text-gray-900 text-lg font-semibold`}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal animationType="fade" transparent visible={isModalVisible}>
        <View
          style={tw`flex-1 justify-center items-center bg-gray-800 bg-opacity-50`}
        >
          <View style={tw`bg-white p-6 rounded-md`}>
            <Text style={tw`text-lg text-center mb-4`}>
              We are processing your approval, you shall be notified by email
              once we are through.
            </Text>
            <Button title="OK" onPress={handleModalOk} color="#FBBF24" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DrivingLicenseScreen;
