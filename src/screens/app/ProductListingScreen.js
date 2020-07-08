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

import { AuthContext } from '../../utils/authContext';
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

const ProductListingScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [alert, setAlert] = useState(false);

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
        setQuery('');
        onPressLatestProducts();
      }
      bootstrapAsync();
    });
    
    return unsubscribe;
  }, [navigation]);

  const setProductData = (data) => {
    let products = [];
    data.forEach(item => {
        let quantity = 0;
        let available = false;
        if(item.quantity != undefined)
          quantity = item.quantity;

        if(item.available != undefined)
          available = item.available;

        products.push({
          "productid": item.productid,
          "product": item.product,
          "description": item.description,
          "brand": item.brand,
          "unitprice": item.unitprice,
          "weight": item.weight,
          "weightunit": item.weightunit,
          "category": item.category,
          "symbol": item.symbol,
          "imageurl": item.imageurl,
          "quantity": quantity,
          "available": available,
      });
    });
    setData(products);
  }

  const handleSearch = (query) => {
    setQuery(query);
    if (query.length >= 3) {
      const onSuccess = ({ data }) => {                
        //setLoading(false);
        setProductData(data.products);
      }
      const onFailure = error => {
          //setLoading(false);
          setData([]);
          if(error.toString().includes('409')) {
            console.log( "message: no products");
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
            reSignIn();
            //Toast.show("error: Authentication failed");
          }
          else
            console.log(error);
      }
      //setLoading(true);
      ORDERAPIKit.get('/product/shop/' + query)
          .then(onSuccess)
          .catch(onFailure);
    }
    else if (query.length == 0) {
      onPressLatestProducts();
    }
    else {
      setData([]);
    }
  }

  const confirmProduct = () => {
    var products = { products: []};
    
    data.forEach(element => {
      if(element.quantity != undefined && element.quantity > 0 && element.available != undefined && element.available == true)
      {
        products.products.push({ 
                        "productid": element.productid,
                        "quantity": element.quantity,
                        "price": element.unitprice

                        // "productid": element.productid,
                        // "quantity": element.quantity,
                        // "price": element.unitprice,
                        // "product": element.product,
                        // "description": element.description,
                        // "brand": element.brand,
                        // "weight": element.weight,
                        // "weightunit": element.weightunit,
                        // "category": element.category,
                        // "symbol": element.symbol,
                        // "imageurl": element.imageurl,
                      })
      }
    });
    
    const onSuccess = ({ data }) => {
      setLoading(false);
      console.log(data);
      Toast.show('Successfully updated');
    }
    const onFailure = error => {
      setLoading(false);
      console.log(error);
      Toast.show(error.message);
    }
    setLoading(true);
    SHOPAPIKit.post('/shop/product/productlisting', products)
      .then(onSuccess)
      .catch(onFailure);

    setAlert(false)
  }

  const updateProduct = () => {
    var count = 0;
    data.forEach(element => {
      if(element.quantity != undefined && element.quantity > 0 && element.available != undefined && element.available == true) 
      {
        count++;
      }
    });
    if(count == 0){
        Toast.show('Please select product first and add to cart', Toast.SHORT);
    }
    else{
      setAlert(true);
    }
  }
  const onAvailablePressed = (item, index) => {
    var tempdata = [];
    item.available = !item.available; 

    data.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProductData(tempdata);
  }

  const onMinusQuantityPressed = (item, index) => {
    var tempdata = [];
    item.quantity--;
    if(item.quantity < 0 )  item.quantity = 0;

    data.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProductData(tempdata);
  }

  const onPlusQuantityPressed = (item, index) => {
    var tempdata = [];
    item.quantity++;
    if(item.quantity > 1000000 )  item.quantity = 1000000;

    data.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProductData(tempdata);
  }

  const onMinusPricePressed = (item, index) => {
    var tempdata = [];
    item.unitprice--;
    if(item.unitprice < 0 )  item.unitprice = 0;

    data.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProductData(tempdata);
  }

  const onPlusPricePressed = (item, index) => {
    var tempdata = [];
    item.unitprice++;
    if(item.unitprice > 100000 )  item.unitprice = 100000;

    data.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = item;

    setProductData(tempdata);
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

  const onPressLatestProducts = () => {
    const onSuccess = ({ data }) => {    
      setLoading(false);            
      setProductData(data.products);
    }
    const onFailure = error => {
        setLoading(false);
        setData([]);
        if(error.toString().includes('409')) {
          console.log( "message: No Latest products");
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
    ORDERAPIKit.get('/product/shop/products/latest')
      .then(onSuccess)
      .catch(onFailure);
  }

  const renderItem = ({ item, index }) => {
    return (
      //<TouchableOpacity onPress={() => onOrderPressed(item, index)}>
        <View style={styles.item}>
          <Image
            style={styles.image}
            source={item.imageurl ? { uri: item.imageurl } : Logo}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ marginTop: 1, fontSize: 16 }}>{item.product}</Text>
            <View style={{ marginTop: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontSize: 15 }}>{item.brand}</Text>
              <Text style={{ flex: 1, fontSize: 15, marginLeft: 20 }}>{item.weight} {item.weightunit}</Text>
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
                <Text style={{ fontSize: 15, paddingHorizontal: 8 }}>₹ {item.unitprice}</Text>
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

              <TouchableOpacity onPress={() => onAvailablePressed(item, index)}>
                {item.available ? (
                    <MaterialCommunityIcons
                    style = {{paddingRight: 5}}
                    name="check-circle-outline"
                    color="green"
                    size={22}/>
                  ) : (
                      <MaterialCommunityIcons
                      style = {{paddingRight: 5}}
                      name="cart-plus"
                      color="green"
                      size={22}/>
                  )
                }
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      //</TouchableOpacity>
    )
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Searchbar
          placeholder="Product Name"
          onChangeText={(query) => handleSearch(query)}
          value={query}
          style={styles.searchbar}
        />
        {/* <View style={{marginHorizontal: 1, marginBottom: 2}}>
          <Button title='Latest products' onPress={onPressLatestProducts} />
        </View> */}

        <View
          style={styles.listContainer}>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={data ? renderItem : null} />
            {
              data.length != 0 ? 
              <View style={styles.buttonContainer}>
                <Button title='Add Products' onPress={updateProduct} />
              </View> : null
            }
        </View>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <AwesomeAlert
          show={alert}
          showProgress={false}
          title="Add products to shop?"
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
    marginHorizontal: 1,
    marginVertical: 2
  }
});

export default ProductListingScreen;