const initialState = {
    currentUser: null
}

export const user = (state = initialState, action) => {
    return {
        ...state,
        curentUser: action.currentUser
    }
}