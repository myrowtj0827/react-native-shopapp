export const stateConditionString = state => {
    let navigateTo = '';
    if (state.isLoading) {
        navigateTo = 'LOAD_APP';
        return navigateTo;
    }
    if (state.isSignedIn && state.userToken && state.isSignedUp) {
        navigateTo = 'LOAD_HOME';
    }
    if (!state.isSignedUp && state.noAccount) {
        navigateTo = 'LOAD_SIGNUP';
    }
    if (!state.isSignedIn && !state.noAccount) {
        navigateTo = 'LOAD_SIGNIN';
    }
    if (state.isOTP) {
        navigateTo = 'LOAD_OTP';
    }
    return navigateTo;
};