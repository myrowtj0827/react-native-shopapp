/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useContext, useMemo, useReducer } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { setShopClientToken, setOrderClientToken } from './src/utils/apikit';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import SplashScreen from './src/screens/SplashScreen';
import DashboardScreen from './src/screens/app/DashboardScreen';

import { StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import AsyncStorage from '@react-native-community/async-storage'
import { stateConditionString } from './src/utils/helpers'
import { AuthContext } from './src/utils/authContext'
import { reducer, initialState } from './src/reducer'


const Stack = createStackNavigator();

const createHomeStack = () => {
  const { signOut } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home Screen"
        component={DashboardScreen}
        initialParams={{ singOut: signOut }}
      />
    </Stack.Navigator>
  );
};

const App = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
  }, []);

  const authContextValue = useMemo(
    () => ({
      signIn: async (data) => {
        if (
          data &&
          data.mobile !== undefined &&
          data.password !== undefined &&
          data.token != undefined
        ) {
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('mobile', data.mobile);
          await AsyncStorage.setItem('password', data.password);
          dispatch({ type: 'SIGN_IN', token: data.token });
        } else {
          dispatch({ type: 'TO_SIGNIN_PAGE' });
        }
      },
      signOut: async (data) => {
        await AsyncStorage.clear();
        dispatch({ type: 'SIGN_OUT' });
      },

      signUp: async (data) => {
        if (
          data &&
          data.mobile !== undefined &&
          data.password !== undefined &&
          data.token != undefined
        ) {
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('mobile', data.mobile);
          await AsyncStorage.setItem('password', data.password);
          setShopClientToken(); 
          setOrderClientToken();
          dispatch({ type: 'SIGNED_UP', token: data.token });
        } else {
          dispatch({ type: 'TO_SIGNUP_PAGE' });
        }
      },
    }),
    [],
  );

  const chooseScreen = (state) => {
    let navigateTo = stateConditionString(state);
    let arr = [];

    switch (navigateTo) {
      case 'LOAD_OTP':
        arr.push(
          <Stack.Screen
            name="OTP"
            // component={PhoneVerifyScreen}
            options={{
              title: 'OTP',
              headerShown: false,
            }}
          />,
        );
        break;
      case 'LOAD_APP':
        arr.push(
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{
              headerShown: false,
            }} 
          />);
        break;

      case 'LOAD_SIGNUP':
        arr.push(
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: 'Register',
              headerShown: false,
              animationTypeForReplace: state.isSignout ? 'pop' : 'push',
            }}
          />,
        );
        break;
      case 'LOAD_SIGNIN':
        arr.push(<Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />);
        break;

      case 'LOAD_HOME':
        arr.push(
          <Stack.Screen
            name="Home"
            component={DashboardScreen}
            options={{
              title: 'Home',
              headerShown: false,
            }}
          />,
        );
        break;
      default:
        arr.push(<Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />);
        break;
    }
    return arr[0];
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <Stack.Navigator>{chooseScreen(state)}</Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};


const styles = StyleSheet.create({
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

export default App;
