/**
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import {
  Button
} from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage'
import Spinner from 'react-native-loading-spinner-overlay';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { AuthContext } from '../../utils/authContext';

const ShopLocationScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState([])
  const [region, setRegion] = useState({
    latitude: -10000,
    longitude: -10000,
    latitudeDelta: -10000,
    longitudeDelta: -10000,
  })
  const [regionDelta, setRegionDelta] = useState({
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })
  const [dragMarker, setCoordinate] = useState({
    latitude: 15.480808256,
    longitude: 73.82310486,
  });

  const [shop, setShop] = useState({
    index: 0,
    alert: false,
    wholesaler: 0,
    bulkorder: 0,
    shopname: '',
    year: 1990
  })

  const reSignIn = async()=> {
    let mobile = null;
    let password = null;
    try {
      mobile = await AsyncStorage.getItem('mobile')
      password = await AsyncStorage.getItem('password')

    } catch (e) {
      console.log(e);
    }

    signIn({ mobile, password });
  }

  useEffect(() => {
    setShop({
      alert: false
    });

    const bootstrapAsync = async () => {
      let userToken = null;
      try {
          userToken = await AsyncStorage.getItem('userToken')
      } catch (e) {
          console.log(e);
      }
      if (userToken != null) {
          const onSuccess = ({ data }) => {
              setLoading(false);
              let item = {latitude: data.latitude, longitude: data.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01};
              setRegion(item);

              let markers = [{ latitude: data.latitude, longitude: data.longitude, title: data.shopname, subtitle: data.shopowner }];

              setMarkers(markers);

          }
          const onFailure = error => {
              setLoading(false);
              if(error.toString().includes('409')) {
                console.log( "message: Failed");
              }
              else if(error.toString().includes('401')) {
                console.log( "error: Authentication failed");
                reSignIn();
                //Toast.show("error: Authentication failed");
              }
              else
                console.log(error);
          }

          setLoading(true);
          setShopClientToken(userToken)
          SHOPAPIKit.get('/shop/get/')
              .then(onSuccess)
              .catch(onFailure);
      }
      else {

      }
    };
    bootstrapAsync();
  }, [navigation]);

  const onRegionChange = (region) => {
    // console.log(region);
    // setRegion(region);
    // let item = {latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta};
    // setRegionDelta(item)
  }
 
  const setDragMarkerEnd = (event) => {
    console.log(event);
    setCoordinate(event.coordinate);
    // let item = {latitude: event.coordinate.latitude, longitude: event.coordinate.longitude, latitudeDelta: regionDelta.latitudeDelta, longitudeDelta: regionDelta.longitudeDelta};
    // setRegion(item);
  }
  const handleUpdate = () => {
    let userToken = null;
    try {
        userToken = AsyncStorage.getItem('userToken')
    } catch (e) {
        console.log(e);
    }
    
    if (userToken != null) {
        let latitude = dragMarker.latitude;
        let longitude = dragMarker.longitude;
       
        console.log(latitude);
        console.log(longitude);
        const payload = { latitude, longitude };
        const onSuccess = ({ data }) => {
            setLoading(false);
            Toast.show('Successfully updated.');
        }

        const onFailure = error => {
            setLoading(false);
            console.log(error && error.response);
            if(error.toString().includes('409')) {
              Toast.show('Failed to update');
            }
            else if(error.toString().includes('401')) {
              console.log( "error: Authentication failed");
              reSignIn();
              //Toast.show("error: Authentication failed");
            }
            else
              console.log(error);
        }
        setLoading(true);
        setShopClientToken(userToken);
        SHOPAPIKit.patch('/shop/update/location', payload)
            .then(onSuccess)
            .catch(onFailure)
    }

  }
  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
      </View>
      {region.latitude != -10000 ? (
              <MapView
              style={{ flex: 1}}
              initialRegion={region}
              // region={{latitude: region.latitude, longitude: region.longitude, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta}}
              // region={region}
              onRegionChange={onRegionChange}
            >
              {markers.map(marker => (
                <Marker draggable
                onDragEnd={(e) => setDragMarkerEnd(e.nativeEvent)}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                title={marker.shopname}
                description={marker.shopowner}
                >
                  <View >
                    <View
                      style={styles.callout}>
                      <Text style={styles.titleText}>
                        {marker.title}
                      </Text>
                    </View>                  
                    <View
                      style={{alignSelf:'center'}}>
                      <MaterialCommunityIcons 
                          name="map-marker"
                          color="red"
                          size={50}
                        />
                    </View>
                  </View>
                  <MapView.Callout
                    tooltip={true}
                  />
                </Marker> 
              ))}
            </MapView>
      ) : null
      }

      <View style = {styles.updateButtonLayout}>
        <Button
          buttonStyle={styles.updateButton}
          backgroundColor="#03A9F4"
          title="Confirm Shop Location"
          onPress={() => handleUpdate()}
      />
    </View>
      
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  callout: {
    backgroundColor: "rgba(255,0,0,1)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 4
  },
  titleText: {
    paddingHorizontal: 10,
    color: "rgba(255,255,255,1)",
    fontSize: 14,
    flex: 1,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },

  updateButtonLayout: {
    position: 'absolute',//use absolute position to show button on top of the map
    top: '85%', //for center align
    
    alignSelf: 'center' //for align to right
    
    },
  updateButton: {
      width: 300
    },
});

export default ShopLocationScreen;