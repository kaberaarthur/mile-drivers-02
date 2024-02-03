import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
} from "react-native";
//import { Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

import { db, auth } from "../firebaseConfig";
import firebase from "firebase/compat/app";

const AddVehicleDocumentsScreen = () => {
  const route = useRoute();
  const { vehicleID } = route.params;
  const navigation = useNavigation();

  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleError, setVehicleError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reference to the Firestore document with the given vehicleID
    const vehicleRef = db.collection("vehicles").doc(vehicleID);

    // Fetch the document and update the state with the data
    vehicleRef.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        setVehicleData(docSnapshot.data());
        console.log("Vehicle Data", docSnapshot.data());
      } else {
        console.log(`Document with ID ${vehicleID} not found.`);
        setVehicleError(`Document with ID ${vehicleID} not found.`);
      }
    });
  }, [vehicleID]);

  const handleAddLogBook = () => {
    console.log("Logbook added!");
  };

  const handleAddPhotos = () => {
    console.log("Add Photos Now!");
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <View
        style={tw`pt-10 px-4 flex-row items-center justify-between mb-4 bg-white`}
      >
        <Ionicons
          name="arrow-back"
          color="black"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={tw`text-lg font-bold`}>Vehicle Management</Text>
        <View style={tw`w-6`} />
      </View>
      {vehicleError ? (
        <Text style={tw`pt-2 px-2 text-red-600 font-semibold`}>
          Error: {vehicleError}
        </Text>
      ) : (
        <>
          {vehicleData && ( // Check if vehicleData is not null
            <Text style={tw`pt-2 px-2 font-semibold`}>
              Vehicle:{" "}
              {vehicleData["brand"] +
                " " +
                vehicleData["model"] +
                " " +
                vehicleData["year"] +
                " " +
                vehicleData["licensePlate"]}
            </Text>
          )}
        </>
      )}
      <View style={tw`px-6 pt-4`}>
        <TouchableOpacity
          style={tw`bg-yellow-500 p-4 rounded-sm items-center`}
          onPress={handleAddPhotos}
        >
          <Text style={tw` px-2 font-bold text-lg rounded-sm`}>Add Photos</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`px-6 pt-4`}>
        <TouchableOpacity
          style={tw`bg-yellow-500 p-4 rounded-sm items-center`}
          onPress={handleAddLogBook}
        >
          <Text style={tw` px-2 font-bold text-lg rounded-sm`}>
            Add Log Book
          </Text>
        </TouchableOpacity>
      </View>
      <View style={tw`px-6 pt-4`}>
        <Text style={tw` px-2 font-bold text-lg rounded-sm`}>
          Make sure all uploads are clear and readable. Ensure the Vehicle
          number plate is clear and readable on atleast one of your photos.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AddVehicleDocumentsScreen;
