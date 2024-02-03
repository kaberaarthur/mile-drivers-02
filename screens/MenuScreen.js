import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
// import { Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../slices/userSlice";
import { selectPerson, setPerson } from "../slices/personSlice";
import { selectCurrentRide, setCurrentRide } from "../slices/currentRideSlice"; // Update this path based on where your currentRideSlice isi located


import { db, auth } from "../firebaseConfig"; 
import AsyncStorage from '@react-native-async-storage/async-storage';

function MenuScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const person = useSelector(selectPerson);
  const [loading, setLoading] = useState(true);
  const [goingRide, setGoingRide] = useState(false);

  // Check if there is a ride in progress
  useEffect(() => {
    // Make sure person is loaded before proceeding
    if (person) {
      const fetchData = async () => {
        try {
          // Assuming you're using Firebase Firestore, replace with your database logic
          const ridesRef = db.collection('rides');
          const query = ridesRef
            .where('rideStatus', '==', '3')
            .where('driverId', '==', person.authID)
            .orderBy('dateCreated', 'desc')
            .limit(1);

          const snapshot = await query.get();

          if (!snapshot.empty) {
            const rideData = snapshot.docs[0].data();
            const updatedDateCreated = rideData.dateCreated.toDate().toISOString();

            // Update the dateCreated field in the document data
            const updatedRideData = {
              ...rideData,
              dateCreated: updatedDateCreated,
            };

            // Dispatch the new data to your Redux action
            dispatch(setCurrentRide(updatedRideData));

            // Set goingRide to true
            setGoingRide(true);
          }
        } catch (error) {
          console.error('Error fetching ride data:', error);
        }
      };

      fetchData();
    }
  }, [dispatch, person]);
  


  console.log("Person Data:", person["otpDate"]);

  // Use useSelector hook to select the data from the currentRideSlice
  const currentRideData = useSelector((state) => state.currentRide);
  console.log("The Current Ride: ", currentRideData)

  if (Object.keys(currentRideData).length > 0) {
    console.log("Current Ride Data is Populated")
    console.log("My Ride", currentRideData)
  } else {
    console.log("Current Ride Data is Empty")
  }


  const userData = {
    name: "John Doe",
    rating: "4.7",
  };

  const handleEditProfile = () => {
    // This function will be used to handle profile editing
    console.log("Edit Profile Clicked");
    navigation.navigate("EditProfileScreen");
  };

  const menuItems = [

    {
      name: "Notifications", 
      icon: "notifications",
      screen: "NotificationScreen",
    },

    {
      name: "Vehicle Management", 
      icon: "car",
      screen: "VehicleManagementScreen",
    },

    {
      name: "Document Management", 
      icon: "documents",
      screen: "DocumentManagementScreen",
    },

    {
      name: "Finances", 
      icon: "cash",
      screen: "FinanceScreen",
    },
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Additional cleanup or navigation logic can be added here
      console.log('User logged out successfully');
      navigation.navigate('SignUpScreen');
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle errors as needed
    }
  };

  return (
    <SafeAreaView style={tw`pt-10 px-6 flex-1 bg-white`}>
      <View style={tw`flex-row items-center justify-between mb-5`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          
        </TouchableOpacity>
        <Text style={tw`text-xl font-semibold`}>Menu</Text>
        <View style={tw`w-8`} />
      </View>

      <View style={tw`flex-row mb-8`}>
        <Image
          style={tw`w-24 h-24 rounded-full`}
          source={{ uri: person["profilePicture"] }} 
          // source={{ uri: "https://firebasestorage.googleapis.com/v0/b/mile-cab-app.appspot.com/o/documents%2Flicense%2F3tzxbg6yOyQEcVFRmj3JNlEKVRg1-1706993781149-lc.jpeg?alt=media&token=a2779e39-709f-4a3f-8681-eaf9fdbecd32" }}
          // source={{ uri: "https://via.placeholder.com/100" }} // Replace with actual profile picture URL
        />
        <View style={tw`ml-4 pl-8`}>
          <Text style={tw`text-xl font-bold mb-2`}>{person["name"]}</Text>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-lg ml-2 mb-2`}>Rating: {person["rating"]}</Text>
          </View>
        </View>
      </View>
      <View style={tw`h-0.5 bg-gray-400 mb-8`} />
      <ScrollView>
        {menuItems.map((item, index) => (
            // Render menu items
            <TouchableOpacity
              key={index}
              style={tw`flex-row items-center mb-5`}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View
                style={[tw`p-2 rounded-full`, { backgroundColor: "#F5B800" }]}
              >
                <Ionicons
                  name={item.icon}
                  color="#45474B"
                  size={24}
                />
              </View>
              <Text style={tw`ml-4 text-lg`}>{item.name}</Text>
            </TouchableOpacity>
        ))}

        {goingRide && (
          <TouchableOpacity
            style={{ paddingVertical: 5, paddingHorizontal: 5, backgroundColor: '#F5B800', marginBottom: 10 }}
            onPress={() => navigation.navigate("RideInProgressScreen", { ride: currentRideData })}
          >
            <Text style={tw`text-lg text-center font-bold text-gray-700`}>Ride in Progress</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={{ paddingVertical: 5, paddingHorizontal: 5, backgroundColor: '#b91c1c' }}
          onPress={() => handleLogout()}
        >
          <Text style={tw`text-lg text-center font-bold text-white`}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      
    </SafeAreaView>
  );
}

export default MenuScreen;

const styles = StyleSheet.create({
  customColor: {
    backgroundColor: "#F5B800",
  },
});
