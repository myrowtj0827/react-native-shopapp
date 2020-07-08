/**
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import MapView, { Marker } from 'react-native-maps'
import { Dialog } from 'react-native-simple-dialogs';
import {
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  View,
  Text,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-community/async-storage'
import Spinner from 'react-native-loading-spinner-overlay';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORDERAPIKit, setOrderClientToken } from '../../utils/apikit';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import MarkerImage from '../../res/assets/images/ic_red_marker.png';
import { AuthContext } from '../../utils/authContext';

const WholeSalerScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState(0)
  const [data, setData] = useState([])
  const [markers, setMarkers] = useState([])
  const [region, setRegion] = useState({
    latitude: 15.480808256,
    longitude: 73.82310486,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })
  const [shop, setShop] = useState({
    index: 0,
    alert: false,
    distance: 0,
    bulkorder: 0,
    address: '',
    shopname: '',
    year: 1990
  })
  const [marginBottom, setMarginBottom] = useState(0);

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
    const unsubscribe = navigation.addListener('focus', () => {
      const bootstrapAsync = async (coords) => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken')
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          
          const payload = { latitude: coords.latitude, longitude: coords.longitude, area };
          //const payload = { latitude: "26.266468", longitude: "73.038111", area };
          console.log(payload);

          const onSuccess = ({ data }) => {
            console.log(data);
            setData(data.shops)
            updateShopList(data.shops);
            setLoading(false);
          }
          const onFailure = error => {
            setLoading(false);
            if(error.toString().includes('409')) {
              console.log(error);
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
          ORDERAPIKit.post('/shopoperation/shops/wholesaler', payload)
            .then(onSuccess)
            .catch(onFailure);
        }
      };

      Geolocation.getCurrentPosition(
        (pos) => {
            console.log(pos);
            setRegion({latitude: pos.coords.latitude, longitude: pos.coords.longitude})                          
            bootstrapAsync(pos.coords)
        },
        (error) => {
             console.log(error); 
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
    });

    return unsubscribe;

  }, [navigation]);
  const updateShopList = (shopData) => {
    console.log('------------------------');
    //console.log(shopData);
    shopData.forEach(element => {
      if (element.shopname != 'undefined') {
        markers.push({ latitude: element.latitude, longitude: element.longitude, title: element.shopname, year: element.Incorporationyear })
      }
      console.log(markers)
    });
  }
  const onPressMarker = (index) => {
    console.log("marker index=" + index);
    setShop({ alert: true, index: index, shopname: data[index].shopname, bulkorder: data[index].bulkorder, address: data[index].address, year: data[index].Incorporationyear });
  }
  const onBulkOrderPressed = () => {
    setShop({
      alert: false
    });
  }
  const onWholeSalerPressed = () => {
    setShop({
      alert: false
    });

  }
  const onMapReady = () => {
    console.log("map ready");
    setMarginBottom(1);
  }
  const onRegionChange = (region) => {
    setRegion(region);
  }
  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <MapView
          style={{ flex: 1, marginBottom: marginBottom }}
          onMapReady={onMapReady}
          initialRegion={{
            latitude :region.latitude != null ? region.latitude : 15.480808256,
            longitude: region.longitude != null ? region.longitude : 73.82310486,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          }}
          region={{
            latitude :region.latitude != null ? region.latitude : 15.480808256,
            longitude: region.longitude != null ? region.longitude : 73.82310486,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          }}
          showsMyLocationButton={true}
          showsUserLocation={true}>
          {
            markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}                
                // onPress={() => onPressMarker(index)}
                >
                <View >
                  <View
                    style={styles.callout}>
                    <Text style={styles.titleText}>
                      {marker.title}
                    </Text>
                    <Text style={styles.yearText}>
                      Since {marker.year}
                    </Text>
                  </View>                  
                  <View
                    style={{alignSelf:'center'}}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        color="red"
                        size={40}
                      />
                  </View>
                </View>
                <MapView.Callout
                  tooltip={true}
                  />
              </Marker>
            )
            )}
        </MapView>
        <Dialog
          visible={shop.alert}
          title={shop.shopname}
          onTouchOutside={()=>onWholeSalerPressed()}
          >
          <View style={{flexDirection: 'column'}}>
          <Text>Since {shop.year}</Text>
          <Text>Bulkorder {shop.bulkorder}</Text>
              {/* <View style={{marginTop: 10, flexDirection: 'row'}}>
                <Text style={{backgroundColor: '#00ff00', padding: 4,marginLeft: 10}}>Bulkorder {shop.bulkorder} </Text>
              </View> */}
              <Text>Address {shop.address}</Text>
          </View>
        </Dialog>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  callout: {
    backgroundColor: "rgba(255,0,0,1)",
    borderRadius: 4,
    padding: 1,
    justifyContent: "center"
  },
  titleText: {
    paddingHorizontal: 20,
    color: "rgba(255,255,255,1)",
    textAlign: "center",
    fontSize: 12,
    flex: 1,
  },
  yearText: {
    paddingHorizontal: 20,
    color: "rgba(255,255,255,1)",
    fontSize: 12,
    textAlign: "right",
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
});

export default WholeSalerScreen;