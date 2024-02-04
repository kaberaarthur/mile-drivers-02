import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
//import { Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebaseConfig"; // Import your Firebase config
import firebase from "firebase/compat/app";
import { setPerson, selectPerson } from "../slices/personSlice";
import Modal from "react-native-modal";
import StarRating from "react-native-star-rating";
import { selectCurrentRide, setCurrentRide } from "../slices/currentRideSlice";

const RideInProgress = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const person = useSelector(selectPerson);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [driverBalance, setDriverBalance] = useState(0);
  const [currentRideData, setCurrentRideData] = useState(0);

  const [rideDataX, setRideDataX] = useState([]);
  const [rideDocID, setRideDocID] = useState([]);

  const { rideDataY } = route.params;

  console.log("The Driver", person);


  // useEffect to Manually get the ride Data from the DB
  // Check if there is a ride in progress
  useEffect(() => {
    // Make sure person is loaded before proceeding
    console.log('useEffect is being called');

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
            console.log("It's Working")
            const rideData = snapshot.docs[0].data();
            console.log('!!!!!#### - ', rideData)
            const updatedDateCreated = rideData.dateCreated.toDate().toISOString();

            // Update the dateCreated field in the document data
            const updatedRideData = {
              ...rideData,
              dateCreated: updatedDateCreated,
              rideId: snapshot.docs[0].id,
            };

            console.log("%%%%% - ", snapshot.docs[0].id)

            // Dispatch the new data to your Redux action
            dispatch(setCurrentRide(updatedRideData));

            setCurrentRideData(updatedRideData)
            setRideDocID(snapshot.docs[0].id)

            console.log("&&&*^^^)() - ", rideDocID)
          }
        } catch (error) {
          console.log('Error fetching ride data:', error);
        }
      };

      fetchData();
    }
  }, [dispatch, person]);

  useEffect(() => {
    console.log("The Ride ID***: ", rideDocID)
  }, [rideDocID]);

  // Drop Off Code
  const handleDropOff = () => {
    // Get the ride ID
    const rideId = rideDocID;

    // Update Firestore document
    db.collection("rides")
      .doc(rideId)
      .update({
        rideStatus: "4",
      })
      .then(() => {
        console.log("Ride Status Changed: Ride Completed");
        setRatingModalVisible(true);
        // Now, navigate to OneRequestScreen
        // navigation.navigate("RideInProgressScreen");

        // Update Financial Data
        // First get the Payment Type
        // Function to check if a document with a certain ID exists, and create it if it doesn't
        async function createOrUpdateDocument(documentId) {
          // Check if the document already exists
          const documentRef = db
            .collection("driverCurrentBalance")
            .doc(documentId);
          const documentSnapshot = await documentRef.get();

          // If Document Already Exists
          if (documentSnapshot.exists) {
            // Document already exists, update it
            const existingData = documentSnapshot.data();
            const currentBalance = existingData.balance || 0; // Default to 0 if balance doesn't exist

            // Document already exists, update it
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();

            // If a Deduction was applied on the Ride
            const rideDeduction =
              currentRideData["totalDeduction"];
            const balAfterDeduction = 0.85 * parseInt(rideDeduction);

            const updatedBalance = balAfterDeduction + currentBalance;

            // Check if Payment type is not Cash and Add Amount to Balance
            // Afterwards, Create a Payment Transactions Document
            const paymentMethodId = parseInt(
              currentRideData["paymentMethod"]["id"]
            );

            if (paymentMethodId === 1) {
              // It is a Cash Payment
              // Deduction + (Total Commission)
              const totalCommission =
                -parseInt(
                  currentRideData["totalFareBeforeDeduction"]
                ) * 0.15;
              const deduction = parseInt(
                currentRideData["totalDeduction"]
              );

              const driverDues = totalCommission + deduction;

              console.log("Total Commission: " + totalCommission);
              console.log("Deduction: " + deduction);
              console.log("Mile Owes the Driver: " + driverDues);

              /*
              console.log("Ride ID: " + currentRideData["id"]);
              console.log("Ride ID: " + currentRideData["id"]);
              console.log("Ride ID: " + currentRideData["id"]);
              console.log("Ride ID: " + currentRideData["id"]);
              */

              // Create a Document to Record this Financial Transaction
              const driverFinancesRef = db.collection("driverFinances").doc();

              // Define the data for the document
              const financeData = {
                driverId: currentRideData["driverId"],
                paymentType:
                  currentRideData["paymentMethod"]["id"],
                rideId: rideDocID,
                riderId: currentRideData["riderId"],
                totalAmount:
                  currentRideData["totalFareBeforeDeduction"], // Replace with your values
                totalClientPays:
                  currentRideData["totalClientPays"], // Replace with your values
                totalDeduction:
                  currentRideData["totalDeduction"], // Replace with your values
                driverRevenue: driverDues, // Replace with your values
                paid: false, // Replace with your values
                date: firebase.firestore.FieldValue.serverTimestamp(), // Use Firestore Timestamp
              };

              // Set the data in the Firestore document
              driverFinancesRef
                .set(financeData)
                .then(() => {
                  console.log("Driver Finances Document Written Successfully!");
                })
                .catch((error) => {
                  console.error("Error writing document: ", error);
                });
            } else {
              // It is a Cash Payment
              // Deduction + (Total Commission)
              const totalCommission =
                -parseInt(
                  currentRideData["totalFareBeforeDeduction"]
                ) * 0.15;
              const deduction = parseInt(
                currentRideData["totalDeduction"]
              );
              const totalAfterDeduction =
                parseInt(
                  currentRideData["totalFareBeforeDeduction"]
                ) - deduction;
              const driverDues =
                totalCommission + deduction + totalAfterDeduction;

              console.log("Total Commission: " + totalCommission);
              console.log("Deduction: " + deduction);
              console.log("Mile Owes the Driver: " + driverDues);
              console.log("Mile Owes the Driver: " + driverDues);

              /*
              console.log("Ride ID: " + currentRideData["id"]);
              console.log("Ride ID: " + currentRideData["id"]);
              console.log("Ride ID: " + currentRideData["id"]);
              console.log("Ride ID: " + currentRideData["id"]);
              */

              // Create a Document to Record this Financial Transaction
              const driverFinancesRef = db.collection("driverFinances").doc();

              // Define the data for the document
              const financeData = {
                driverId: currentRideData["driverId"],
                paymentType:
                  currentRideData["paymentMethod"]["id"],
                rideId: rideDocID,
                riderId: currentRideData["riderId"],
                totalAmount:
                  currentRideData["totalFareBeforeDeduction"], // Replace with your values
                totalClientPays:
                  currentRideData["totalClientPays"], // Replace with your values
                totalDeduction:
                  currentRideData["totalDeduction"], // Replace with your values
                driverRevenue: driverDues, // Replace with your values
                paid: false, // Replace with your values
                date: firebase.firestore.FieldValue.serverTimestamp(), // Use Firestore Timestamp
              };

              // Set the data in the Firestore document
              driverFinancesRef
                .set(financeData)
                .then(() => {
                  console.log("Driver Finances Document Written Successfully!");
                })
                .catch((error) => {
                  console.error("Error writing document: ", error);
                });
            }

            // Update the document with new values for lastUpdated and balance
            await documentRef.update({
              lastUpdated: timestamp,
              balance: updatedBalance, // Set balance to 100 (you can modify this value as needed)
            });

            console.log(`Document with ID ${documentId} updated.`);
          } else {
            // Document doesn't exist, create it
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();
            const initialBalance = 100;

            // Data to be added to the document
            const data = {
              lastUpdated: timestamp,
              balance: initialBalance,
            };

            // Create the document with the specified ID and data
            await documentRef.set(data);

            console.log(`Document with ID ${documentId} created.`);
          }
        }

        // Usage
        const documentIdToCheck = person["authID"];

        createOrUpdateDocument(documentIdToCheck)
          .then(() => {
            console.log("Created Driver Curr-Bal Document.");
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      })
      .catch((error) => {
        console.error("Error updating ride status:", error);
      });
  };

  // Report Code
  const handleReportRide = () => {
    // Get the ride ID
    const rideId = rideDocID;

    console.log("Ride Data: ", currentRideData);

    // Update Firestore document
    db.collection("rides")
      .doc(rideId)
      .update({
        rideStatus: "5",
      })
      .then(() => {
        console.log("Ride Status Changed: Driver Has Reported the Ride");
        // Now, navigate to OneRequestScreen
        // navigation.navigate("RideInProgressScreen");

        // Reference to the Firestore collection
        const reportsCollection = db.collection("reports");

        // Data for the document
        const reportData = {
          driverAuthID: person["authID"],
          driverEmail: person["email"],
          driverPhone: person["phone"],
          driverName: person["name"],
          riderAuthID: currentRideData["riderId"],
          riderPhone: currentRideData["riderPhone"],
          riderName: currentRideData["riderPhone"],
          rideId: rideDocID,
          resolved: false,
          issue: "Driver has reported a ride In Progress",
          timeReported: firebase.firestore.Timestamp.fromDate(new Date()),
        };

        // Add a new document to the collection
        reportsCollection
          .add(reportData)
          .then((docRef) => {
            console.log("Created a Report for This Ride:", docRef.id);
          })
          .catch((error) => {
            console.error("Error adding document:", error);
          });
      })
      .catch((error) => {
        console.error("Error updating ride status:", error);
      });
  };

  function roundToDecimal(number, decimalPlaces) {
    if (decimalPlaces < 0) {
      throw new Error("Decimal places must be greater than or equal to zero.");
    }
    const factor = 10 ** decimalPlaces;
    return Math.round(number * factor) / factor;
  }

  // Function to update the rider's rating in the 'riders' collection using authID
  const updateRiderRatingByAuthID = async (authID, newRating) => {
    const db = firebase.firestore();
    const ridersCollection = db.collection("riders");

    try {
      // Query the rider document by authID
      const query = ridersCollection.where("authID", "==", authID);

      // Execute the query
      const querySnapshot = await query.get();

      if (querySnapshot.size === 0) {
        console.log(`Rider with authID ${authID} not found.`);
        return;
      }

      // Assuming there's only one matching rider (authID is unique)
      const riderDocRef = querySnapshot.docs[0].ref;

      // Update the rider's rating
      await riderDocRef.update({
        rating: newRating, // Replace 'rating' with the actual field name in your document
      });

      console.log(`Rider with authID ${authID} rating updated to ${newRating}`);
    } catch (error) {
      console.error("Error updating rider rating:", error);
    }
  };

  const handleRateRider = (rating) => {
    console.log("Selected Rating:", rating);

    // Take Existing Rating, Find the Mean
    const currentRating = currentRideData["riderRating"];
    const newRating = roundToDecimal(
      (parseFloat(currentRating) + parseFloat(rating)) / 2,
      1
    );

    console.log(
      "Newer Rating: " +
        roundToDecimal((parseFloat(currentRating) + parseFloat(rating)) / 2, 1)
    );

    const riderAuthID = currentRideData["riderId"];
    updateRiderRatingByAuthID(riderAuthID, newRating);

    // Close the modal after rating
    setRatingModalVisible(false);

    // Navigate to the HomeScreen
    navigation.navigate("HomeScreen");
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-yellow-500 p-4`}>
      <TouchableOpacity onPress={() => navigation.navigate("RequestsScreen")}>
        <Ionicons
          name="arrow-back-outline"
          color="black"
          size={24}
        />
      </TouchableOpacity>

      <View style={tw`flex-1 justify-center`}>
        <View style={tw`bg-gray-100 p-6 rounded-lg h-3/4`}>
          {/* Part 1 */}
          <View style={tw`flex-row items-center mb-5`}>
            <Image
              style={tw`w-20 h-20 rounded-full`}
              source={{ uri: "https://links.papareact.com/3pn" }}
            />
            <Text style={tw`ml-4 text-lg font-bold`}>
              {currentRideData && currentRideData["riderName"]
                ? currentRideData["riderName"]
                : "Rider Name Not Available"}
            </Text>
          </View>

          {/* Part 2 */}
          <View style={tw`mb-5`}>
            <Text style={tw`text-sm font-bold text-gray-400`}>PICK UP</Text>
            <Text style={tw`text-lg`}>
              {currentRideData &&
                currentRideData["rideOrigin"] &&
                currentRideData["rideOrigin"][0] &&
                currentRideData["rideOrigin"][0]["description"]
                ? currentRideData["rideOrigin"][0]["description"]
                : "Pickup Location Not Available"}
            </Text>
          </View>
          <View style={tw`mb-5`}>
            <Text style={tw`text-sm font-bold text-gray-400`}>DROP OFF</Text>
            <Text style={tw`text-lg`}>
              {
                currentRideData?.rideDestination?.[0]?.description || "Destination Not Available"
              }
            </Text>
          </View>
          <View style={tw`flex-row justify-between mb-5`}>
            <Text style={tw`text-sm font-bold`}>Client Pays:</Text>
            <Text style={tw`text-sm`}>
              Kshs {currentRideData?.totalClientPays || "Amount Not Available"}
            </Text>
          </View>
          <View style={tw`flex-row justify-between mb-5`}>
            <Text style={tw`text-sm font-bold`}>Discount:</Text>
            <Text style={tw`text-sm`}>
              Kshs {currentRideData?.totalDeduction}
            </Text>
            <Text style={tw`text-sm`}>
              Kshs {currentRideData?.totalDeduction}
            </Text>
          </View>
          <View style={tw`flex-row justify-between mb-5`}>
            <Text style={tw`text-sm font-bold`}>Ride Total:</Text>
            <Text style={tw`text-sm font-bold`}>
              Kshs {currentRideData?.totalFareBeforeDeduction}
            </Text>
          </View>

          {/* Part 3 */}
          <View style={tw`flex-row`}>
            <TouchableOpacity
              style={tw`flex-1 bg-gray-900 p-4 rounded mr-2`}
              onPress={handleReportRide}
            >
              <Text style={tw`text-center text-white font-bold text-base`}>
                Report Ride
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 bg-yellow-500 p-4 rounded ml-2`}
              onPress={handleDropOff}
            >
              <Text style={tw`text-center text-gray-100 font-bold text-base`}>
                Drop Off
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={isRatingModalVisible}>
        <View style={tw`bg-white p-6 rounded-lg`}>
          <Text>Rate the rider</Text>

          <StarRating
            disabled={false}
            maxStars={5}
            rating={rating}
            selectedStar={(rating) => setRating(rating)}
            fullStarColor={"#f1c40f"} // Customize the color of filled stars
          />

          <TouchableOpacity onPress={() => handleRateRider(rating)}>
            <Text style={tw`p-4 text-base font-semibold`}>Submit Rating</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RideInProgress;
