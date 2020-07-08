export const reducer = (prevState, action) => {
    switch (action.type) {
      case 'TO_OTP_PAGE':
        return {
          ...prevState,
          isLoading: false,
          isSignedUp: false,
          noAccount: true,
          isOTP: true,
        };
      case 'TO_SIGNUP_PAGE':
        return {
          ...prevState,
          isLoading: false,
          isSignedUp: false,
          noAccount: true,
          isOTP: false,
        };
      case 'TO_SIGNIN_PAGE':
        return {
          ...prevState,
          isLoading: false,
          isSignedIn: false,
          noAccount: false,
          isOTP: false,
        };
      case 'RESTORE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
          isOTP: false,
        };
      case 'SIGNED_UP':
        return {
          ...prevState,
          isSignedIn: true,
          isSignedUp: true,
          isLoading: false,
          userToken: action.token,
          isOTP: false,
        };
      case 'SIGN_IN':
        return {
          ...prevState,
          isLoading: false,
          isSignedOut: false,
          isSignedIn: true,
          isSignedUp: true,
          userToken: action.token,
          isOTP: false,
        };
      case 'SIGN_OUT':
        return {
          ...prevState,
          isSignedOut: true,
          isLoading: false,
          isSignedIn: false,
          noAccount: false,
          isOTP: false,
        };
    }
  };
  
  export const initialState = {
    isLoading: true,
    isSignedOut: false,
    isSignedUp: false,
    noAccount: false,
    isSignedIn: false,
    userToken: null,
    isOTP: false,
  };