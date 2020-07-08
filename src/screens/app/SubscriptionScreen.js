/* *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';

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

import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import { AuthContext } from '../../utils/authContext';

const SubscriptionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedindex, setSelectedIndex] = useState(0)
  const { signIn } = useContext(AuthContext);

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
            getSubscriptions(data.shopsubscriptions);

            let curIndex = 0;
            for( let i = 0; i < data.shopsubscriptions.length; i++ ) {
              if( data.shopsubscriptions[i].subscriptionid == data.shopsubscriptionid ) {
                curIndex = i;
                break;
              }
            }
            console.log('curIndex=',curIndex)
            setSelectedIndex(curIndex);
            console.log(data);
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
          SHOPAPIKit.get('/shop/allsubscription')
            .then(onSuccess)
            .catch(onFailure);
        }

      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const getSubscriptions = (subscriptions) => {
    setSubscriptions(subscriptions);
  }
  const onOrderPressed = (item, index) => {
    console.log(index)
    setSelectedIndex(index)
  }
  const updateSubscription = () => {
    let id = subscriptions[selectedindex].subscriptionid
    console.log("subscription id: " + id);
    const payload = {subscriptionid: id };
    const onSuccess = ({ data }) => {
      setLoading(false);
      console.log(data);
      Toast.show(data.message);
      navigation.navigate('Home');
    }
    const onFailure = error => {
      setLoading(false);
      if(error.toString().includes('409')) {
        Toast.show('Failed to update.');
      }
      else if(error.toString().includes('401')) {
        console.log( "error: Authentication failed");
        reSignIn();
       // Toast.show("error: Authentication failed");
      }
      else
          console.log(error);
    }
    setLoading(true);
    SHOPAPIKit.patch('/shop/update/subscription', payload)
      .then(onSuccess)
      .catch(onFailure);
  }

  const renderItem = ({ item, index }) => {
    return (
      <View style={selectedindex == index ? styles.selecteditem : styles.item}>
        <TouchableOpacity onPress={() => onOrderPressed(item, index)}>
          <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15 }}>{item.subscription}</Text>
            <Text style={{ fontSize: 15 }}>{item.subscriptiondesc}</Text>
            {item.discountmprice != 0 ?
              <View style={{flexDirection: 'row'}}>
                <Text style={{ fontSize: 15 }}>₹ </Text>
                <Text style={{ textDecorationLine: 'line-through', fontSize: 15 }}>{item.mprice}</Text>
                <Text style={{ fontSize: 15, fontWeight: 'bold'}}> {item.discountmprice}</Text>
                <Text style={{ fontSize: 15 }}> for montly</Text>
              </View> : null}
            {item.discountyprice != 0 ? 
              <View style={{flexDirection: 'row'}}>
                <Text style={{ fontSize: 15 }}>₹ </Text>
                <Text style={{ textDecorationLine: 'line-through', fontSize: 15 }}>{item.yprice}</Text>
                <Text style={{ fontSize: 15, fontWeight: 'bold'}}> {item.discountyprice}</Text>
                <Text style={{ fontSize: 15 }}> for yearly</Text>
              </View> : null}
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
          data={subscriptions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={subscriptions ? renderItem : null} />
          {
          subscriptions.length != 0 ?
            <View style={styles.buttonContainer}>
              <Button title='Update' onPress={updateSubscription} />
            </View> : null
        }
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
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  selecteditem: {
    flex: 1,
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
});

export default SubscriptionScreen;