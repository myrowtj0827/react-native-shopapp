import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import Toast from 'react-native-simple-toast';
import Autocomplete from 'react-native-autocomplete-input';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import Spinner from 'react-native-loading-spinner-overlay';
import Geolocation from '@react-native-community/geolocation';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-community/async-storage'
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';

import {
    Button,
    Icon,
} from 'react-native-elements';

import { AuthContext } from '../../utils/authContext';
import { reducer } from '../../reducer'

const RegisterScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [shopname, setShopName] = useState('');
    const [shopowner, setShopOwner] = useState('');
    const [shopcategory, setCategory] = useState('');
    const [shopcategories, setCategories] = useState([]);
    const [gst, setGST] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [query, setQuery] = useState('');
    const [cityData, setCityData] = useState([]);
    const [state, setState] = useState('');
    const [pincode, setPinCode] = useState('');
    const [latitude, setLatitude] = useState('18.571391');
    const [longitude, setLongitude] = useState('73.774795');
    const [icEye, setIcEye] = useState('visibility');
    const [isPassword, setIsPassword] = useState(true);
    const [isPhoneVerifyDialog, setPhoneVerifyDialog] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [confirm, setConfirm] = useState(null);
    const [alert, setAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [autoVerified, setAutoVerified] = useState(false);
    const [dialing] = useState('+91');
    
    const [errorData, setErrorData] = useState(
        {
            isValidShopName: true,
            isValidShopOwner: true,
            isValidCategory: true,
            isValidGST: true,
            isValidEmail: true,
            isValidMobile: true,
            isValidPassword: true,
            isValidAddress: true,            
            email: '',
            mobile: '',
            password: '',
            address: '',
            shopname: '',
            shopowner: '',
            shopcategory: '',
            gst: '',
            landmark: ''
        });

    const { signIn, signOut } = useContext(AuthContext); // should be signUp

    const handleSignUp = async () => {

        // if(errorData.isValidShopName == false)
        // {
        //     Toast.show('Enter the shop name')
        //     return;
        // }
        // if(errorData.isValidShopOwner == false)
        // {
        //     Toast.show('Enter the shop owner')
        //     return;
        // }
        // if(errorData.isValidAddress == false)
        // {
        //     Toast.show('Enter the address')
        //     return;
        // }
        // if(errorData.isValidCategory == false)
        // {
        //     Toast.show('Enter the category')
        //     return;
        // }

        // if(errorData.isValidGST == false)
        // {
        //     Toast.show('Enter the valid GST')
        //     return;
        // }
        // if(errorData.isValidEmail == false)
        // {
        //     Toast.show('Enter the valid email')
        //     return;
        // }
        // if(errorData.isValidMobile == false)
        // {
        //     Toast.show('Enter the valid mobile')
        //     return;
        // }
        // if(errorData.isValidPassword == false)
        // {
        //     Toast.show('Enther the password')
        //     return;
        // }

        // if(checkCity() == false)
        // {
        //     Toast.show('Enter the city')
        //     return;
        // }
        // if(checkState() == false)
        // {
        //     Toast.show('Enter the State')
        //     return;
        // }
        // if(checkPincode() == false)
        // {
        //     Toast.show('Enter the pincode')
        //     return;
        // }

        setErrorMsg('');
        setVerifyCode('');
        setVerificationId('');
        setAutoVerified(false);
        sendPhoneNumber(dialing + mobile);
    };

    const sendPhoneNumber = (mobile) => {
        if(mobile.length < 10)
            return;

        setLoading(true);
        firebase.auth().verifyPhoneNumber(mobile).on('state_changed', (phoneAuthSnapshot) => {

            setLoading(false);
            switch (phoneAuthSnapshot.state) {
              case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
                console.log('code sent');
                console.log(phoneAuthSnapshot);

                if( autoVerified == false ) {
                    setVerificationId(phoneAuthSnapshot.verificationId);
                    setPhoneVerifyDialog(true);
                }
                break;
              case firebase.auth.PhoneAuthState.ERROR: // or 'error'
                console.log('verification error');
                console.log(phoneAuthSnapshot);
                //Toast.show('verification error');
                break;
              // ---------------------
              // ANDROID ONLY EVENTS
              // ---------------------
              case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
                console.log('auto verify on android timed out');
                console.log(phoneAuthSnapshot);
                //Toast.show('auto verify timed out');
                break;
              case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
                console.log('auto verified on android');
                console.log(phoneAuthSnapshot);
                const { verificationId, code } = phoneAuthSnapshot;
                //Toast.show('Auto verified');
                requestRegister();
                setAutoVerified(true);
                setPhoneVerifyDialog(false);
                break;
            }
            }, (error) => {
                console.log('something error');
                //if( error.toString().includes('[auth/app-not-authorized]') )
                Toast.show(error.toString());
                console.log(error);
            }, (phoneAuthSnapshot) => {
                console.log(phoneAuthSnapshot);
            });
    }
    const setCategoryData = (items) => {
         var data = [];
         items.forEach(item => {
            data.push({label: item.shopcategory, value: item.shopcategoryid});
         });
         setCategories(data);
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            Geolocation.getCurrentPosition(info =>
              {
                if(info.coords != undefined)
                {
                    setLatitude(info.coords.latitude)                
                    setLongitude(info.coords.longitude)
                }
              },
              error => console.log("The location could not be loaded because ", error.message),
              { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );

            const onSuccess = ({ data }) => {
                setLoading(false);
                setCategoryData(data.shopcategories)
                console.log(data.shopcategories)
            }
            const onFailure = error => {
                setLoading(false);
                setCategoryData([]);
            }
            setLoading(true);
            SHOPAPIKit.get('/shop/allcategory/')
                .then(onSuccess)
                .catch(onFailure);


          });
          return unsubscribe;
     }, 
    [errorData]);

    const validateEmail = email => {
        var re = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    const checkCity = () => {
        if (city.length > 1) {
            return true;
        }
        else {
            return false;
        }
    }
    const checkState = () => {
        if (state.length > 1) {
            return true;
        }
        else {
            return false;
        }
    }
    const checkPincode = () => {
        if (pincode.length > 1) {
            return true;
        }
        else {
            return false;
        }
    }
    const onShopNameChanged = () => {
        if (shopname.length > 3) {
            setErrorData({
                ...errorData,
                isValidShopName: true,
            });
            return true;
        }
        else {
            setErrorData({
                ...errorData,
                isValidShopName: false,
                shopname: 'Enter the valid shop name',
            });
            return false;
        }
    }
    const onShopOwnerNameChanged = () => {
        if (shopowner.length > 3) {
            setErrorData({
                ...errorData,
                isValidShopOwner: true,
            });
            return true;
        }
        else {
            setErrorData({
                ...errorData,
                isValidShopOwner: false,
                shopowner: 'Enter the valid shop owner name',
            });
            return false;
        }
    }
    const onCategoryChanged = () => {
        console.log(shopcategory);
        if (shopcategory.toString().length > 0) {
            setErrorData({
                ...errorData,
                isValidCategory: true,
            });
            return true;
        }
        else {
            setErrorData({
                ...errorData,
                isValidCategory: false,
                shopcategory: 'Enter the valid category',
            });
            return false;
        }
    }
    const onGSTChanged = () => {
        if (gst.length == 15) {
            setErrorData({
                ...errorData,
                isValidGST: true
            });
            const onSuccessGST = ({ data }) => {
                setErrorData({
                    ...errorData,
                    isValidGST: false,
                    gst: data.message,
                });
                
                setLoading(false);
                return true;
            }
            const onFailureGST = error => {
                console.log(error)
                setErrorData({
                    ...errorData,
                    isValidGST: true,
                });
                setLoading(false);
                return false;
            }
            setLoading(true);
            SHOPAPIKit.get('/validation/gst/' + gst)
                .then(onSuccessGST)   // 200: gst already exist.
                .catch(onFailureGST); // 409: OK, gst is not exist.
        }
        else {
            setErrorData({
                ...errorData,
                isValidGST: false,
                gst: 'Enter the GST that character length is 15.',
            });
            return false;
        }
    }
    const onEmailChanged = () => {
        if (validateEmail(email)) {

            setErrorData({
                ...errorData,
                isValidEmail: true
            });
            const onSuccessEmail = ({ data }) => {
                setErrorData({
                    ...errorData,
                    isValidEmail: false,
                    email: data.message,
                });
                
                setLoading(false);
                return true;
            }
            const onFailureEmail = error => {
                console.log(error)
                setErrorData({
                    ...errorData,
                    isValidEmail: true,
                });
                setLoading(false);
                return false;
            }
            setLoading(true);
            SHOPAPIKit.get('/validation/email/' + email)
                .then(onSuccessEmail)   // 200: email already exist.
                .catch(onFailureEmail); // 409: OK, email is not exist.
        }
        else {
            if(email.length > 0){
                setErrorData({
                    ...errorData,
                    isValidEmail: false,
                    email: 'Enter the valid email',
                }); 
                return false;
            }
            else{
                setErrorData({
                    ...errorData,
                    isValidEmail: true,
                });
                return true;
            }
        }
    }
    const onMobileChanged = () => {
        if (mobile.length == 10) {
            setErrorData({
                ...errorData,
                isValidMobile: true
            });
            const onSuccessMobile = ({ data }) => {
                setErrorData({
                    ...errorData,
                    isValidMobile: true,
                });
                setLoading(false);
                return true;
            }
            const onFailureMobile = error => {
                setErrorData({
                    ...errorData,
                    isValidMobile: false,
                    mobile: 'Already existing mobile',
                });
                setLoading(false);
                return false;
            }
            setLoading(true);
            SHOPAPIKit.get('/validation/mobile/' + mobile)
                .then(onSuccessMobile)
                .catch(onFailureMobile);
        }
        else {
            setErrorData({
                ...errorData,
                isValidMobile: false,
                mobile: 'Enter the valid phone number',
            });
            return false;
        }
    }
    const onPasswordChanged = () => {
        if (password.length < 5) {
            setErrorData({
                ...errorData,
                isValidPassword: false,
                password: 'Password length should be greater than 5',
            });
            return false;
        }
        else {
            setErrorData({
                ...errorData,
                isValidPassword: true
            });
            return true;
        }
    }
    const onAddressChanged = () => {
        if (address.length < 3) {
            setErrorData({
                ...errorData,
                isValidAddress: false,
                address: 'Enter the valid address',
            });
            console.log(errorData);
            return false;
        }
        else {
            setErrorData({
                ...errorData,
                isValidAddress: true
            });
            return true;
        }
    }
    const onLandMarkChanged = () => {
        return true;

        if (landmark.length < 3) {
            return false;
        }
        else {
            return true;
        }
    }
    const onChangeCity = (city) => {
        console.log(city);
        setCity(city);
        const onSuccessEmail = ({ data }) => {
            setCityData(data.shopcities);
        }
        const onFailureEmail = error => {
            setCityData([]);
        }
        SHOPAPIKit.get('/validation/city/' + city)
            .then(onSuccessEmail)
            .catch(onFailureEmail);
    }
    const onSelectedCity = (item) => {
        setCity(item.city);
        setQuery(item.city);
        setState(item.state);
        setPinCode(item.pincode.toString());
        setCityData([]);
    }

    const changePwdType = () => {
        if(!isPassword)
            setIcEye("visibility");
        else
            setIcEye("visibility-off");
        setIsPassword(!isPassword);
    };

    const requestRegister = () => {
        console.log('success sign in');
        const payload = {gst, shopname, shopowner, email, mobile, password, address, landmark, city, state, pincode, shopcategory, latitude, longitude};

        const onSuccess = async ({ data }) => {
            console.log(data);
            setLoading(false);
            if(data.hasError == false){                
                Toast.show('Registered successfully');
                await AsyncStorage.clear();
                await AsyncStorage.setItem('mobile', mobile);

                signIn();
            }
            // else
            //     Toast.show(data.error.message);
        }
        const onFailure = error => {
            setLoading(false);
            console.log(error && error.response);
            Toast.show('Failed to register');
        }
        setLoading(true);
        SHOPAPIKit.post('/shop/register', payload)
            .then(onSuccess)
            .catch(onFailure);
    }

    const onPressVerify = async () => {

        if( verifyCode.length < 1 ) {
            Toast.show('Input the verification code.')
            return;
        }
        
        console.log(verifyCode);
        confirmCode(verificationId, verifyCode);
    }

    const confirmCode = (verificationId, code) => {
        setLoading(true);

        const credential = firebase.auth.PhoneAuthProvider.credential(
            verificationId,
            code
        );

        firebase.auth().signInWithCredential(credential)
            .then((userCredential) => {
                // successful
                setLoading(false);
                //Toast.show('Verified!');
                console.log(userCredential);

                if( autoVerified == false ) {
                    setPhoneVerifyDialog(false);
                    requestRegister();
                    setAutoVerified(true);
                }

                return firebase.auth().signOut().catch(err => { console.error('Ignored sign out error: ', err)});
            })
            .catch((error) => {
                // failed
                setLoading(false);
                //setPhoneVerifyDialog(false);
                let userErrorMessage;
                if (error.code === 'auth/invalid-verification-code') {
                    userErrorMessage = 'Sorry, that code was incorrect.'
                } else if (error.code === 'auth/user-disabled') {
                    userErrorMessage = 'Sorry, this phone number has been blocked.';
                } else if (error.toString().includes('[auth/session-expired]'))
                {
                    userErrorMessage = 'Sorry, that session was expired. Try again'
                    // if( autoVerified == false ) {
                    //     //Toast.show('Verified!');
                    //     setPhoneVerifyDialog(false);
                    //     requestRegister();
                    //     setAutoVerified(true);

                    //     return;
                    // }
                } else {
                    // userErrorMessage = 'Sorry, we couldn\'t verify that phone number at the moment. '
                    // + 'Please try again later. '
                    // + '\n\nIf the issue persists, please contact support.'
                    userErrorMessage = error.toString();
                }
                console.log(error);
                Toast.show(userErrorMessage);
            })
      }

    return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            <ScrollView
                style={styles.scrollView}>
                <View style={styles.viewInputGroup}>
                    <View>
                        <Text style={styles.viewTitleGroup}>
                            Shop
                        </Text>
                        <View>
                            <Text style={styles.textView}>
                                Name
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'ShopName'}
                                placeholder="Shop Name"
                                value={shopname}
                                maxLength={50}
                                onChangeText={setShopName}
                                onBlur={() => onShopNameChanged()}
                            />
                            {
                                errorData.isValidShopName ? null : <Text style={{ color: 'red' }}>{errorData.shopname}</Text>
                            }
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                Owner Name
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'ShopOwnerName'}
                                placeholder="Shop Owner Name"
                                value={shopowner}
                                maxLength={50}
                                onChangeText={setShopOwner}
                                onBlur={() => onShopOwnerNameChanged()}
                            />
                            {
                                errorData.isValidShopOwner ? null : <Text style={{ color: 'red' }}>{errorData.shopowner}</Text>
                            }
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                Category
                            </Text>
                            <DropDownPicker
                            /*
                                items={[
                                    {label: 'UK', value: 'uk'},
                                    {label: 'France', value: 'france'},
                                ]}
                            */    
                                items={shopcategories}
                                //defaultValue={'uk'}
                                containerStyle={{height: 40}}
                                style={{backgroundColor: '#fafafa'}}
                                dropDownStyle={{backgroundColor: '#fafafa'}}
                                onChangeItem={item => setCategory(item.value)}

                            />
                            {/* {
                                errorData.isValidCategory ? null : <Text style={{ color: 'red' }}>{errorData.shopcategory}</Text>
                            } */}
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                GST
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'GST'}
                                placeholder="GST"
                                value={gst}
                                onChangeText={setGST}
                                maxLength = {15}
                                onBlur={() => onGSTChanged()}
                            />
                            {
                                errorData.isValidGST ? null : <Text style={{ color: 'red' }}>{errorData.gst}</Text>
                            }
                        </View>
                    </View>
                    <View>
                        <Text style={styles.viewTitleGroup}>
                            Contact
                        </Text>
                        <View>
                            <Text style={styles.textView}>
                                Email
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'Email'}
                                placeholder="Email Address"
                                value={email}
                                maxLength={50}
                                onChangeText={setEmail}
                                onBlur={() => onEmailChanged()}
                            />
                            {
                                errorData.isValidEmail ? null : <Text style={{ color: 'red' }}>{errorData.email}</Text>
                            }
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                Mobile
                            </Text>
                            <TextInput
                                underlineColorAndroid='transparent'  
                                keyboardType={'phone-pad'}
                                style={styles.textInput}
                                label={'Mobile'}
                                placeholder="Mobile Number"
                                value={mobile}
                                onChangeText={setMobileNumber}
                                maxLength = {10}
                                onBlur={() => onMobileChanged()}
                            />
                            {
                                errorData.isValidMobile ? null : <Text style={{ color: 'red' }}>{errorData.mobile}</Text>
                            }
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                Password
                            </Text>
                            <View style={[styles.textInput, styles.password]}>
                                <TextInput
                                    label={'Password'}
                                    placeholder="Password"
                                    value={password}
                                    maxLength={50}
                                    onChangeText={setPassword}
                                    secureTextEntry={isPassword}
                                    onBlur={() => onPasswordChanged()}
                                />
                                <View  style = {styles.icon}>
                                    <Icon 
                                        name={icEye}
                                        color={'#222222'}
                                        onPress={changePwdType}
                                    />
                                </View>
                            </View>

                            {
                                errorData.isValidPassword ? null : <Text style={{ color: 'red' }}>{errorData.password}</Text>
                            }
                        </View>                        
                    </View>

                    <View>
                        <Text  style={styles.viewTitleGroup}>
                            Address
                        </Text>
                        <View>
                        <Text style={styles.textView}>
                                Address
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'Address'}
                                placeholder="Address"
                                value={address}
                                maxLength={100}
                                onChangeText={setAddress}
                                onBlur={() => onAddressChanged()}
                            />
                            {
                                errorData.isValidAddress ? null : <Text style={{ color: 'red' }}>{errorData.address}</Text>
                            }
                        </View>
                        <View>
                        <Text style={styles.textView}>
                                Landmark
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'Landmark'}
                                placeholder="Landmark"
                                value={landmark}
                                maxLength={50}
                                onChangeText={setLandmark}
                                onBlur={() => onLandMarkChanged()}
                            />
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                City
                            </Text>
                            <Autocomplete
                                style={styles.textInput}
                                label={'City'}
                                placeholder="City"
                                data={cityData}
                                defaultValue={query}
                                value={city}
                                onChangeText={text=> onChangeCity(text)}
                                renderItem={({ item, i }) => (
                                    <TouchableOpacity onPress={() => onSelectedCity(item)}>
                                    <Text>{item.city}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                State
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'State'}
                                placeholder="State"
                                value={state}
                                onChangeText={setState}
                            />
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                Pincode
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'Pincode'}
                                placeholder="Pincode"
                                value={pincode}
                                onChangeText={setPinCode}
                            />
                        </View>
                    </View>
                    <Button
                        buttonStyle={styles.registerButton}
                        backgroundColor="#03A9F4"
                        title="Register"
                        onPress={() => handleSignUp()}
                    />
                    <View style={{flexDirection: 'row', alignSelf: "center", marginBottom: 80}}>
                        <Text style = {{textAlign: "center", color: "rgba(64,64,64,1)"}}>Already Registered? </Text>
                        <TouchableOpacity 
                            onPress={() => signIn()}>
                            <Text
                                style={styles.underLineText}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <ConfirmDialog
                        dialogStyle = {{backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, height: 180, alignSelf: "center"}}
                        titleStyle ={{textAlign: "center", marginTop : 20, fontSize: 16}}
                        title="Enter the verification code"
                        message="Are you sure about that?"
                        
                        visible={isPhoneVerifyDialog}
                    >
                        <View style={{marginTop: -30, alignItems: "center"}}>
                            <TextInput
                                style={styles.verifyCode}
                                keyboardType={'phone-pad'}
                                label={'Code'}
                                placeholder="code"
                                value={verifyCode}
                                maxLength = {6}
                                onChangeText={setVerifyCode}
                            />
                            <View style={{flexDirection: 'row', marginTop: 20, justifyContent: "space-between"}}>
                                <Button
                                    buttonStyle={{width: 70, height: 36, marginRight: 40, backgroundColor: "rgba(130, 130, 128,1)"}}
                                    title="Cancel"
                                    titleStyle={{fontSize: 14}}
                                    onPress={() => setPhoneVerifyDialog(false)}
                                />
                                <Button
                                    buttonStyle={{width: 70, height: 36, backgroundColor: "rgba(220, 64, 64,1)"}}
                                    title="Verify"
                                    titleStyle={{fontSize: 14}}
                                    onPress={() => onPressVerify()}
                                />
                            </View>
                            
                        </View>
                    </ConfirmDialog>
                </View>
                
                <Dialog
                    dialogStyle = {{backgroundColor: "rgba(255,255,255,1)", borderRadius: 16}}
                    titleStyle ={{textAlign: "center", marginVertical : 50}}
                    title="OTP Error Report. This Alert will be removed in the next version."
                    message="Are you sure about that?"
                    visible={alert}
                    onTouchOutside={() => setAlert(false)}
                    positiveButton={{
                        title: "YES",
                        onPress: () => setAlert(false)
                    }}
                >
                    <View>
                        <View style={{flexDirection: 'row', marginHorizontal: 0, marginTop: 80, marginBottom: -20, justifyContent: "space-evenly"}}>
                            <Button
                                buttonStyle={{width: 80, backgroundColor: "rgba(220, 64, 64,1)"}}
                                title="Close"
                                onPress={() => setAlert(false)}
                            />
                        </View>
                        
                    </View>
                </Dialog>
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
    spinnerStyle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        marginTop: 50,
    },
    
    loginButton: {
        margin: 10,
        marginTop: 30,
    },
    registerButton: {
        marginTop: 30,
        marginBottom: 10,
    },
    viewInputGroup: {
        borderRadius: 25,
        marginBottom: 30,
        justifyContent: "center",
        paddingLeft: 30,
        paddingRight: 30,
    },
    viewTitleGroup: {
        fontSize: 16,
        marginTop: 20,
        color: "rgba(64,64,64,1)",
        fontWeight: 'bold',
    },
    textView: {
        fontSize: 14,
        marginTop: 10,
        color: "rgba(64,64,64,1)",
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'gray',
        paddingLeft: 8,
        height: 40,
        textAlignVertical: "center"
    },
    loginText: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: "rgba(0,255,0,1)",
        textAlign: "center"
    },
    underLineText: {
        fontSize: 14,
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
        top: 5,
        right: 10,
    },
    verifyCode: {
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 1)',
        marginTop: 30,
        width: 100,
        paddingLeft: 8,
        fontSize: 14,
        height: 40,
        textAlign: "center"
    }
})
export default RegisterScreen;