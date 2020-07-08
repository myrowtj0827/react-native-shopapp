import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import Autocomplete from 'react-native-autocomplete-input';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import Spinner from 'react-native-loading-spinner-overlay';
import {
    Input,
    Button
} from 'react-native-elements';
import { AuthContext } from '../../utils/authContext';

const ShopProfileScreen = ({ navigation }) => {
    const { signIn } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [shopname, setShopName] = useState('');
    const [shopowner, setShopOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [query, setQuery] = useState('');
    const [cityData, setCityData] = useState([]);
    const [state, setState] = useState('');
    const [pincode, setPinCode] = useState('');

    const [errorData, setErrorData] = useState(
        {
            isValidShopName: true,
            isValidShopOwnerName: true,
            isValidEmail: true,
            isValidAddress: true,
            email: '',
            address: '',
            shopname: '',
            shopowner: '',
            city: '',
            state: '',
            pincode: '',
            landmark: '',
        });

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
    
    const handleUpdate = () => {

        if(onShopNameChanged() == false)
        {
            // Toast.show('Enter the shop name')
            return;
        }
        if(onShopOwnerNameChanged() == false)
        {
            // Toast.show('Enter the shop owner name')
            return;
        }
        if(onAddressChanged() == false)
        {
            Toast.show('Enter the address')
            return;
        }
        if(onLandMarkChanged() == false)
        {
            Toast.show('Enter the landmark')
            return;
        }
        if(onEmailChanged() == false)
        {
            Toast.show('Enter the valid email')
            return;
        }
        if(checkCity() == false)
        {
            Toast.show('Enter the city')
            return;
        }
        if(checkState() == false)
        {
            Toast.show('Enter the State')
            return;
        }
        if(checkPincode() == false)
        {
            Toast.show('Enter the pincode')
            return;
        }

        let userToken = null;
        try {
            userToken = AsyncStorage.getItem('userToken')
        } catch (e) {
            console.log(e);
        }
        
        if (userToken != null) {
            const payload = { shopname, shopowner, email, address, landmark, city, state, pincode };
            const onSuccess = ({ data }) => {
                setLoading(false);
                Toast.show('Successfully updated.');
            }
            const onFailure = error => {
                setLoading(false);
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
            setShopClientToken(userToken)
            SHOPAPIKit.patch('/shop/update', payload)
                .then(onSuccess)
                .catch(onFailure)
        }
        
    };

    useEffect(() => {
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
                    console.log(data)
                    setShopName(data.shopname);
                    setShopOwnerName(data.shopowner);
                    setAddress(data.address);
                    setState(data.state);
                    setCity(data.city);
                    setPinCode(data.pincode.toString());
                    if(data.email != null)
                        setEmail(data.email);
                    if(data.landmark != null)
                        setLandmark(data.landmark);
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
                setShopClientToken(userToken)
                SHOPAPIKit.get('/shop/get/')
                    .then(onSuccess)
                    .catch(onFailure);
            }
            else {

            }
        };
        bootstrapAsync();

    }, []);

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
       if (landmark.length < 3) {
           setErrorData({
               ...errorData,
               isValidAddress: false,
               address: 'Enter the valid landmark',
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

   return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            <ScrollView
                style={styles.scrollView}>
                    <View style={styles.viewInputGroup}>
                        <View>
                            <Text style={styles.textView}>
                                Shop Name
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'ShopName'}
                                placeholder="Shop Name"
                                value={shopname}
                                onChangeText={setShopName}
                                onBlur={() => onShopNameChanged()}
                            />
                            {
                                errorData.isValidShopName ? null : <Text style={{ color: 'red' }}>{errorData.shopname}</Text>
                            }
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                Shop Owner Name
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'ShopOwnerName'}
                                placeholder="Shop Owner Name"
                                value={shopowner}
                                onChangeText={setShopOwnerName}
                                onBlur={() => onShopOwnerNameChanged()}
                            />
                            {
                                errorData.isValidShopOwnerName ? null : <Text style={{ color: 'red' }}>{errorData.shopowner}</Text>
                            }
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                Email
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'Email'}
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                onBlur={() => onEmailChanged()}
                            />
                            {
                                errorData.isValidEmail ? null : <Text style={{ color: 'red' }}>{errorData.email}</Text>
                            }
                        </View>
                        <View>
                            <Text style={styles.textView}>
                                    Address
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                label={'Address'}
                                placeholder="Address"
                                value={address}
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
                        <Button
                            buttonStyle={styles.updateButton}
                            backgroundColor="#03A9F4"
                            title="Update"
                            onPress={() => handleUpdate()}
                        />
                </View>
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
    updateButton: {
        marginTop: 30,
        marginBottom: 80,
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
})
export default ShopProfileScreen;