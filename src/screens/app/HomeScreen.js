/* *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Button,
  FlatList,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import {ORDERAPIKit, setOrderClientToken} from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import { Card } from 'react-native-paper';
import { AuthContext } from '../../utils/authContext';

const HomeScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [liveOrders, setLiveOrders] = useState([]);
  const { signIn } = useContext(AuthContext);

  const navigationOptions = () => {
    navigation.setOptions({ 
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <MaterialCommunityIcons.Button name="menu" size={25}
          backgroundColor={colors.primary}
          onPress={() => navigation.openDrawer()}
        ></MaterialCommunityIcons.Button>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignSelf: "center", marginRight: 5 }}>
          <Button
            onPress={() => 
              RefreshProducts()
            }
            title="Refresh"
            color="rgba(35,150,243,1)"
          />
        </View>
      )
     });
  }

  const RefreshProducts = async() => {
    let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            setLoading(false);
            setLiveOrders(data.liveorders);
            console.log('success');
          }
          const onFailure = (error) => {
            setLoading(false);
            if(error.toString().includes('409')) {
              console.log( "message: No liveorders");
              // Toast.show("message: No liveorders");
            }
            else if(error.toString().includes('401')) {
              console.log( "error: Authentication failed");
              reSignIn();
              //Toast.show("error: Authentication failed");
            }
            else
              console.log(error);

            setLiveOrders([]);
          }
          
          setLoading(true);
          ORDERAPIKit.get('/shoporder/orders/live/')
            .then(onSuccess)
            .catch(onFailure);
        }
  }

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
    const unsubscribe = navigation.addListener('focus', () => {
      navigationOptions();
      const bootstrapAsync = async () => {
        RefreshProducts();
      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const onOrderPressed = (item) => {
    console.log(item.orderref);
    navigation.navigate('Update Order Detail', item)
  }

  const renderItem = ({ item, index }) => {
    return (
        <TouchableOpacity onPress={() => onOrderPressed(item, index)}>
        <View style={ styles.card }>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Ref</Text>
                <Text style={[styles.box, styles.box2]}>{item.orderref}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Total</Text>
                <Text style={[styles.box, styles.box3]}>₹ {item.ordertotal}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Quantity</Text>
                <Text style={[styles.box, styles.box3]}>{item.orderquantity}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.box, styles.box2]}> Order Pickup</Text>
                <Text style={[styles.box, styles.box3]}>{moment.utc(item.orderpickup).format("HH:mm:ss")}</Text>
            </View>

        </View>
        </TouchableOpacity>
    )
  }
  return (
    <>
      <View style={styles.container}>
        { loading ? 
          <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
          : 
          <View> 
            { liveOrders.length == 0 ? 
              <View  style={styles.noliverorders}> 
                <Text style={{fontSize: 20, marginTop: 300, color: "rgba(128, 128, 128, 1)"}}>
                  No Live Order
                </Text>
              </View>
              : 
              <Text style={styles.title}>Live Orders</Text>
            }
            <FlatList style ={{marginBottom: 45}}
              data={liveOrders}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem} />
          </View>
        }
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(217,232,252,1)',
  },
  listContainer: {
    flex: 1,
  },
  title: {
    margin: 10,
    alignSelf: "center",
    fontSize: 16,
  },
  item: {
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  selecteditem: {
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  card: {
    flexDirection: 'column',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(20,123,136,1)',
    height: 30,
    backgroundColor: '#333',
    textAlignVertical: "center",
    textAlign: "center",
  },
  box2: {
    backgroundColor: 'rgba(176, 227, 230, 1)',
  },
  box3: {
    // backgroundColor: 'orange'
    backgroundColor:  'rgba(178, 221, 238, 1)',

  },
  two: {
    flex: 2
  },

  noliverorders: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default HomeScreen;