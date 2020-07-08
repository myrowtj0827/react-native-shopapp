import React, {useContext, useEffect, useState} from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import {
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../../res/assets/images/logo.png';
import { AuthContext } from '../../utils/authContext';
import AsyncStorage from '@react-native-community/async-storage'
import { State } from 'react-native-gesture-handler';
import SHOPAPIKit, { setShopClientToken } from '../../utils/apikit';
export function DrawContent(props) {
    const [username, setUserName] = useState('')
    const [phonenumber, setPhoneNumber] = useState('')
    const { signOut } = useContext(AuthContext);

    const [showProfile, setShowProfile] = useState(false);
    const [showShopProduct, setShowShopProduct] = useState(false);

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
                    console.log(data)
                    setUserName(data.shopname);
                    setPhoneNumber(data.mobile);                    
                }
                const onFailure = error => {
                    console.log(error);
                }       
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

    const handleProfile = () => {
        setShowProfile(!showProfile)
    }

    const handleShopProduct = () => {
        setShowShopProduct(!showShopProduct)
    }

    
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{ flexDirection: 'row', marginTop: 15 }}>
                            <Avatar.Image
                                source={Logo}
                                size={50} 
                                style={{ backgroundColor: 'rgba(15,10,180,1)' }}
                                />
                            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                                <Title style={styles.title}>{username}</Title>
                                <Caption style={styles.caption}>{phonenumber}</Caption>
                            </View>
                        </View>
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="home-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Home"
                            onPress={() => {props.navigation.navigate('Home') }}>
                        </DrawerItem>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="cart-arrow-right"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Profile"
                            onPress={() => handleProfile()}>
                        </DrawerItem>
                        {
                            showProfile ? (
                                <Drawer.Section style={styles.drawerSubSection}>
                                    <DrawerItem
                                        icon={({ color, size }) => (
                                            <MaterialCommunityIcons
                                                name="cart-outline"
                                                color={color}
                                                size={size}
                                            />
                                        )}
                                        label="Shop Profile"
                                        onPress={() => {props.navigation.navigate('ShopProfile') }}
                                    >
                                    </DrawerItem>
                                    <DrawerItem
                                        icon={({ color, size }) => (
                                            <MaterialCommunityIcons
                                                name="cart"
                                                color={color}
                                                size={size}
                                            />
                                        )}
                                        label="Shop Services"
                                        onPress={() => {props.navigation.navigate('ShopServices') }}
                                        >
                                    </DrawerItem>
                                    <DrawerItem
                                        icon={({ color, size }) => (
                                            <MaterialCommunityIcons
                                                name="update"
                                                color={color}
                                                size={size}
                                            />
                                        )}
                                        label="Subscription"
                                        onPress={() => {props.navigation.navigate('Subscription') }}
                                        >
                                    </DrawerItem>
                                    <DrawerItem
                                        icon={({ color, size }) => (
                                            <MaterialCommunityIcons
                                                name="map-marker-multiple"
                                                color={color}
                                                size={size}
                                            />
                                        )}
                                        label="Shop Map Location"
                                        onPress={() => {props.navigation.navigate('ShopLocation') }}
                                        >
                                    </DrawerItem>
                                </Drawer.Section>
                            ) : null
                        }
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="cart-plus"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Wholesalers"
                            onPress={() => {props.navigation.navigate('WholeSaler') }}
                            >
                        </DrawerItem>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="cart"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Shop Product"
                            onPress={() => handleShopProduct()}
                            >
                        </DrawerItem>
                        {
                            showShopProduct ? (
                                <Drawer.Section style={styles.drawerSubSection}>
                                <DrawerItem
                                    icon={({ color, size }) => (
                                        <MaterialCommunityIcons
                                            name="cart-plus"
                                            color={color}
                                            size={size}
                                        />
                                    )}
                                    label="Products"
                                    onPress={() => {props.navigation.navigate('Products') }}
                                    >
                                </DrawerItem>
                                <DrawerItem
                                    icon={({ color, size }) => (
                                        <MaterialCommunityIcons
                                            name="cart-plus"
                                            color={color}
                                            size={size}
                                        />
                                    )}
                                    label="List Products"
                                    onPress={() => {props.navigation.navigate('ProductListing') }}
                                    >
                                </DrawerItem>
                            </Drawer.Section>
                            ) : null
                        }
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="history"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Order History"
                            onPress={() => {props.navigation.navigate('Order History') }}
                            >
                        </DrawerItem>
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>

            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={({ color, size }) => (
                        <MaterialCommunityIcons
                            name="exit-to-app"
                            color={color}
                            size={size}
                        />
                    )}
                    label="Sign out"
                    onPress={() => signOut()}>

                </DrawerItem>

            </Drawer.Section>
        </View>
    )
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    title: {
        fontSize: 16,
        marginTop: 3,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    drawerSubSection: {
        marginLeft: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});