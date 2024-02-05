import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useRef } from "react";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";
import tw from "tailwind-react-native-classnames";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";


import {
  selectDestination,
  selectOrigin,
  setTravelTimeInformation,
} from "../slices/navSlice";

import MapViewDirections from "react-native-maps-directions";
import { db, auth } from "../firebaseConfig"; // Import your Firebase config
import firebase from "firebase/compat/app";
// import { GOOGLE_MAPS_APIKEY } from "@env"; #Remember to correct this later

const markerImage = require("../assets/taxi-marker.png");

// This API KEY is declared in the most unprofessional manner, correct it later
const GOOGLE_MAPS_APIKEY = "AIzaSyD0kPJKSOU4qtXrvddyAZFHeXQY2LMrz_M";

const PickUpScreen = ({ route }) => {
  const navigation = useNavigation();
  const { ride } = route.params;

  const origin = ride?.rideOrigin?.[0];
  const destination = ride?.rideDestination?.[0];

  /*
  const origin = {
    description: "TRM - Thika Road Mall, Nairobi, Kenya",
    location: { lat: -1.2195761, lng: 36.88842440000001 },
  };
  const destination = {
    description: "Quickmart - Thindigua, Kiambu, Kenya",
    location: { lat: -1.2022673, lng: 36.83306879999999 },
  };
  */

  const mapRef = useRef(null);
  const dispatch = useDispatch();

  // Use the useSelector hook to select the data from the currentRideSlice
  const currentRideData = useSelector((state) => state.currentRide);


  const handleStartRide = () => {
    // Get the ride ID
    const rideId = ride.id;
    const rideData = ride;

    // Update Firestore document
    db.collection("rides")
      .doc(rideId)
      .update({
        rideStatus: "3",
      })
      .then(() => {
        console.log("Ride Status Changed: In Progress");
        // Now, navigate to OneRequestScreen
        navigation.navigate("RideInProgressScreen", { ride: rideData });
      })
      .catch((error) => {
        console.error("Error updating ride status:", error);
      });
  };

  return (
    <SafeAreaView style={tw`pt-10 flex-1`}>
      <View style={tw`flex-row items-center justify-between mb-5 px-6`}>
        <TouchableOpacity onPress={() => navigation.navigate("MenuScreen")}>
          <Ionicons name="menu-outline" color="black" size={24} />
        </TouchableOpacity>
        <Text style={tw`font-bold text-base`}>
          Pick Up
        </Text>
      </View>

      <SafeAreaView style={tw`bg-white h-1/4`}>
        <View style={tw`px-4 py-2`}>
          <Text style={tw`uppercase text-sm text-gray-400 font-bold`}>
            PICK UP AT
          </Text>
          <Text style={tw`text-gray-900 text-lg`}>
            {currentRideData?.currentRide?.rideOrigin?.[0]?.description || 'Origin not available'}
          </Text>
        </View>
        <View style={tw`p-5`}>
          <TouchableOpacity
            style={tw`p-4 bg-yellow-500 justify-center items-center`}
            onPress={handleStartRide}
          >
            <Text style={tw`text-gray-900 font-bold text-xl`}>START RIDE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  marker: {
    position: "absolute",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerImage: {
    width: 20,
    height: 55,
    transform: [{ rotate: "165deg" }],
  },
});

export default PickUpScreen;
