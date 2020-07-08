import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import Autocomplete from 'react-native-autocomplete-input';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
import Spinner from 'react-native-loading-spinner-overlay';
import DropDownPicker from 'react-native-dropdown-picker';
import NumericInput from 'react-native-numeric-input'
import InputSpinner from "react-native-input-spinner";

import {
    Input,
    Button
} from 'react-native-elements';
import { AuthContext } from '../../utils/authContext';

const ShopServicesScreen = ({ navigation }) => {
    const { signIn } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [gst, setGST] = useState('');
    const [incorporationyear, setYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([]);
    const [bulkorder, setBulkOrder] = useState(1);
    const [managedinventory, setManagedInventory] = useState(1);
    const [wholesaler, setWholesaler] = useState(1);
    const [discount, setDiscount] = useState(0);
    
    const [errorData, setErrorData] = useState(
    {
        isValidGST: true,
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
    useEffect(() => {
        const bootstrapAsync = async () => {
            setYearsList();
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
                    setGST(data.gst);
                    setYear(data.incorporationyear);
                    setBulkOrder(data.bulkorder);
                    setWholesaler(data.wholesaler);
                    setManagedInventory(data.managedinventory);
                    setDiscount(data.discount);
                }
                const onFailure = error => {
                    setLoading(false);
                    if(error.toString().includes('409')) {
                        console.log(error);
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
    const handleUpdate = () => {

        if( gst.length != 15 ) {
            Toast.show('Enter the GST that character length is 15.');
            return;
        }

        let userToken = null;
        try {
            userToken = AsyncStorage.getItem('userToken')
        } catch (e) {
            console.log(e);
        }
        
        if (userToken != null) {
            const payload = { gst, incorporationyear, bulkorder, wholesaler, managedinventory, discount };
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
                  Toast.show("error: Authentication failed");
                }
                else
                    console.log(error);
            }

            setLoading(true);
            setShopClientToken(userToken)
            SHOPAPIKit.patch('/shop/update/details', payload)
                .then(onSuccess)
                .catch(onFailure)
        }
        
    };
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

    const setYearsList = () => {
        var data = [];
        var currentYear = new Date().getFullYear(); //To get the Current Year
        for (let year = currentYear; year > 1700; year-- )
        {
            data.push({label: year, value: year});

        }
        setYears(data);
   }
   const onChangedDiscount = (text) => {
        var value = parseFloat(text);
        if(value.toString() == 'NaN' || value < 0)
            value = 0
        else if( value > 99.99 )
            value = 99.99;
       
        setDiscount(value);
        console.log(value);
        console.log(discount);
   }
   
    const confirmLayout = () => {
      return(
        <ScrollView
            style={styles.scrollView}>
                <View style={styles.viewInputGroup}>
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
                            onBlur={() => onGSTChanged()}
                        />
                        {
                            errorData.isValidGST ? null : <Text style={{ color: 'red' }}>{errorData.gst}</Text>
                        }
                    </View>
                    <View>
                    <Text style={styles.textView}>
                            Incorporation year
                        </Text>
                        {years.length < 1 ? (
                            <DropDownPicker
                                items={[
                                    {label: new Date().getFullYear(), value: new Date().getFullYear()},
                                    {label: new Date().getFullYear()-1, value: new Date().getFullYear()-1},
                                ]}
                                containerStyle={{height: 40}}
                                style={{backgroundColor: '#fafafa'}}
                                dropDownStyle={{backgroundColor: '#fafafa'}}
                                onChangeItem={item => setYear(item.value)}
                            />
                        ) : (
                            <DropDownPicker
                                items={years}
                                defaultValue={incorporationyear}
                                value={incorporationyear}
                                containerStyle={{height: 40}}
                                style={{backgroundColor: '#fafafa'}}
                                dropDownStyle={{backgroundColor: '#fafafa'}}
                                onChangeItem={item => setYear(item.value)}
                            />
                            )
                        }
                    </View>
                    <View>
                        <Text style={styles.textView}>
                            Bulk order
                        </Text>
                        <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={bulkorder}
                            value={bulkorder}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setBulkOrder(item.value)}
                        />
                    </View>
                    <View>
                        <Text style={styles.textView}>
                            Wholesaler
                        </Text>
                        <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={wholesaler}
                            value={wholesaler}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setWholesaler(item.value)}
                        />
                    </View>
                    <View>
                        <Text style={styles.textView}>
                            Managed inventory
                        </Text>
                        <DropDownPicker
                            items={[
                                {label: 'Yes', value: 1},
                                {label: 'No', value: 0},
                            ]}
                            defaultValue={managedinventory}
                            value={managedinventory}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa'}}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => setManagedInventory(item.value)}
                        />
                    </View>
                    {/* <View>
                        <Text style={styles.textView}>
                            Discount on shop
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            label={'discountonshop'}
                            placeholder="Discount on shop"
                            value={gst}
                            onChangeText={setGST}
                            onBlur={() => setDiscount()}
                        />
                    </View> */}
                    <View style={styles.row}>
                        <Text style={[styles.box, styles.textView]}>
                            Discount on shop
                        </Text>
                        <View style={[styles.box, styles.spin]}>
                            <InputSpinner
                                type={"float"}
                                max={'99.99'}
                                min={'0.0'}
                                step={'0.01'}
                                height={40}
                                rounded = {false}
                                showBorder={true}
                                // colorMax={"rgba(250,250,250,1)"}
                                // colorMin={"rgba(250,250,250,1)"}
                                buttonTextColor={"rgba(255,255,255,1)"}
                                buttonPressTextColor={"rgba(100,100,100,1)"}
                                color={"rgba(112,180,235,1)"}
                                value={discount}
                                onChange={(num)=>setDiscount(num)}
                            />
                        </View>
                    </View>
                    <Button
                        buttonStyle={styles.updateButton}
                        backgroundColor="#03A9F4"
                        title="Update shop details"
                        onPress={() => handleUpdate()}
                    />
            </View>
        </ScrollView>
    )}
    
    const initLayout = () => {
        return(
          <ScrollView
          style={styles.scrollView}>
              <View style={styles.viewInputGroup}>
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
                          onBlur={() => onGSTChanged()}
                      />
                      {
                          errorData.isValidGST ? null : <Text style={{ color: 'red' }}>{errorData.gst}</Text>
                      }
                  </View>
                  <View>
                      <Text style={styles.textView}>
                          Incorporation year
                      </Text>
                      {years.length < 1 ? (
                          <DropDownPicker
                              items={[
                                  {label: new Date().getFullYear(), value: new Date().getFullYear()},
                                  {label: new Date().getFullYear()-1, value: new Date().getFullYear()-1},
                              ]}
                              containerStyle={{height: 40}}
                              style={{backgroundColor: '#fafafa'}}
                              dropDownStyle={{backgroundColor: '#fafafa'}}
                              onChangeItem={item => setYear(item.value)}
                          />
                      ) : (
                          <DropDownPicker
                              items={years}
                              defaultValue={incorporationyear}
                              value={incorporationyear}
                              containerStyle={{height: 40}}
                              style={{backgroundColor: '#fafafa'}}
                              dropDownStyle={{backgroundColor: '#fafafa'}}
                              onChangeItem={item => setYear(item.value)}
                          />
                          )
                      }
                  </View>
                  <View>
                      <Text style={styles.textView}>
                          Bulk order
                      </Text>
                      <DropDownPicker
                          items={[
                              {label: 'Yes', value: 1},
                              {label: 'No', value: 0},
                          ]}
                          containerStyle={{height: 40}}
                          style={{backgroundColor: '#fafafa'}}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={item => setBulkOrder(item.value)}
                      />
                  </View>
                  <View>
                      <Text style={styles.textView}>
                          Wholesaler
                      </Text>
                      <DropDownPicker
                          items={[
                              {label: 'Yes', value: 1},
                              {label: 'No', value: 0},
                          ]}
                          containerStyle={{height: 40}}
                          style={{backgroundColor: '#fafafa'}}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={item => setWholesaler(item.value)}
                      />
                  </View>
                  <View>
                      <Text style={styles.textView}>
                          Managed inventory
                      </Text>
                      <DropDownPicker
                          items={[
                              {label: 'Yes', value: 1},
                              {label: 'No', value: 0},
                          ]}
                          containerStyle={{height: 40}}
                          style={{backgroundColor: '#fafafa'}}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={item => setManagedInventory(item.value)}
                      />
                  </View>
                  <View style={styles.row}>
                      <Text style={[styles.box, styles.textView]}>
                          Discount on shop
                      </Text>
                      <View style={[styles.box, styles.spin]}>
                          <InputSpinner
                              type={"float"}
                              max={'99.99'}
                              min={'0.0'}
                              step={'0.01'}
                              height={40}
                              rounded = {false}
                              showBorder={true}
                              // colorMax={"rgba(250,250,250,1)"}
                              // colorMin={"rgba(250,250,250,1)"}
                              buttonTextColor={"rgba(255,255,255,1)"}
                              buttonPressTextColor={"rgba(100,100,100,1)"}
                              color={"rgba(112,180,235,1)"}
                              onChange={(num)=>setDiscount(num)}
                          />
                      </View>
                  </View>
                  <Button
                      buttonStyle={styles.updateButton}
                      backgroundColor="#03A9F4"
                      title="Update shop details"
                      onPress={() => handleUpdate()}
                  />
          </View>
      </ScrollView>
      )}
    return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            {confirmLayout()}
            {/* {years.length > 0 ? confirmLayout() : initLayout()} */}
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

    box: {
        flex: 1,
        borderColor: 'rgba(20,123,136,1)',
        height: 30,
    },

    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
        marginBottom: 20,
    },
    spin: {
        alignItems: "flex-end",
    }

})
export default ShopServicesScreen;