import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE, USER_LOCATION_STATE_CHANGE } from "../constants/index"
const initialState = {
    currentUser: null,
    posts: []
}

export const user = (state = initialState, action) => {
    switch(action.type)
    {
        case USER_LOCATION_STATE_CHANGE:
            return {
                ...state,
                location: action.location
            }
        case USER_STATE_CHANGE:
            return {
                ...state,
                currentUser: action.currentUser
            }
        case USER_POSTS_STATE_CHANGE:
            return {
                ...state,
                posts: action.posts
            }
            default:
        {
        return state //posodobi state v primeri spremembe

    }
        }
    
}