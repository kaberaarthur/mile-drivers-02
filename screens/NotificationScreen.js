import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
//import { Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

const notificationStyles = {
  Promotion: {
    bg: "bg-yellow-500",
    iconName: "pricetag",
    iconColor: "black",
  },
  Payment: {
    bg: "bg-green-500",
    iconName: "wallet",
    iconColor: "white",
  },
  System: {
    bg: "bg-blue-500",
    iconName: "checkmark-circle",
    iconColor: "white",
  },
};

const notifications = [
  {
    id: 1,
    type: "Promotion",
    text: "Get 10 rides, Earn 350 Bonus!",
  },
  {
    id: 2,
    type: "Payment",
    text: "Payment for #34567 Completed",
  },
  {
    id: 3,
    type: "Payment",
    text: "The app is currently experiencing some technical difficulties. We are working to resolve the issue as soon as possible.",
  },
  {
    id: 4,
    type: "System",
    text: "Get 20% off your next ride when you use promo code RIDESAFE.",
  },
  {
    id: 5,
    type: "Payment",
    text: "You have been paid $50 for your last 5 rides.",
  },
  {
    id: 6,
    type: "Promotion",
    text: "The app is currently down for maintenance. We will be back up and running soon.",
  },
  {
    id: 7,
    type: "Promotion",
    text: "Sign up for our new rewards program and earn points for every ride you take.",
  },
  {
    id: 8,
    type: "Payment",
    text: "You have been paid $10 for your last ride.",
  },
  {
    id: 9,
    type: "System",
    text: "There is a surge in demand for rides in your area. Rates have increased to $20 per ride.",
  },
  {
    id: 10,
    type: "System",
    text: "Get a free ride home when you use promo code RIDEHOME.",
  },
];

const NotificationScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`pt-10 px-4 flex-row items-center justify-between mb-4`}>
        <TouchableOpacity onPress={() => navigation.navigate("MenuScreen")}>
          <Ionicons name="menu-outline" color="black" size={24} />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold`}>Notifications</Text>
        <View style={tw`w-6`} />
      </View>

      <ScrollView>
        {notifications.map(({ id, type, text }, index) => {
          const { bg, iconName, iconColor } = notificationStyles[type];

          if (text.length > 40) {
            text = text.substring(0, 38) + "...";
          }

          return (
            <View
              key={id}
              style={tw`bg-gray-100 p-4 mb-2 flex-row items-center`}
            >
              <View style={tw`p-2 rounded-full ${bg} mr-4`}>
                <Ionicons
                  name={iconName}
                  color={iconColor}
                  size={24}
                />
              </View>
              <View>
                <Text style={tw`text-lg font-semibold text-gray-800`}>
                  {type}
                </Text>
                <Text style={tw`text-sm`}>{text}</Text>
              </View>
              {index !== notifications.length - 1 && (
                <View style={tw`border-b border-gray-200 mt-2`} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;
