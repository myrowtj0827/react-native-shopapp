/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import Toast from 'react-native-simple-toast';
// import ModalDropdown from 'react-native-modal-dropdown';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  View,
  Text,
  Button,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import { ORDERAPIKit } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from '../../utils/authContext';


const UpdateOrderDetailScreen = ({ navigation, route }) => {
  const { signIn } = useContext(AuthContext);

  const [date, setDate] = useState(new Date(moment.utc(route.params.orderpickup).format("YYYY-MM-DD")));
  const [originDate] = useState(new Date(moment.utc(route.params.orderpickup).format("YYYY-MM-DD")));
  const [showDate, setShowDate] = useState(false);
  const [time, setTime] = useState(new Date(moment.utc(route.params.orderpickup).format("YYYY-MM-DD")));  // not utc
  const [showTime, setShowTime] = useState(false);

  const [originpickupdate] = useState(moment.utc(route.params.orderpickup).format("YYYY-MM-DD"));
  const [originpickuptime] = useState(moment.utc(route.params.orderpickup).format("HH:mm:ss")); // not utc
  const [orderpickupdate, setOrderPickupDate] = useState(moment.utc(route.params.orderpickup).format("YYYY-MM-DD"));  // u
  const [orderpickuptime, setOrderPickupTime] = useState(moment.utc(route.params.orderpickup).format("HH:mm:ss")); // not utc

  const [loading, setLoading] = useState(false);
  const [orderRef] = useState(route.params.orderref);
  const [originorderstatusid, setOriginOrderStatusid] = useState(-1);
  const [orderstatusid, setOrderStatusid] = useState(-1);
  const [orderstatuses, setOrderStatuses] = useState([]);
  // const [isDisableOrderStatus] = useState(route.params.orderstatus > 9 ? false : true );
  const [isEditable, setEditable] = useState(true);
  const [isDisableUpdateBtn, setDisableUpdateBtn] = useState(true);
  const [isStatus, setEditableStatue] = useState(true);
  
  const [orderTotalOrigin, setOrderTotalOrigin] = useState([]);
  const [orderdetails, setOrderDetails] = useState([]);
  const [orderRoot, setOrderRoot] = useState({
    orderref: '',
    orderquantity: 0,
    ordersubtotal: 0,
    orderdiscount: 0,
    ordertotal: 0,
    status: "",
    statusid: 0,
    orderpickuptime: '',
    discountpercentage: 0,
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
    console.log(route);
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
            // console.log(data);
            setOrderInit(data);
            setOrderTotalOrigin(data);
            setOrderDetails(data.orderdetails);
            LoadOrderStatus(data.orderref, data);
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
              //Toast.show("error: Authentication failed");
            }
            else
              console.log(error);
          }

          setLoading(true);
          ORDERAPIKit.get('/shoporder/order/' + orderRef)
            .then(onSuccess)
            .catch(onFailure);
        

          // VII.	Get orders next status for shop route. (baseURL/shoporder/status/next/<orderref>)
          const LoadOrderStatus = (orderref, orderRoot)=> {

            const onSuccessOrderStatus = ({ data }) => {
              setLoading(false);
              console.log(data);
              setOrderStatusList(data.orderstatus, orderRoot);
            }
            const onFailureOrderStatus = error => {
              setLoading(false);
              if(error.toString().includes('409'))
                console.log( "message: No next status");
              else if(error.toString().includes('401'))
                console.log( "error: Authentication failed");
              else
                console.log(error);

              setOrderStatusList([], orderRoot);
            }

            setLoading(true);
            ORDERAPIKit.get('/shoporder/status/next/' + orderref)
              .then(onSuccessOrderStatus)
              .catch(onFailureOrderStatus);
          }
        }

      };
      bootstrapAsync();
    });
    return unsubscribe;
  }, [navigation]);
  
  const setOrderInit = (data) => {

    let quantity = 0;
    let ordersubtotal = 0;
    let orderdiscount = 0;
    let ordertotal = 0;

    data.orderdetails.forEach(element => {
      if(element.available == true) {
        quantity += element.quantity;
        ordersubtotal += element.quantity*element.unitprice;
        orderdiscount += data.discountpercentage*element.unitprice*element.quantity*0.01;
      }
    })

    orderdiscount = Number(orderdiscount.toFixed(2));  // float round
    ordertotal = ordersubtotal-orderdiscount;

    let tempOrderData = {
      orderref: data.orderref,
      orderquantity: quantity,
      ordersubtotal: ordersubtotal,
      orderdiscount: orderdiscount,
      ordertotal: ordertotal,
      status: data.status,
      statusid: data.statusid,
      orderpickuptime: data.orderpickuptime,
      discountpercentage: data.discountpercentage,
      orderdetails: [],
    };

    setOrderRoot(tempOrderData);
  }

  const resetOrderRoot = (detailData) => {

    let quantity = 0;
    let ordersubtotal = 0;
    let orderdiscount = 0;
    let ordertotal = 0;

    detailData.forEach(element => {
      if(element.available == true) {
        quantity += element.quantity;
        ordersubtotal += element.quantity*element.unitprice;
        orderdiscount += orderRoot.discountpercentage*element.unitprice*element.quantity*0.01;
      }
    })

    orderdiscount = Number(orderdiscount.toFixed(2));  // float round
    ordertotal = ordersubtotal-orderdiscount;

    let tempOrderData = {
      orderref: orderRoot.orderref,
      orderquantity: quantity,
      ordersubtotal: ordersubtotal,
      orderdiscount: orderdiscount,
      ordertotal: ordertotal,
      status: orderRoot.status,
      statusid: orderRoot.statusid,
      orderpickuptime: orderRoot.orderpickuptime,
      discountpercentage: orderRoot.discountpercentage,
      orderdetails: [],
    };

    setOrderRoot(tempOrderData);

    if( ordertotal < 1 )  // disable update button
      setDisableUpdateBtn(true);
    else
      setDisableUpdateBtn(false);
  }
  
  const setOrderStatusList = (orderstatus, orderRoot) => {
    var nextOrderStatus = [];
    nextOrderStatus.push({label: orderRoot.status, value: orderRoot.statusid}); // add oneselves status

    if( orderstatus != undefined ) {  // add next status
      orderstatus.forEach(element => {
        nextOrderStatus.push({label: element.status, value: element.orderstatusid});
      })
    }
      
    setOriginOrderStatusid(orderRoot.statusid);
    setChangeOrderStatusid(orderRoot.statusid);
    setOrderStatuses(nextOrderStatus);

    if( nextOrderStatus.length > 1 ) {
      setEditableStatue(false);
      setDisableUpdateBtn(false);
    }
    else {  // next status is not exist.
      setEditableStatue(true);
      setDisableUpdateBtn(true);
    }
  }

  const onDateChange = (event, selectedDate) => {
    setShowDate(Platform.OS === 'ios');
    if (selectedDate === undefined) {
      console.log('-------- date controller canceled! ------');
      return;
    }
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setOrderPickupDate(moment(currentDate).format("YYYY-MM-DD"));
  };
 
  const showDatepicker = () => {
    setShowDate(true);
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTime(Platform.OS === 'ios');
    if (selectedDate === undefined) {
      console.log('------- time controller canceled! --------');
      return;
    }

    const currentDate = selectedDate || date;
    setTime(currentDate); // only for datepicker here
    setOrderPickupTime(moment(currentDate).format("HH:mm:ss"));
  };
 
  const showTimepicker = () => {
    setShowTime(true);
  };

  const updateLiveOrders = () => {
    // check if current state is changed
    let bUpdate = false;
    // if(orderTotalOrigin.orderquantity != orderRoot.orderquantity ||
    //   orderTotalOrigin.ordersubtotal != orderRoot.ordersubtotal ||
    //   orderTotalOrigin.ordertotal != orderRoot.ordertotal/* ||
    //   orderTotalOrigin.status != orderRoot.status*/ )
    //   bUpdate = true;
      
    if( orderstatusid != originorderstatusid ) {  // status is not selected 
      // Toast.show('Please select an status.', Toast.SHORT);
      bUpdate = true;
    }

    orderdetails.forEach(a => {
      orderTotalOrigin.orderdetails.forEach(b => {
        if( a.orderdetailid == b.orderdetailid ) {
          if( a.unitprice != b.unitprice ||
              a.quantity != b.quantity ||
              a.available != b.available ||
              a.status != b.status ) {
                bUpdate = true;
              }
        }
      })
    });

    let pickOriginDateTime = originpickupdate + ' ' + originpickuptime; 
    let pickDateTime = orderpickupdate + ' ' + orderpickuptime;

    if( pickOriginDateTime != pickDateTime )
      bUpdate = true;

    if(bUpdate == false) {  // is not changed
      Toast.show('Nothing changed.', Toast.SHORT);
      return;
    }
    
    let updateOrderDetails = [];

    orderdetails.forEach(element => {
      const data = {
        "orderdetailid": element.orderdetailid,
        "quantity": element.quantity,
        "unitprice": element.unitprice,
        "available": element.available,
      }

      updateOrderDetails.push(data);
    });

    const payload = {
        "orderref": orderRoot.orderref,
        "ordersubtotal": orderRoot.ordersubtotal,
        "orderquantity": orderRoot.orderquantity,
        "orderpickuptime": pickDateTime,
        "orderstatusid": orderstatusid,
        "orderdetails": updateOrderDetails,
    }

    // console.log(updateOrderDetails);

    const onSuccess = ({ data }) => {
      setLoading(false);
      console.log(data);
      if(data.error)
        Toast.show(data.error.message);
      else
        Toast.show(data.message);
      navigation.navigate('Home');
    }
    const onFailure = error => {
      console.log(error);
      setLoading(false);
      Toast.show('Failed to update.');
    }

    setLoading(true);
    ORDERAPIKit.patch('/shoporder/update/orderdetails', payload)
      .then(onSuccess)
      .catch(onFailure);
  }

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
  const onOrderPressed = (item) => {
    console.log(item.orderref);
    // navigation.navigate('Update Order Detail', item)
  }

  const onAvailablePressed = (item, index) => {
    var tempdata = [];
    const newitem = {
      ...item,
      available: !item.available
    }

    orderdetails.forEach(element => {
      tempdata.push(element);
    })

    tempdata[index] = newitem;
    setOrderDetails(tempdata);
    resetOrderRoot(tempdata);
  }

  const onMinusQuantityPressed = (item, index) => {
    var tempdata = [];
    var new_quantity = item.quantity;
    new_quantity--;
    if(new_quantity < 1 )  new_quantity = 1;

    const newitem = {
      ...item,
      quantity: new_quantity
    }

    orderdetails.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = newitem;
    setOrderDetails(tempdata);

    resetOrderRoot(tempdata);
  }

  const onPlusQuantityPressed = (item, index) => {
    var tempdata = [];
    var maxQuantity = 0;
    orderTotalOrigin.orderdetails.forEach(a => {
      if( a.orderdetailid == item.orderdetailid ) {
          maxQuantity =  a.quantity;
      }
    })

    var new_quantity = item.quantity;
    new_quantity++;
    if(new_quantity > maxQuantity )  new_quantity = maxQuantity;

    const newitem = {
      ...item,
      quantity: new_quantity
    }

    orderdetails.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = newitem;
    setOrderDetails(tempdata);

    resetOrderRoot(tempdata);
  }

  const onMinusPricePressed = (item, index) => {
    var tempdata = [];
    var new_unitprice = item.unitprice;
    new_unitprice--;
    if(new_unitprice < 0 )  new_unitprice = 0;

    const newitem = {
      ...item,
      unitprice: new_unitprice
    }
    orderdetails.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = newitem;
    setOrderDetails(tempdata);

    resetOrderRoot(tempdata);
  }

  const onPlusPricePressed = (item, index) => {
    var tempdata = [];
    var new_unitprice = item.unitprice;
    new_unitprice++;
    if(new_unitprice > 1000000 )  new_unitprice = 1000000;

    const newitem = {
      ...item,
      unitprice: new_unitprice
    }
    orderdetails.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = newitem;
    setOrderDetails(tempdata);

    resetOrderRoot(tempdata);
  }

  const setChangeOrderStatusid = (id) => {
    setOrderStatusid(id);
    if(id > 12)
      setEditable(true);
    else
      setEditable(false);
  }
  const renderItem = ({ item, index }) => {
    return (
      //<TouchableOpacity onPress={() => onOrderPressed(item, index)}>
        <View style={styles.item}>
          <Image
            style={styles.image}
            source={item.imageurl ? { uri: item.imageurl } : null}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ marginTop: 1, fontSize: 16 }}>{item.product}</Text>
            <View style={{ marginTop: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontSize: 15 }}>{item.brand}</Text>
              <Text style={{ flex: 1, fontSize: 15, marginLeft: 0 }}>{item.weight} {item.weightunit}</Text>
              {
                renderCircleView(item)
              }
            </View>

            <View style={{ flexDirection: 'row', marginTop: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', marginTop: 0 }}>
                {/* <TouchableOpacity onPress={() => onMinusPricePressed(item, index)}
                disabled={isEditable || !item.available} >
                {isEditable || !item.available ? 
                  <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="minus-box"
                      color="rgba(128, 128, 164, 1)"
                      size={22}
                  />
                :
                <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="minus-box"
                      color="rgba(32, 128, 164,1)"
                      size={22}
                  />
                }
                </TouchableOpacity> */}
                <Text style={{ fontSize: 15, paddingHorizontal: 0 }}>PRICE: ₹{item.unitprice}</Text>
                {/* <TouchableOpacity onPress={() => onPlusPricePressed(item, index)}
                disabled={isEditable || !item.available} >
                {isEditable || !item.available ? 
                  <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="plus-box"
                      color="rgba(128, 128, 164,1)"
                      size={22}
                  />
                :
                  <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="plus-box"
                        color="rgba(32, 128, 164,1)"
                        size={22}
                    />
                  }
                </TouchableOpacity> */}
              </View>

              <View style={{ flexDirection: 'row', marginTop: 0}}>
                <TouchableOpacity onPress={() => onMinusQuantityPressed(item, index)}
                  disabled={isEditable || !item.available} >
                  {isEditable || !item.available ? 
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="minus-box"
                        color="rgba(128, 128, 164,1)"
                        size={22}
                    /> : 
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="minus-box"
                        color="rgba(32, 128, 164,1)"
                        size={22}
                    />
                  }
                  
                </TouchableOpacity>
                <Text style={{ fontSize: 15, paddingHorizontal: 10 }}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => onPlusQuantityPressed(item, index)}
                  disabled={isEditable || !item.available} >
                  {isEditable || !item.available ? 
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="plus-box"
                        color="rgba(128, 128, 164,1)"
                        size={22}
                    /> :
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="plus-box"
                        color="rgba(32, 128, 164,1)"
                        size={22}
                    />
                  }
                </TouchableOpacity>
              </View>

              {isEditable ? 
                  <TouchableOpacity onPress={() => onAvailablePressed(item, index)}
                    disabled={isEditable} >
                    {item.available ? (
                        <MaterialCommunityIcons
                        style = {{paddingRight: 8}}
                        name="check-circle-outline"
                        color="gray"
                        size={20}/>
                      ) : (
                          <MaterialCommunityIcons
                          style = {{paddingRight: 8}}
                          name="checkbox-blank-circle-outline"
                          color="gray"
                          size={20}/>
                      )
                    }
                  </TouchableOpacity>
                : <TouchableOpacity onPress={() => onAvailablePressed(item, index)}
                    disabled={isEditable} >
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
                  </TouchableOpacity>
                }
              
            </View>
          </View>
        </View>
      //</TouchableOpacity>
      
    )
  }
  return (
    <>
      <View style={styles.container}>
        <View style={{flex: 3}}>
          <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
          <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, alignSelf: "center" }}>Order view for {orderRoot.orderref}</Text>
          </View>
          <FlatList
            data={orderdetails}
            keyExtractor={(item, index) => index.toString()}
            renderItem={orderdetails ? renderItem : null}
          />
        </View>
        <View style={{flex: 1}}>
          <ScrollView>
          <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between', marginHorizontal: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 1}}>
              <Text style={{ fontSize: 16 }}>Total Quantity: {orderRoot.orderquantity}</Text>
              <Text style={{ fontSize: 16 }}>Sub Total: {orderRoot.ordersubtotal}</Text>                    
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 1}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ fontSize: 16 }}>Ready Date:</Text>
                <Text  disabled={isEditable} style={{ fontSize: 16 }} onPress={showDatepicker}> {orderpickupdate}</Text>
                <View>
                  {showDate && (
                    <DateTimePicker
                      testID="datePicker"
                      value={date}
                      mode='date'
                      is24Hour={true}
                      display="default"
                      minimumDate={originDate}
                      onChange={(event, date) => onDateChange(event, date)}
                    />
                  )}
                </View>
                </View>
              <Text style={{ fontSize: 16 }}>Discount: {orderRoot.orderdiscount}</Text>                    
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 1}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ fontSize: 16 }}>Ready Time:</Text>
                <Text  disabled={isEditable} style={{ fontSize: 16 }} onPress={showTimepicker}> {orderpickuptime}</Text>
                <View>
                  {showTime && (
                    <DateTimePicker
                      testID="datePicker"
                      value={time}
                      mode='time'
                      is24Hour={true}
                      display="default"
                      onChange={(event, date) => onTimeChange(event, date)}
                    />
                  )}
                </View>
              </View>
              <Text style={{ fontSize: 16, marginLeft: 30}}>Total: {orderRoot.ordertotal}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ fontSize: 16, alignSelf: "center", marginTop: -100, marginLeft: 0}}>Status: </Text>
                  <View style={{fontSize: 16, alignSelf: "center", marginLeft: 10}}>
                  {orderstatuses.length < 1 ? (
                      <DropDownPicker
                      items={[
                        { label: "", value: '1'},
                      ]}
                          disabled={isStatus}
                          defaultValue={'1'}
                          containerStyle={{width: 120, height: 36, marginTop: 1, marginBottom: 100}}
                          style={{backgroundColor: '#fafafa'}}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={item => setChangeOrderStatusid(item.value)}
                      />
                  ) : (
                        <DropDownPicker
                            items={orderstatuses}
                            defaultValue={orderRoot.statusid}
                            value={orderRoot.statusid}
                            disabled={isStatus}
                            containerStyle={{width: 120, height: 36, marginTop: 1, marginBottom: 100}}
                            onChangeItem={item => setChangeOrderStatusid(item.value)}
                        />
                      )
                  }
                  </View>
                </View>
              <View style={{ fontSize: 16, alignSelf: "center", marginTop: -100, paddingHorizontal: 20 }}>
                <Button
                    buttonStyle={styles.updateButton}
                    backgroundColor="#03A9F4"
                    title="Update order"
                    disabled={isDisableUpdateBtn}
                    onPress={() => updateLiveOrders()}
                />
              </View>
            </View>
          </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
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

  updateButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 80,
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropdown: {
  }

});

export default UpdateOrderDetailScreen;