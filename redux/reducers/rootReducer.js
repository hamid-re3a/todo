import {combineReducers} from 'redux';

import {DECREMENT_COUNTER, INCREMENT_COUNTER} from '../actions/counterActions';

const counterReducer = (state = {value: 0}, action) => {
    switch (action.type) {
        case INCREMENT_COUNTER:
            return {...state, value: state.value + 1};
        case DECREMENT_COUNTER:
            return {...state, value: state.value - 1};
        default:
            return {...state};
    }
};

const rootReducer = combineReducers({
    counter: counterReducer
});

export default rootReducer;