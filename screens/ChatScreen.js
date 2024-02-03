import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
// import { Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebaseConfig"; // Import your Firebase config
import firebase from "firebase/compat/app";

const ChatScreen = ({ route }) => {
  const navigation = useNavigation(); // Access the navigation object
  const { ride } = route.params; // Access data about the ride
  const [messageText, setMessageText] = useState(""); // Declare the messageText state variable
  const [rideMessages, setRideMessages] = useState([]); // All messages associated to Current Ride
  const [authID, setAuthID] = useState(null);

  useEffect(() => {
    // Listen for changes in authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, get their AuthID
        setAuthID(user.uid);
        console.log("Current User: " + user.uid);
      } else {
        // User is signed out, reset AuthID
        setAuthID(null);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  // Function to convert a Firebase timestamp to a formatted string
  const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp || !(timestamp instanceof firebase.firestore.Timestamp)) {
      return ""; // Return an empty string for invalid timestamps
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const date = timestamp.toDate();
    const month = months[date.getMonth()];
    const day = date.getDate();

    let daySuffix = "TH";
    if (day === 1 || day === 21 || day === 31) {
      daySuffix = "ST";
    } else if (day === 2 || day === 22) {
      daySuffix = "ND";
    } else if (day === 3 || day === 23) {
      daySuffix = "RD";
    }

    return `${month}, ${day}${daySuffix}`;
  };

  useEffect(() => {
    // Initialize Firestore if not already initialized
    const messagesRef = db.collection("messages");

    // Define the query to fetch messages where ride is equal to ride.id
    const query = messagesRef.where("rideID", "==", ride.id);

    // Subscribe to the query and update the state when data changes
    const unsubscribe = query.onSnapshot((querySnapshot) => {
      const updatedMessages = [];
      querySnapshot.forEach((doc) => {
        // Get the message data and add it to the updatedMessages array
        updatedMessages.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setRideMessages(updatedMessages);

      console.log("Ride Messages: ", updatedMessages);
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [ride]);

  const renderChatBubble = (message) => {
    const isRider = message.senderPerson === "Rider";
    const chatBubbleStyle = isRider
      ? tw`bg-white rounded-lg shadow`
      : tw`bg-yellow-500 rounded-lg`;
    const textStyle = isRider ? tw`text-black` : tw`text-white`;
    const timestampStyle = isRider ? tw`text-left` : tw`text-right`;

    return (
      <View key={message.id} style={tw`mb-2`}>
        <View style={[tw`p-3`, chatBubbleStyle]}>
          <Text style={[tw`text-base`, textStyle]}>{message.message}</Text>
        </View>
        <Text style={[tw`text-xs text-gray-500 mb-1`, timestampStyle]}>
          {formatFirebaseTimestamp(message.timestamp)}
        </Text>
      </View>
    );
  };

  const formatTimestamp = (timestamp, message) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);

    const isToday = messageDate.toDateString() === currentDate.toDateString();
    const isYesterday =
      messageDate.toDateString() ===
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      ).toDateString();

    if (isToday) {
      return "Today";
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      const options = { month: "short", day: "numeric", year: "numeric" };
      return messageDate.toLocaleDateString(undefined, options);
    }
  };

  const handleSendMessage = () => {
    // Create a reference to the 'messages' collection
    const messagesRef = db.collection("messages");

    // Create a new message object
    const newMessage = {
      message: messageText,
      sender: ride.driverId,
      receiver: ride.riderId,
      rideID: ride.id,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    console.log("New Message: ", newMessage);

    // Add the message to the 'messages' collection
    messagesRef
      .add(newMessage)
      .then((docRef) => {
        console.log("Message added with ID: ", docRef.id);
        setMessageText(""); // Clear the input field after sending the message
      })
      .catch((error) => {
        console.error("Error adding message: ", error);
      });
  };

  return (
    <View style={tw`flex-1 bg-white py-10`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between p-4 border-b`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-outline"
            color="black"
            size={24}
          />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-center`}>{ride.riderName}</Text>
        <View style={tw`w-6`} />
      </View>

      {/* Horizontal Line */}
      <View style={tw`border-b border-gray-300`} />

      {/* Chat Messages */}
      <ScrollView contentContainerStyle={tw`p-4`} style={tw`flex-1`}>
        {/* Render messages */}
        {rideMessages
          .slice()
          .reverse()
          .map((message) => renderChatBubble(message))}
      </ScrollView>

      {/* Input Box */}
      <View style={tw`absolute bottom-0 left-0 right-0`}>
        <View style={tw`flex-row items-center p-4 bg-white`}>
          <TextInput
            style={tw`flex-1 py-2 px-4 border border-gray-300 rounded-md`}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
          />
          <TouchableOpacity
            style={tw`ml-2`}
            onPress={handleSendMessage}
            disabled={messageText.trim() === ""}
          >
            <Ionicons name="send" color="#F5B800" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ChatScreen;
