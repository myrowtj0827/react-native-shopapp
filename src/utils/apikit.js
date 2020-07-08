import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage'
// Create axios client, pre-configured with baseURL
let SHOPAPIKit = axios.create({
  baseURL: 'https://shopmoduleapi1.herokuapp.com',
  timeout: 10000,
});
// Set JSON Web Token in Client to be included in all calls
export const setShopClientToken = () => {
  SHOPAPIKit.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        // config.headers['Content-Type'] = 'application/json';
        return config;
    },
    error => {
        Promise.reject(error)
    });
};

export const ORDERAPIKit = axios.create({
  baseURL: 'https://ordermoduleapi1.herokuapp.com',
  timeout: 10000,
});

export const setOrderClientToken = () => {
  ORDERAPIKit.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        // config.headers['Content-Type'] = 'application/json';
        return config;
    },
    error => {
        Promise.reject(error)
    });
};


export default SHOPAPIKit;