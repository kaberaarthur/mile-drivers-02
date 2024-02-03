import React, { useState, useEffect }  from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

import { useDispatch, useSelector } from "react-redux";
import { selectPerson, setPerson } from "../slices/personSlice";
import { db, auth } from "../firebaseConfig";

const DocumentManagementScreen = () => {
  const navigation = useNavigation();
  const person = useSelector(selectPerson);

  const [nationalID, setNationalID] = useState(null);
  const [nationalIDApproved, setNationalIDApproved] = useState(null);

  const [dl, setDl] = useState(null);
  const [DlApproved, setDlApproved] = useState(null);

  useEffect(() => {
    const fetchNationalID = async () => {
      if (person) {
        try {
          const nationalIDRef = db.collection('nationalIDS').doc(person.authID);
          const nationalIDSnapshot = await nationalIDRef.get();

          if (nationalIDSnapshot.exists) {
            const nationalIDData = nationalIDSnapshot.data();
            setNationalID(nationalIDData.downloadURL);
            setNationalIDApproved(nationalIDData.approved);

            console.log("Driver's National ID: ", nationalIDData.downloadURL)
          } else {
            // Handle the case when the document doesn't exist
            console.log('National ID document not found');
          }
        } catch (error) {
          // Handle errors here
          console.error('Error fetching national ID:', error);
        }
      }
    };

    fetchNationalID();
  }, [person]);

  // Fetch DL Document
  useEffect(() => {
    const fetchDl = async () => {
      if (person) {
        try {
          const DlRef = db.collection('drivingLicense').doc(person.authID);
          const DlSnapshot = await DlRef.get();

          if (DlSnapshot.exists) {
            const DlData = DlSnapshot.data();
            setDl(DlData.downloadURL);
            setDlApproved(DlData.approved);

            console.log("Driver's License: ", DlData.downloadURL)
          } else {
            // Handle the case when the document doesn't exist
            console.log('Driving License document not found');
          }
        } catch (error) {
          // Handle errors here
          console.error('Error fetching Driver License:', error);
        }
      }
    };

    fetchDl();
  }, [person]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleOpenDrivingLicense = () => {
    navigation.navigate("DrivingLicenseScreen"); // Replace 'DrivingLicenseScreen' with the actual screen name of Driving License
  };

  const handleOpenInsuranceSticker = () => {
    navigation.navigate("InsuranceStickerScreen"); // Replace 'DrivingLicenseScreen' with the actual screen name of Driving License
  };

  const handleIDCard = () => {
    navigation.navigate("IDCardScreen"); // Replace 'DrivingLicenseScreen' with the actual screen name of Driving License
  };

  return (
    <View style={[tw`flex-1 bg-white`, tw`py-10`]}>
      <View style={tw`bg-white items-center`}>
        <Text style={tw`text-xl font-semibold`}>Document Management</Text>
        <TouchableOpacity onPress={handleGoBack} style={tw`absolute left-3`}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView style={tw`bg-gray-100 flex-1`}>

      {nationalID && nationalIDApproved ? (
          <TouchableOpacity>
            <View style={tw`bg-white rounded-md mx-4 my-4 p-4`}>
              <Image
                source={{ uri: nationalID }}
                style={{ width: '100%', height: 200, borderRadius: 8 }}
                resizeMode="cover"
              />
              <Text style={tw`text-lg font-semibold mt-2`}>
                National ID
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleIDCard}>
            <View style={tw`bg-white rounded-md mx-4 my-4 p-4`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-yellow-400 w-2/5 h-full rounded-md mr-4`} />
                <View style={tw`flex-1`}>
                  <View style={tw`h-6 bg-gray-100 mb-2`} />
                  <View style={tw`h-6 bg-gray-100 mb-2`} />
                  <View style={tw`h-6 bg-gray-100 mb-2`} />
                  <View style={tw`h-6 bg-gray-100`} />
                </View>
              </View>
              <Text style={tw`text-lg font-semibold mt-2`}>
                Approved Identification Card
              </Text>
            </View>
          </TouchableOpacity>
        )}


        {dl && DlApproved ? (
          <TouchableOpacity>
            <View style={tw`bg-white rounded-md mx-4 my-4 p-4`}>
              <Image
                source={{ uri: dl }}
                style={{ width: '100%', height: 200, borderRadius: 8 }}
                resizeMode="cover"
              />
              <Text style={tw`text-lg font-semibold mt-2`}>
                Approved Driving License
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
        <TouchableOpacity onPress={handleOpenDrivingLicense}>
          <View style={tw`bg-white rounded-md mx-4 my-4 p-4`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-yellow-500 w-2/5 h-full rounded-md mr-4`} />
              <View style={tw`flex-1`}>
                <View style={tw`h-6 bg-gray-100 mb-2`} />
                <View style={tw`h-6 bg-gray-100 mb-2`} />
                <View style={tw`h-6 bg-gray-100 mb-2`} />
                <View style={tw`h-6 bg-gray-100`} />
              </View>
            </View>
            <Text style={tw`text-lg font-semibold mt-2`}>Driving License</Text>
          </View>
        </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default DocumentManagementScreen;
