import React, { useRef, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapViewContainer, { MapViewContainerHandle } from './components/map/MapViewContainer';
import CurrentLocationBtn from './components/controls/CurrentLocationBtn';
import MyLocationMarker from './components/map/MyLocationMarker';
import EditNoteController from './components/controls/EditNoteController';
import { AlertsProvider } from './components/notification/alertsStore';

type LatLng = { latitude: number; longitude: number };

export default function App() {
  const mapRef = useRef<MapViewContainerHandle>(null);
  const [myPos, setMyPos] = useState<LatLng | null>(null);

  const handleLocationSet = (latitude: number, longitude: number) => {
    setMyPos({ latitude, longitude });
    mapRef.current?.moveCamera(latitude, longitude, 16);
  };

  return (
    <AlertsProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          <MapViewContainer ref={mapRef}>
            {myPos && <MyLocationMarker latitude={myPos.latitude} longitude={myPos.longitude} />}
          </MapViewContainer>

          <EditNoteController />
          <CurrentLocationBtn onLocationSet={handleLocationSet} />
        </View>
      </SafeAreaProvider>
    </AlertsProvider>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff' } });
