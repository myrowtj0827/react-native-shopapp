/* * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  Text,
  Button,
  View,
  ToastAndroid,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawContent } from './DrawerContent';
import HomeScreen from './HomeScreen';
import ShopProfileScreen from './ShopProfileScreen';
import ShopServicesScreen from './ShopServicesScreen';
import SubscriptionScreen from './SubscriptionScreen';
import ShopLocationScreen from './ShopLocationScreen';
import WholeSalerScreen from './WholeSalerScreen';
import ProductsScreen from './ProductsScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import OrderDetailScreen from './OrderDetailScreen';
import UpdateOrderDetailScreen from './UpdateOrderDetailScreen';
import ProductListingScreen from './ProductListingScreen'
import Toast from 'react-native-simple-toast';

// import LiveOrderScreen from './LiveOrderScreen';
// import CartScreen from './CartScreen';
// import PlaceOrderScreen from './PlaceOrderScreen';
// import OrderSummaryScreen from './OrderSummaryScreen';
// import SearchScreen from './SearchScreen';

import { fcmService } from '../fcm/FCMService'
import { localNotificationService } from '../fcm/LocalNotificationService';

import { colors } from '../../res/style/colors'
import SHOPAPIKit from '../../utils/apikit';
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const HomeStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />
      <Stack.Screen
        name="Update Order Detail"
        component={UpdateOrderDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const LiveOrderStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LiveOrder"
        component={LiveOrderScreen}
        options={{
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
          )
        }}
      />
      <Stack.Screen
        name="Order Detail"
        component={OrderDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const CartStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
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
          )
        }}
      />
      <Stack.Screen
        name="Place Order"
        component={PlaceOrderScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="Order Summary"
        component={OrderSummaryScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>

  );
};

const OrderHistoryStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen
        name="Order History"
        component={OrderHistoryScreen}
        options={{
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
          )
        }}
      />
      <Stack.Screen
        name="Order Detail"
        component={OrderDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} */}
      />
    </Stack.Navigator>
  );
};
const SubscriptionStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
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
          )
        }}
      />
    </Stack.Navigator>
  );
};
const ProductsStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{
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
          )
        }}
      />
    </Stack.Navigator>
  );
};
const ProductListingStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Add Shop Products"
        component={ProductListingScreen}
        options={{
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
          // headerRight: () => (
          //   <View style={{flexDirection: 'row', alignSelf: "center", marginRight: 5}}>
          //     <Button
          //       onPress={() => navigation.navigate('Latest Product')}
          //       title="Latest"
          //       color="rgba(35,150,243,1)"
          //     />
          //     {/* <MaterialCommunityIcons.Button name="magnify" size={25}
          //       backgroundColor={colors.primary}
          //       onPress={() => navigation.navigate('Latest Product')}
          //     ></MaterialCommunityIcons.Button> */}
          //     {/* <MaterialCommunityIcons.Button name="magnify" size={25}
          //       backgroundColor={colors.primary}
          //       // onPress={() => navigation.navigate('Search')}
          //     ></MaterialCommunityIcons.Button> */}
          //   </View>
          //   )
        }}
      />
    </Stack.Navigator>
  );
};
const ShopProfileStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shop Profile"
        component={ShopProfileScreen}
        options={{
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
          )
        }}
      />
    </Stack.Navigator>
  );
};
const ShopServicesStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shop Services"
        component={ShopServicesScreen}
        options={{
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
          )
        }}
      />
    </Stack.Navigator>
  );
};

const WholeSalerStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Whole Saler"
        component={WholeSalerScreen}
        options={{
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
          )
        }}
      />
    </Stack.Navigator>
  );
};

const ShopLocationStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shop Map Location"
        component={ShopLocationScreen}
        options={{
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
          )
        }}
      />
    </Stack.Navigator>
  );
};

const DashboardScreen = ({ navigation }) => {
  useEffect(() => {
    fcmService.registerAppWithFCM();
    fcmService.register(onRegister, onNotification, onOpenNotification);
    localNotificationService.configure(onOpenNotification);

    function onRegister(token) {
      console.log("[App] onRegister: ", token);

      const onSuccess = ({ data }) => {
        console.log("[App] Updated Token: " + data);
      }
      const onFailure = error => {
        console.log("[App] Updated Token Error: " + error);
        console.log(error);
      }

      const payload = {
        "devicetoken": token
      }

      console.log(payload);
      SHOPAPIKit.patch('/shop/update/token', payload)
        .then(onSuccess)
        .catch(onFailure);
    }

    function onNotification(notify) {
      console.log("[App] onNotification: ", notify);
      const options = {
        soundName: 'default',
        playSound: true
      }
      localNotificationService.showNotification(
        0,
        notify.title,
        notify.body,
        notify,
        options
      )
    }

    function onOpenNotification(notify) {
      console.log("[App] onOpenNotification: ", notify);
      //alert("Open Notification: " + notify.body);
    }

    return () => {
      console.log("[App] unRegister");
      fcmService.unRegister();
      localNotificationService.unregister();

    }
  }, [])
  return (
    <>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={props => <DrawContent {...props} />}>
        <Drawer.Screen
          name="Home"
          component={HomeStackScreen} />
        <Drawer.Screen
          name="ShopProfile"
          component={ShopProfileStackScreen} />
        <Drawer.Screen
          name="ShopServices"
          component={ShopServicesStackScreen} />
        <Drawer.Screen
          name="Subscription"
          component={SubscriptionStackScreen} />
        <Drawer.Screen
          name="ShopLocation"
          component={ShopLocationStackScreen} />
        <Drawer.Screen
          name="WholeSaler"
          component={WholeSalerStackScreen} />
        <Drawer.Screen
          name="ProductListing"
          component={ProductListingStackScreen} />
        <Drawer.Screen
          name="Products"
          component={ProductsStackScreen} />
        <Drawer.Screen
          name="Order History"
          component={OrderHistoryStackScreen} />
        {/*
        <Drawer.Screen
          name="Cart"
          component={CartStackScreen} />
        <Drawer.Screen
          name="Live Order"
          component={LiveOrderStackScreen} /> */}
      </Drawer.Navigator>
    </>
  );
};


export default DashboardScreen;