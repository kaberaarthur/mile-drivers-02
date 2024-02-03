import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

const DocumentManagementScreen = () => {
  const navigation = useNavigation();

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
              Identification Card
            </Text>
          </View>
        </TouchableOpacity>

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
      </ScrollView>
    </View>
  );
};

export default DocumentManagementScreen;
