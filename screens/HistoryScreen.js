import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
//import { Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

import { db, auth } from "../firebaseConfig";
import firebase from "firebase/compat/app";

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedButton, setSelectedButton] = useState(null);
  const [filteredRides, setFilteredRides] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRides, setTotalRides] = useState(0);

  const [ridesData, setRidesData] = useState([]);
  const [rideDateIDs, setRideDateIDs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Reusable function to format a Firestore Timestamp and return an object
  const formatTimestamp = (timestamp) => {
    // Convert Firestore Timestamp to JavaScript Date
    const date = timestamp.toDate();

    // Extract day of the week
    const dayOfWeekLong = date.toLocaleString("default", { weekday: "short" }); // Get day of the week as a short name
    const dayOfWeek = dayOfWeekLong.substring(0, 3);

    // Extract day, month, and year components
    const day = date.getDate();
    const month = date.getMonth() + 1; // Get the numeric month
    const year = date.getFullYear() % 100; // Get the last two digits of the year

    // Format the day, month, and year as strings without leading zeros
    const formattedDay = day < 10 ? `${day}` : day.toString();
    const formattedMonth = month.toString();
    const formattedYear = year < 10 ? `0${year}` : year.toString().slice(-2); // Get the last two digits of the year

    // Calculate the rideDateID
    const rideDateID = `${formattedMonth}${formattedDay}${formattedYear}`;

    return {
      id: rideDateID,
      rideDateID,
      rideMonth: formattedMonth,
      rideDay: formattedDay,
      rideDayOfWeek: dayOfWeek,
      rideYear: formattedYear,
    };
  };

  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
      }
    });

    // Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Get the current date
      const currentDate = new Date();
      // Calculate the first day of the current month
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      // Calculate the last day of the current month
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Fetch data from Firestore using the currentUser's UID and date filter
      const fetchData = async () => {
        try {
          const querySnapshot = await firebase
            .firestore()
            .collection("rides")
            .where("driverId", "==", currentUser.uid) // Use currentUser's UID
            .where("rideStatus", "==", "4") // Status for Completed Rides
            .where("dateCreated", ">=", firstDayOfMonth) // Filter rides with dateCreated >= first day of the month
            .where("dateCreated", "<=", lastDayOfMonth) // Filter rides with dateCreated <= last day of the month
            .get();

          const data = querySnapshot.docs.map((doc) => {
            // Include only the relevant data
            return {
              id: doc.id,
              totalFareBeforeDeduction: doc.data().totalFareBeforeDeduction,
              ...doc.data(),
            };
          });

          // Calculate totalRides as the count of filtered rides
          const totalRides = data.length;

          // Calculate totalEarned as the sum of totalFareBeforeDeduction for filtered rides
          const totalEarned = data.reduce(
            (acc, ride) => acc + ride.totalFareBeforeDeduction,
            0
          );

          // Set the state with totalRides and totalEarned
          setTotalRides(totalRides);
          setTotalEarned(totalEarned);

          console.log("Total Rides: ", totalRides);
          console.log("Total Earned: ", totalEarned);
        } catch (error) {
          console.error("Error fetching data from Firestore:", error);
        }
      };

      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      // Get the current date
      const currentDate = new Date();
      // Calculate the first day of the current month
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      // Calculate the last day of the current month
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // Fetch data from Firestore using the currentUser's UID
      const fetchData = async () => {
        try {
          const querySnapshot = await firebase
            .firestore()
            .collection("rides")
            .where("driverId", "==", currentUser.uid) // Use currentUser's UID
            .where("rideStatus", "==", "4") // Status for Completed Rides
            .where("dateCreated", ">=", firstDayOfMonth) // Filter rides with dateCreated >= first day of the monthy
            .where("dateCreated", "<=", lastDayOfMonth) // Filter rides with dateCreated <= last day of the month
            .get();

          const data = querySnapshot.docs.map((doc) => {
            const timestamp = doc.data()["dateCreated"];
            const formattedTimestamp = formatTimestamp(timestamp);

            return {
              id: doc.id,
              rideDateID: formattedTimestamp.rideDateID,
              rideMonth: formattedTimestamp.rideMonth,
              rideDay: formattedTimestamp.rideDay,
              rideDayOfWeek: formattedTimestamp.rideDayOfWeek,
              rideYear: formattedTimestamp.rideYear,
              ...doc.data(),
            };
          });

          setRidesData(data);

          // Create the rideDateIDs array from the fetched data
          const rideDateIDs = Array.from(
            new Set(data.map((ride) => ride.rideDateID))
          );
          setRideDateIDs(rideDateIDs);

          console.log("Rides Dates: ", rideDateIDs);
        } catch (error) {
          console.error("Error fetching data from Firestore:", error);
        }
      };

      fetchData();
    }
  }, [currentUser]); // Run this effect whenever currentUser changes

  const historyData = {
    rides: [
      {
        id: "1",
        date: "2023-05-11",
        rideDateID: 51123,
        rideMonth: "May",
        rideDay: "11",
        rideDayOfWeek: "Thu",
        rideYear: "2023",
        riderName: "John Murii",
        amountPaid: 270,
        kilometers: "8.5",
        pickupLocation: "Garden City Mall, Thika Road",
        dropoffLocation: "Allsops Stage, Thika Road",
        licensePlate: "KDL 222B",
        phoneNumber: "+254712345678",
      },
      {
        id: "2",
        date: "2023-05-13",
        rideDateID: 51323,
        rideMonth: "May",
        rideDay: "13",
        rideDayOfWeek: "Sat",
        rideYear: "2023",
        riderName: "Jane Njau",
        amountPaid: 180,
        kilometers: "5.2",
        pickupLocation: "Kencom Bus Stop, Moi Avenue",
        dropoffLocation: "Westlands Roundabout",
        licensePlate: "KAB 987C",
        phoneNumber: "+254712345679",
      },
      {
        id: "3",
        date: "2023-05-13",
        rideDateID: 51323,
        rideMonth: "May",
        rideDay: "13",
        rideDayOfWeek: "Sat",
        rideYear: "2023",
        riderName: "David Wangari",
        amountPaid: 900,
        kilometers: "3.8",
        pickupLocation: "Kenyatta National Hospital",
        dropoffLocation: "Upperhill, Ralph Bunche Road",
        licensePlate: "KBC 345D",
        phoneNumber: "+254712345680",
      },
      {
        id: "4",
        date: "2023-12-24",
        rideDateID: 122423,
        rideMonth: "Dec",
        rideDay: "24",
        rideDayOfWeek: "Sun",
        rideYear: "2023",
        riderName: "Mary Kamau",
        amountPaid: 650,
        kilometers: "2.5",
        pickupLocation: "The Junction Mall, Ngong Road",
        dropoffLocation: "Yaya Centre, Argwings Kodhek Road",
        licensePlate: "KDE 765F",
        phoneNumber: "+254712345681",
      },
      // Add more ride objects here...
    ],
  };

  function getRandomNumber() {
    return Math.floor(Math.random() * (75 - 20 + 1)) + 20;
  }

  function getRandomGender() {
    const genders = ["men", "women"];
    return genders[Math.floor(Math.random() * genders.length)];
  }

  const renderRideCard = (ride) => {
    return (
      <View key={ride.id} style={tw`bg-white p-4 mb-4`}>
        <View style={tw`flex-row items-center mb-2`}>
          <Image
            source={{
              uri: `https://randomuser.me/api/portraits/med/${getRandomGender()}/${getRandomNumber()}.jpg`,
            }}
            style={tw`w-16 h-16 rounded-lg`}
          />
          <Text style={tw`text-lg ml-2`}>{ride.riderName}</Text>
        </View>
        <Text style={tw`text-gray-900 text-lg font-bold mb-1`}>
          Kshs. {ride.totalFareBeforeDeduction}
        </Text>
        <Text style={tw`text-gray-900`}>
          {ride.rideTravelInformation[0]["distance"]["text"]}
        </Text>
        <View style={tw`border-t border-gray-300 mt-2 pt-2`}>
          <Text style={tw`text-gray-400`}>PICK UP</Text>
          <Text style={tw`text-gray-900 font-bold text-lg`}>
            {ride.rideOrigin[0]["description"]}
          </Text>
          <Text style={tw`text-gray-400 mt-2`}>DROP OFF</Text>
          <Text style={tw`text-gray-900 font-bold text-lg`}>
            {ride.rideDestination[0]["description"]}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    let ridesToRender = [];
    let totalEarnings = 0;

    if (selectedButton) {
      ridesToRender = historyData.rides.filter(
        (ride) => ride.rideDateID === selectedButton
      );
    } else {
      ridesToRender = historyData.rides;
    }

    totalEarnings = ridesToRender.reduce(
      (sum, ride) => sum + ride.amountPaid,
      0
    );

    setFilteredRides(ridesToRender); // Update filtered rides state
    setTotalEarned(totalEarnings); // Update total earned state
  }, [selectedButton]);

  const totalJobs = filteredRides.length;

  return (
    <View style={tw`flex-1 bg-white `}>
      <View style={tw`pt-10 px-4`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="menu-outline" color="black" size={24} />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold`}>History</Text>
          <View style={tw`w-6`} />
        </View>
      </View>

      <ScrollView style={tw`flex-1 bg-gray-100`}>
        <View style={tw`flex-row pt-4 px-4`}>
          <View style={[tw`flex-1 bg-yellow-400 rounded-sm p-4 mr-2`]}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="car-outline" color="black" size={24} />
            </View>
            <Text style={tw`text-gray-800 text-sm`}>
              {"Total Jobs   (Month)"}
            </Text>
            <Text style={tw`text-gray-800 text-xl font-bold`}>
              {totalRides}
            </Text>
          </View>
          <View style={[tw`flex-1 bg-yellow-600 rounded-sm p-4 ml-2`]}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons
                name="cash-outline"
                color="black"
                size={24}
              />
            </View>
            <Text style={tw`text-gray-800 text-sm`}>
              {"Earned Cash (Month)"}
            </Text>
            <Text style={tw`text-gray-800 text-xl font-bold`}>
              Kshs. {totalEarned}
            </Text>
          </View>
        </View>

        {/* Rides History */}
        <View style={tw`py-4`}>
          {ridesData.map((ride) => renderRideCard(ride))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
