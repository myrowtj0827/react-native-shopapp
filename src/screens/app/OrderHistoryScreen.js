/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Image,
  ToastAndroid,
} from 'react-native';

import { AuthContext } from '../../utils/authContext';
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import {ORDERAPIKit, setOrderClientToken} from '../../utils/apikit';
import { colors } from '../../res/style/colors'

const OrderHistoryScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

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
      const bootstrapAsync = async () => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            setLoading(false);
            setOrders(data.orders);
            console.log('success')
          }
          const onFailure = (error) => {
            setLoading(false);
            if(error.toString().includes('409')) {
              console.log( "message: No order");
              Toast.show("message: No order");
            }
            else if(error.toString().includes('401')) {
              console.log( "error: Authentication failed");
              reSignIn();
              Toast.show("error: Authentication failed");
            }
            else
              console.log(error);
          }
          setLoading(true);
          ORDERAPIKit.get('/shoporder/orders')
            .then(onSuccess)
            .catch(onFailure);
        }

      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const onOrderPressed = (item) => {
    console.log(item.orderref);
    navigation.navigate('Order Detail', item)
  }
  const renderItem = ({ item }) => {
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => onOrderPressed(item)}>
          <View style={styles.itemGroup}>
            <Text style={{ fontSize: 15 }}>Order Ref         {item.orderref}</Text>
            <Text style={{ fontSize: 15 }}>Quantity           {item.orderquantity}</Text>
            <Text style={{ fontSize: 15 }}>Sub Total         ₹{item.ordertotal}</Text>
            <Text style={{ fontSize: 15 }}>Order Date      {item.orderdate}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <FlatList
          data={orders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={orders ? renderItem : null} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  item: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(133,181,106,1)',
    flexDirection: 'row',
    backgroundColor: 'rgba(212,232,213,1)',
  },
  itemGroup: {
    flexDirection: 'column',
    padding: 8,
    justifyContent: 'space-between',
  }
});

export default OrderHistoryScreen;