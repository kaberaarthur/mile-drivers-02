import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Icon } from "react-native-elements";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../slices/userSlice";
import { selectPerson, setPerson } from "../slices/personSlice";
import { selectVehicle, setVehicle } from "../slices/vehicleSlice";
import { db, auth } from "../firebaseConfig"; // Import your Firebase config
import firebase from "firebase/compat/app";

import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a Custom Avatar
const CircularAvatar = ({ firstName }) => {
  const generateRandomColor = () => {
    const colors = ['#f5b505', '#08700a', '#040e91', '#910423']; // Add more colors as needed
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  const randomColor = generateRandomColor();

  return (
    <View style={[tw`w-10 h-10 rounded-full`, { backgroundColor: randomColor }]}>
      <Text style={tw`text-lg font-bold text-white text-center`}>
        {firstName.charAt(0)}
      </Text>
    </View>
  );
};


const RequestCard = ({ request, onAcceptRequest }) => {
  const firstName = request.riderName.split(" ")[0];
  const navigation = useNavigation();

  function roundToNearestTen(num) {
    return Math.round(num / 10) * 10;
  }

  return (
    <View style={tw`bg-white rounded-sm p-4 mb-4 pb-2`}>
      <View style={tw`pt-4`}></View>
      <View style={tw`flex-row justify-between items-center `}>
        <View style={tw`flex-row items-center`}>
          {request.riderAvatar ? (
            <Image
              style={tw`w-10 h-10 rounded-full mr-2`}
              source={{ uri: request.riderAvatar }}
            />
          ) : (
            <CircularAvatar firstName={firstName} />
          )}
          <Text style={tw`text-lg font-bold pl-2`}>{firstName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={tw`bg-black rounded-sm p-2 mt-4`}
        onPress={() => onAcceptRequest(request)}
      >
        <Text style={tw`text-center text-white font-bold`}>Accept Request</Text>
      </TouchableOpacity>
      <View style={tw`pb-4`}></View>
    </View>
  );
};


const HomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const user = useSelector(selectUser);
  const person = useSelector(selectPerson);
  const dispatch = useDispatch();

  const handleAcceptRequest = (selectedRequest) => {
    // Get the ride ID
    const rideId = selectedRequest.id;
  
    // Update Firestore document
    db.collection("rides")
      .doc(rideId)
      .update({
        rideStatus: "2",
        driverId: person.authID,
        driverName: person.name,
        driverPhone: person.phone,
        driverRating: person.rating,
      })
      .then(() => {
        console.log("Ride status updated to 2");
        // Now, navigate to OneRequestScreen
        navigation.navigate("OneRequestScreen", { ride: selectedRequest });
      })
      .catch((error) => {
        console.error("Error updating ride status:", error);
      });
  };
  

  const getDriverVehicleByAuthID = async (authID) => {
    try {
      const vehiclesCollection = db.collection('vehicles');
      const querySnapshot = await vehiclesCollection.where('owner', '==', authID).get();

      if (querySnapshot.empty) {
        console.log('No matching vehicles for authID:', authID);
        return null;
      } else {
        const vehicleData = querySnapshot.docs[0].data();
        delete vehicleData.dateCreated;

        dispatch(setVehicle(vehicleData));

        console.log("########## Vehicle Data: ", vehicleData)
      }

    } catch (error) {
      console.error('Error getting driver vehicle data:', error);
      throw error;
    }
  };

  const getDriverByUid = async (uid) => {
    try {
      const driversCollection = db.collection('drivers');
      const querySnapshot = await driversCollection.where('email', '==', uid).get();

      if (querySnapshot.empty) {
        console.log('No matching documents.');
        return null;
      }

      const driverDocument = querySnapshot.docs[0].data();
      console.log('Driver Document:', driverDocument);

      if (driverDocument) {
        
        
        // Convert otpDate and dateRegistered
        const updatedOtpDate = driverDocument.otpDate.toDate().toISOString();
        const updatedDateRegistered = driverDocument.dateRegistered.toDate().toISOString();

        // Create a new object with updated fields
        const updatedDriverDocument = {
          ...driverDocument,
          otpDate: updatedOtpDate,
          dateRegistered: updatedDateRegistered,
        };

        dispatch(setPerson(updatedDriverDocument));
        console.log("######## Updated Driver: ", updatedDriverDocument)

        // getDriverVehicleByAuthID(driverDocument.authID);
      }

      return driverDocument;
    } catch (error) {
      console.error('Error getting driver document:', error);
      throw error;
    }
  };

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

          getDriverByUid(parsedUser.email)
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
          } else if (!storedUser) {
            // No user in storage and no authUser; direct to SignUpScreen
            console.log("No User Detected - Redirecting to SignUpScreen");
            navigation.navigate('SignUpScreen');
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
  }, [dispatch, navigation]); // Ensure dependencies are listed if they're used inside the effect
  
  

  const [driver, setDriver] = useState({
    isOnline: true,
  });

  const [newRides, setNewRides] = useState([]);

  const fetchData = () => {
    const db = firebase.firestore();
    const query = db.collection("rides").where("rideStatus", "==", "1");

    const unsubscribe = query.onSnapshot((querySnapshot) => {
      const updatedRides = [];
      querySnapshot.forEach((doc) => {
        updatedRides.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setNewRides(updatedRides);

      console.log("New Rides: ", updatedRides);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = () => {
    setDriver((prevDriver) => ({
      ...prevDriver,
      isOnline: !prevDriver.isOnline,
    }));
  };

  return (
    <SafeAreaView style={tw`pt-10 flex-1`}>
      <View style={tw`flex-row items-center justify-between mb-5 px-6`}>
        <TouchableOpacity onPress={() => navigation.navigate("MenuScreen")}>
          <Icon type="ionicon" name="menu-outline" color="black" size={24} />
        </TouchableOpacity>
        <Text style={tw`font-bold text-base`}>
          {driver.isOnline ? "Online" : "Offline"}
        </Text>
        <TouchableOpacity onPress={handleToggleStatus}>
          <Icon
            type="font-awesome"
            name={driver.isOnline ? "toggle-on" : "toggle-off"}
            color="black"
            size={24}
          />
        </TouchableOpacity>
      </View>

      <View style={tw`${driver.isOnline ? "bg-yellow-500" : "bg-gray-500"} p-4`}>
        {driver.isOnline ? (
          <Text style={tw`text-black font-bold`}>
            You have{" "}
            {newRides.length === 1
              ? "1 new request"
              : `${newRides.length} new requests`}
            .
          </Text>
        ) : (
          <View style={tw`flex-row items-center`}>
            <Icon type="ionicon" name="moon-outline" color="white" size={24} />
            <View style={tw`pl-2`}>
              <Text style={tw`text-white font-bold`}>You are offline !</Text>
              <Text style={tw`text-white`}>
                Go online to start accepting jobs.
              </Text>
            </View>
          </View>
        )}
      </View>

      {newRides.length > 0 ? (
        <FlatList
          data={newRides}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onAcceptRequest={() => handleAcceptRequest(item)}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={tw`p-4`}
        />
      ) : (
        <Text style={tw`text-center mt-4 text-gray-500`}>
          No new requests at the moment.
        </Text>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
