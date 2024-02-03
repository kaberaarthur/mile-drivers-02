import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

import { db, auth } from "../firebaseConfig";
import { ActivityIndicator } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { selectPerson } from "../slices/personSlice";

const vehiclesFormer = [
  {
    id: 1,
    brand: "Mazda",
    model: "Demio",
    licensePlate: "KDD 130D",
    approved: true,
  },
];


const VehicleManagementScreen = () => {
  const navigation = useNavigation();
  const { height } = useWindowDimensions();
  const person = useSelector(selectPerson);

  
console.log("Vehicle Owner", person)

  // Initialize vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch vehicles from Firestore when the component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      const vehiclesRef = db.collection("vehicles");
      const snapshot = await vehiclesRef
        .where("owner", "==", person.authID)
        .get();

      if (!snapshot.empty) {
        const fetchedVehicles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(fetchedVehicles);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    console.log(vehicles);
  }, [vehicles]);

  return (
    <View style={tw`flex-1 bg-gray-100`}>
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

      {isLoading ? (
        <ActivityIndicator size="large" color="#030813" />
      ) : (
        <ScrollView>
          {vehicles.map(({ id, brand, model, licensePlate, approved }) => (
            <TouchableOpacity
              key={id}
              onPress={() =>
                navigation.navigate("AddVehicleDocumentsScreen", {
                  vehicleID: id,
                })
              }
            >
              <View
                key={id}
                style={tw`bg-white rounded-sm mx-4 mt-2 p-4 flex-row items-center`}
              >
                <View style={tw`p-4 rounded-full bg-yellow-500 mr-2`}>
                  <Ionicons
                    name="car-outline"
                    color="black"
                    size={24}
                  />
                </View>

                <View style={tw`flex-1 pl-2`}>
                  <Text style={tw`text-lg font-bold`}>
                    {brand} {model}
                  </Text>
                  <Text style={tw`text-sm`}>{licensePlate}</Text>
                </View>

                {approved ? (
                  <Ionicons
                    name="checkmark-circle"
                    color="#3b82f6"
                    size={24}
                  />
                ) : (
                  <View
                    style={tw`border border-blue-500 rounded-full w-6 h-6`}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {vehicles.length <= 5 && (
        <TouchableOpacity
          style={[
            tw`absolute bg-yellow-500 rounded-full p-2`,
            { bottom: 20, alignSelf: "center" },
          ]}
          onPress={() => navigation.navigate("AddVehicleScreen")}
        >
          <Ionicons name="add" color="black" size={48} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VehicleManagementScreen;
