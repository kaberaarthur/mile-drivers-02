import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { setCurrentRide } from '../slices/currentRideSlice';
import { selectPerson } from '../slices/personSlice';

const TestScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const person = useSelector(selectPerson);

  const [rideDataX, setRideDataX] = useState([]);
  const [rideDocID, setRideDocID] = useState([]);

  useEffect(() => {
    console.log("Use Effect is Being Called !!!!!!!!!!!!!!!!!!!!!!")
    if (person) {
      const fetchData = async () => {
        try {
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

            const updatedRideData = {
              ...rideData,
              dateCreated: updatedDateCreated,
              rideId: snapshot.docs[0].id,
            };

            dispatch(setCurrentRide(updatedRideData));
            setRideDataX(updatedRideData);
            setRideDocID(snapshot.docs[0].id);
          }
        } catch (error) {
          console.log('Error fetching ride data:', error);
        }
      };

      fetchData();
    }
  }, [dispatch, person]);

  const currentRideData = rideDataX;
  console.log("*@#%^*8 - ", rideDataX)


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity>
        <Text>{currentRideData["rideOrigin"][0]["description"]}</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text>Simulate Report Ride</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text>Simulate Rate Rider</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TestScreen;
