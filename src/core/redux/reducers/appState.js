import type from "../const.js";

export default {
    reduce(state, action) {
        switch (action.type) {
            case type.app_state_select_mode:
                return {...state, selectedMode: action.payload};
            case type.app_state_open_option:
                return {...state, openOptionPage: action.payload};
            default:
                return state
        }
    }
}