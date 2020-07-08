import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-simple-toast';
import { validateAll } from 'indicative/validator';
import SHOPAPIKit, { setShopClientToken, setOrderClientToken } from '../../utils/apikit';
import AsyncStorage from '@react-native-community/async-storage'
import Spinner from 'react-native-loading-spinner-overlay';
import Logo from "../../res/assets/images/logo.png"

import {
    Input,
    Button,
    Icon,
} from 'react-native-elements';

import { AuthContext } from '../../utils/authContext';

const LoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [mobile, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [SignUpErrors, setSignUpErrors] = useState({});
    const [icEye, setIcEye] = useState('visibility');
    const [isPassword, setIsPassword] = useState(true);

    const { signIn, signUp } = useContext(AuthContext);

    useEffect(() => {
        const bootstrapAsync = async () => {
          let mobile = null;
          try {
              mobile = await AsyncStorage.getItem('mobile')
          } catch (e) {
              console.log(e);
          }
          if (mobile != null) {
              setMobileNumber(mobile);
          }
          else {

          }
        };
        bootstrapAsync();
      }, [navigation]);
    
    const handleSignIn = () => {
        const rules = {
            mobile: 'required|min:8',
            password: 'required|string|min:6|max:40'
        };

        const data = {
            mobile: mobile,
            password: password
        };

        const messages = {
            required: field => `${field} is required`,
            'username.alpha': 'Username contains unallowed characters',
            'mobile.min': 'Please enter a valid phone number',
            'password.min': 'Wrong Password?'
        };

        validateAll(data, rules, messages)
            .then(() => {
                const payload = {mobile, password};
                const onSuccess = ({ data }) => {
                    setLoading(false); 
                    setShopClientToken(data.token);
                    setOrderClientToken(data.token);
                    console.log(data.token);
                    signIn({ mobile, password, token: data.token });
                }
                const onFailure = error => {
                    setLoading(false);
                    console.log(error);
                    Toast.show('Invalid phone number or password');
                }
                setLoading(true);
                SHOPAPIKit.post('/shop/login', payload)
                    .then(onSuccess)
                    .catch(onFailure);
            })
            .catch(err => {
                const formatError = {};
                err.forEach(err => {
                    formatError[err.field] = err.message;
                });
                setSignUpErrors(formatError);
            });
    };

    const changePwdType = () => {
        if(!isPassword)
            setIcEye("visibility");
        else
            setIcEye("visibility-off");
        setIsPassword(!isPassword);
    };

    return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            <Image style={styles.logoContainer} source={Logo} />
            <View style={styles.inputView}>
                <Input
                    label={'Mobile'}
                    placeholder="Mobile"
                    value={mobile}
                    keyboardType="phone-pad"
                    onChangeText={setMobileNumber}
                    maxLength ={10}
                    errorStyle={{ color: 'red' }}
                    errorMessage={SignUpErrors ? SignUpErrors.mobile : null}
                />
                <View style={styles.password}>
                    <Input
                        label={'Password'}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={isPassword}
                        errorStyle={{ color: 'red' }}
                        maxLength={50}
                        errorMessage={SignUpErrors ? SignUpErrors.password : null}
                    />
                    <View  style = {styles.icon}>
                        <Icon 
                            name={icEye}
                            color={'#222222'}
                            onPress={changePwdType}
                        />
                    </View>
                </View>

                <Button
                    buttonStyle={styles.loginButton}
                    title="Login"
                    onPress={() => handleSignIn()}
                />
                <TouchableOpacity 
                    onPress={() => signUp()}>
                    <Text 
                        style={styles.underLineText}>
                        Register
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerStyle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoContainer: {
        width: 300,
        height: 200,
    },
    inputView: {
        width: "90%",
        borderRadius: 25,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20
    },
    loginButton: {
        margin: 10,
        marginTop: 30,
    },
    registerButton: {
        margin: 10,
        marginTop: 10,
    },
    underLineText: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: "rgba(34,137,220,1)",
        // fontWeight: 'bold',
        textAlign: 'center',
    },
    
    password: {
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        top: 33,
        right: 10,
    }
})
export default LoginScreen;