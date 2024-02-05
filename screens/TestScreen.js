import React, { useEffect, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import tw from 'tailwind-react-native-classnames';

const markerImage = require('../assets/taxi-marker.png');

const TestScreen = () => {
  const origin = {
    description: 'TRM - Thika Road Mall, Nairobi, Kenya',
    location: { lat: -1.2195761, lng: 36.88842440000001 },
  };
  const destination = {
    description: 'Quickmart - Thindigua, Kiambu, Kenya',
    location: { lat: -1.2022673, lng: 36.83306879999999 },
  };

  const mapRef = useRef(null);

  useEffect(() => {
    if (!origin || !destination || !mapRef.current) return;

    // Zoom and Fit to Markers - This Feature isn't working perfectly ATM
    mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
    });
  }, [origin, destination]);

  return (
    <View style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        <MapView
          ref={mapRef}
          style={tw`flex-1`}
          mapType="terrain"
          initialRegion={{
            latitude: origin?.location?.lat || 0,
            longitude: origin?.location?.lng || 0,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          {origin && destination && (
            <MapViewDirections
              origin={origin.description}
              destination={destination.description}
              apikey={'AIzaSyD0kPJKSOU4qtXrvddyAZFHeXQY2LMrz_M'}
              strokeWidth={4}
              strokeColor="black"
            />
          )}

          {origin?.location && (
            <Marker
              coordinate={{
                latitude: origin.location.lat,
                longitude: origin.location.lng,
              }}
              title="Origin"
              description={origin.description}
              identifier="origin"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerView}>
                <Image source={markerImage} style={styles.markerImage} />
              </View>
            </Marker>
          )}

          {destination?.location && (
            <Marker
              coordinate={{
                latitude: destination.location.lat,
                longitude: destination.location.lng,
              }}
              title="Destination"
              description={destination.description}
              identifier="destination"
            />
          )}
        </MapView>
      </View>
    </View>
  );
};

const styles = {
  markerView: {
    // Define styles for the marker view if needed
  },
  markerImage: {
    width: 20,
    height: 55,
    transform: [{ rotate: '165deg' }],
  },
};

export default TestScreen;
