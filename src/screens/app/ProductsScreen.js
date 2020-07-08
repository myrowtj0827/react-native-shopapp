/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Button,
  View,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import NumericInput from 'react-native-numeric-input'
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-community/async-storage'
import { Toolbar, Searchbar } from 'react-native-paper';
import { colors } from '../../res/style/colors'
import SHOPAPIKit, { ORDERAPIKit, setOrderClientToken } from '../../utils/apikit';
import Logo from "../../res/assets/images/logo.png"
import { AuthContext } from '../../utils/authContext';

const ProductsScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [alert, setAlert] = useState(false);
  const [alertOneItem, setAlertOneItem] = useState(false);
  const [deleteItem, setDeleteItem] = useState([]);
  
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
              console.log(userToken)
          } catch (e) {
              console.log(e);
          }

          if( userToken != null ) {
              const onSuccess = ({ data }) => {
                setLoading(false);              
                setProducts(data.shopproducts);
                //console.log(data);
              }
              const onFailure = error => {
                  setLoading(false);
                  setProducts([]);
                  if(error.toString().includes('409')) {
                    console.log( "message: Failed");
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
            SHOPAPIKit.get('/shop/product/products')
                .then(onSuccess)
                .catch(onFailure);
          }
      };
      bootstrapAsync();
    });

    return unsubscribe;
  }, []);

  const confirmProduct = () => {
    var data = { products: []}
    products.forEach(element => {
      if(element.quantity != 'undefined' && element.quantity > 0)
      {
        data.products.push({ "productid": element.productid,
                        "quantity": element.quantity,
                        "price": element.unitprice})
      }
    });
    
    const onSuccess = ({ data }) => {
      setLoading(false);
      Toast.show('Successfully updated');
    }
    const onFailure = error => {
      setLoading(false);
      if(error.toString().includes('409')) {
        console.log( "message: Failed");
        Toast.show('Failed to update.');
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
    SHOPAPIKit.post('/shop/product/productlisting', data)
      .then(onSuccess)
      .catch(onFailure);
      
    setAlert(false)
  }

  const updateProduct = () => {
    var count = 0;
    products.forEach(element => {
      if(element.quantity != 'undefined' && element.quantity > 0) 
      {
        count++;
      }
    });
    if(count == 0){
        Toast.show('Please select product quantity than one over at least', Toast.SHORT);
    }
    else{
      setAlert(true);
    }
  }

  const onDeletePressed = (item, index) => {
      let data = {
        item: item,
        index: index
      }
      setDeleteItem(data);
      setAlertOneItem(true);
  }

  const confirmOneDelete = () => {
    setAlertOneItem(false);
    if(deleteItem.length < 1)
      return;

    const item = deleteItem.item;
    const index = deleteItem.index;

    console.log(index);
    console.log(item);

    if( item.productid != null ) {
      const onSuccess = ({ data }) => {
        setLoading(false);         
        console.log(data);
        Toast.show(data.message);

        // delete from data list for displaying
        var tempdata = [];
        products.forEach(element => {
          if(element.productid != item.productid)
            tempdata.push(element);
        })

        setProducts(tempdata);
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          if(error.toString().includes('409')) {
            console.log( "message: Failed");
            Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
            reSignIn();
            //Toast.show("error: Authentication failed");
          }
          else
            console.log(error);
      }

      console.log(item.productid);

      setLoading(true);
      SHOPAPIKit.delete('/shop/product/delist/' + item.productid)
          .then(onSuccess)
          .catch(onFailure);
      }
  }
  const onOneUpdatePressed = (item, index) => {
    if( item.productid != null ) {
      const onSuccess = ({ data }) => {                
        console.log(data);
        Toast.show(data.message);
      }
      const onFailure = error => {
        if(error.toString().includes('409')) {
          console.log( "message: Failed");
          Toast.show('Fail to update.');
        }
        else if(error.toString().includes('401')) {
          console.log( "error: Authentication failed");
          reSignIn();
          //Toast.show("error: Authentication failed");
        }
        else
          console.log(error);
      }
  
      const payload = {
          "productid": item.productid,
          "quantity": item.quantity,
          "unitprice": item.unitprice
      }

      console.log(payload);
      SHOPAPIKit.patch('/shop/product/update/',  payload)
          .then(onSuccess)
          .catch(onFailure);
    }
  }
  const onMinusQuantityPressed = (item, index) => {
    var tempdata = [];
    item.quantity--;
    if(item.quantity < 1 )  item.quantity = 1;

    products.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProducts(tempdata);
  }

  const onPlusQuantityPressed = (item, index) => {
    var tempdata = [];
    item.quantity++;
    if(item.quantity > 1000000 )  item.quantity = 1000000;

    products.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProducts(tempdata);
  }

  const onMinusPricePressed = (item, index) => {
    var tempdata = [];
    item.unitprice--;
    if(item.unitprice < 0 )  item.unitprice = 0;

    products.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProducts(tempdata);
  }

  const onPlusPricePressed = (item, index) => {
    var tempdata = [];
    item.unitprice++;
    if(item.unitprice > 100000 )  item.unitprice = 100000;

    products.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProducts(tempdata);
  }
  const renderCircleView = (item) => {
    if(item.symbol == 'G'){
      return(
        <View style={styles.circleview_green} />
      )  
    }
    else if(item.symbol == 'R'){
      return(
        <View style={styles.circleview_red} />
      )  
    }
    else if(item.symbol == 'Y'){
      return(
        <View style={styles.circleview_yellow} />
      )  
    }
    else if(item.symbol == 'B'){
      return(
        <View style={styles.circleview_brown} />
      )  
    }
    else{
      return(
        <View style={styles.circleview_white} />
      )
    }

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
              <Text style={{ flex: 1, fontSize: 15, marginLeft: -30 }}>{item.weight} {item.weightunit}</Text>
              {
                renderCircleView(item)
              }
            </View>

            <View style={{ flexDirection: 'row', marginTop: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', marginTop: 0 }}>
                <TouchableOpacity onPress={() => onMinusPricePressed(item, index)}>
                  <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="minus-box"
                      color="rgba(32, 128, 164,1)"
                      size={22}
                  />
                </TouchableOpacity>
                <Text style={{ fontSize: 15, paddingHorizontal: 8 }}>₹{item.unitprice}</Text>
                <TouchableOpacity onPress={() => onPlusPricePressed(item, index)}>
                  <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="plus-box"
                      color="rgba(32, 128, 164,1)"
                      size={22}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', marginTop: 0}}>
                <TouchableOpacity onPress={() => onMinusQuantityPressed(item, index)}>
                  <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="minus-box"
                      color="rgba(32, 128, 164,1)"
                      size={22}
                  />
                </TouchableOpacity>
                <Text style={{ fontSize: 15, paddingHorizontal: 10 }}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => onPlusQuantityPressed(item, index)}>
                  <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="plus-box"
                      color="rgba(32, 128, 164,1)"
                      size={22}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 0}}>
                <TouchableOpacity onPress={() => onDeletePressed(item, index)}>
                  <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="delete-circle-outline"
                        color="red"
                        size={22}/>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => onOneUpdatePressed(item, index)}>
                  <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="backup-restore"
                        color="green"
                        size={22}/>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </View>
      //</TouchableOpacity>
    )
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        
        { loading == false && products.length < 1 ? 
            <View  style={styles.noProducts}> 
              <Text style={{fontSize: 18, marginTop: 100, color: "rgba(128, 128, 128, 1)", textAlign: "center"}}>
                No Shop Product, Please List Products.
              </Text>
              <Text style={{fontSize: 18, marginTop: 20, color: "rgba(128, 128, 128, 1)", textAlign: "center"}}>
                Shop Product -> List Products
              </Text>
            </View>
            : null
        }
        <View
          style={styles.listContainer}>
          <FlatList
            data={products}
            keyExtractor={(item, index) => index.toString()}
            renderItem={products ? renderItem : null} />
            {
              products.length != 0 ? 
              <View style={styles.buttonContainer}>
                <Button title='Update' onPress={updateProduct} />
              </View> : null
            }
        </View>
        <Spinner
          visible={loading} size="large"/>


        <AwesomeAlert
            show={alert}
            showProgress={false}
            title="Update products to shop?"
            titleStyle={{fontSize: 16}}
            message=""
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonStyle={{width: 60, marginRight: 20, alignItems: "center"}}
            confirmButtonStyle={{width: 60, marginLeft: 20, alignItems: "center"}}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setAlert(false);
            }}
            onConfirmPressed={() => {
              confirmProduct();
            }}
        />
        <AwesomeAlert
            show={alertOneItem}
            showProgress={false}
            title="Remove products form shop?"
            titleStyle={{fontSize: 16}}
            message=""
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonStyle={{width: 60, marginRight: 20, alignItems: "center"}}
            confirmButtonStyle={{width: 60, marginLeft: 20, alignItems: "center"}}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setAlertOneItem(false);
            }}
            onConfirmPressed={() => {
              confirmOneDelete();
            }}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  searchbar: {
    margin: 4,
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
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#32CD32'
  },
  circleview_red: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#8B0000'
  },
  circleview_brown: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#D2691E'
  },
  circleview_white: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#FFFFFF'
  },
  circleview_yellow: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#808000'
  },
  buttonContainer: {
    height: 35,
    justifyContent: 'center',
    marginLeft: 25,
    marginRight: 25,
    marginTop: 10,
    marginBottom: 10,
  },
  noProducts: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    marginHorizontal: 30,
  }
});

export default ProductsScreen;