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
  Image,
  TouchableOpacity,
  View,
  Text,
  ToastAndroid,
} from 'react-native';

import { AuthContext } from '../../utils/authContext';
import Toast from 'react-native-simple-toast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import { ORDERAPIKit } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
const OrderDetailScreen = ({ navigation, route }) => {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [orderRef, setOrderRef] = useState(route.params.orderref);
  const [data, setData] = useState([]);
  const [order, setOrder] = useState({
    orderref: '',
    shopname: '',
    orderquantity: 0,
    ordersubtotal: 0,
    orderdiscount: 0,
    ordertotal: 0,
    status: "",
    orderpickuptime: '',
    discountpercentage: 0,
    orderpoints: '',
    orderdetails: [],
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
    const unsubscribe = navigation.addListener('focus', () => {
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
            setOrder(data)
            setData(data.orderdetails)
          }
          const onFailure = error => {
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
          console.log(orderRef);
          ORDERAPIKit.get('/shoporder/order/' + orderRef)
            .then(onSuccess)
            .catch(onFailure);
        }

      };
      bootstrapAsync();
    });
    return unsubscribe;
  }, [navigation]);

  const renderCircleView = (item) => {
    if (item.symbol == 'G') {
      return (
        <View style={styles.circleview_green} />
      )
    }
    else if (item.symbol == 'R') {
      return (
        <View style={styles.circleview_red} />
      )
    }
    else if (item.symbol == 'Y') {
      return (
        <View style={styles.circleview_yellow} />
      )
    }
    else if (item.symbol == 'B') {
      return (
        <View style={styles.circleview_brown} />
      )
    }
    else {
      return (
        <View style={styles.circleview_white} />
      )
    }

  }
  const renderItem = ({ item }) => {
    return (
      <View style={styles.item}>
        <Image
          style={styles.image}
          source={item.imageurl ? { uri: item.imageurl } : null}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ marginTop: 1, fontSize: 16 }}>{item.product}</Text>
          <View style={{ marginTop: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15 }}>{item.brand}</Text>
            <Text style={{ flex: 1, fontSize: 15, marginLeft: 10 }}>{item.weight} {item.weightunit}</Text>
            {
              renderCircleView(item)
            }
          </View>
          <View style={{ flexDirection: 'row', marginTop: 1, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15 }}>₹ {item.unitprice}</Text>
            <View style={{ height: 20, marginRight: 10, marginBottom: 5}}>
              <Text style={{ fontSize: 15 }}>{item.quantity}</Text>
            </View>
            {item.available ? (
                <MaterialCommunityIcons
                style = {{paddingRight: 8}}
                name="check-circle-outline"
                color="green"
                size={20}/>
              ) : (
                  <MaterialCommunityIcons
                  style = {{paddingRight: 8}}
                  name="checkbox-blank-circle-outline"
                  color="green"
                  size={20}/>
              )
            }
          </View>
        </View>
      </View>
    )
  }
  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 17, alignSelf: "center" }}>Order view for {order.orderref}</Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={data ? renderItem : null} />
        <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between', marginHorizontal: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{ fontSize: 16 }}>Total Quantity: {order.orderquantity}</Text>
            <Text style={{ fontSize: 16 }}>Sub Total: {order.ordersubtotal}</Text>                    
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{ fontSize: 16 }}>Ready Date: {moment(order.orderpickuptime).format("YYYY-MM-DD")}</Text>
            <Text style={{ fontSize: 16 }}>Discount: {order.orderdiscount}</Text>                    
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{ fontSize: 16 }}>Ready Time: {moment(order.orderpickuptime).format("HH:mm:ss")}</Text>
            <Text style={{ fontSize: 16, marginLeft: 30}}>Total: {order.ordertotal}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{ fontSize: 16, alignSelf: "center", paddingHorizontal: 0}}>Status: {order.status}</Text>
            <Text style={{ fontSize: 16, alignSelf: "center", paddingHorizontal: 0 }}>Points: {order.orderpoints}</Text>
          </View>
        </View>

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
    marginHorizontal: 10,
    marginVertical: 1,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderColor: "rgba(0, 0, 0,1)",
    borderWidth: 1,
    borderRadius: 4
  },
  image: {
    width: 90,
    marginVertical: 8,
    resizeMode: 'stretch'
  },
  circleview_green: {
    marginRight: 10,
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: '#32CD32'
  },
  circleview_red: {
    marginRight: 10,
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: '#8B0000'
  },
  circleview_brown: {
    marginRight: 10,
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: '#D2691E'
  },
  circleview_white: {
    marginRight: 10,
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: '#FFFFFF'
  },
  circleview_yellow: {
    marginRight: 10,
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    backgroundColor: '#808000'
  },
  buttonContainer: {
    height: 35,
    justifyContent: 'center',
    marginLeft: 25,
    marginRight: 25,
    marginTop: 10,
    marginBottom: 10,
  }
});

export default OrderDetailScreen;