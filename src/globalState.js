let state = {
    selectedAddress: undefined,
    selectedProfile: undefined,
    allStoreAddresses: undefined,
    allStores: [],
    selectedStore: {name: '', id: ''},
    storeTokens: []
}


export function GetGlobalState() {
    return state;
}

export function UpdateState(newState) {
    state = newState;
}

export function UpdateSelectedProfileInState(selectedProfile) {
    state.selectedProfile = selectedProfile;
}

export function UpdateSelectedAddressInState(addr) {
    state.selectedAddress = addr;
}

export function UpdateAllStoreAddresses(storeUPAddresses) {
    state.allStoreAddresses = storeUPAddresses;
}

export function UpdateAllStoreDetails(allStores) {
    state.allStores = allStores;
}

export function UpdateSelectedStore(store) {
    state.selectedStore = store;
}

export function AddToStoreTokens(storeAddr, tokenAddr) {
    state.storeTokens.push({
        'storeAddr': storeAddr,
        'tokenAddr': tokenAddr,
    });
}