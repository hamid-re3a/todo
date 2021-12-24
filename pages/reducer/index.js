const defaultState = {
  todos : []
};

export default function(state=defaultState, action = {}) {
  switch(action.type) {
    case 'ADD':

      return {
        todos : [
          ...state.todos,
          action.payload
        ]
      };
      
    case 'UPDATE':
      let index = state.todos.findIndex(el => el.task === action.key)
      state.todos[index] = {
        ...state.todos[index],
        ...action.payload
      }
      // console.log(action.key)
      return {
        todos : [
          ...state.todos,
        ]
      };
    default:
      return state;
  }
}