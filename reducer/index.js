const defaultState = {
  todos: []
};

export default function (state = defaultState, action = {}) {
  
  state.todos = state.todos.filter(n => n)
  switch (action.type) {
    case 'ADD':
      return {
        todos: [
          ...state.todos,
          action.payload
        ]
      };

    case 'UPDATE':
      let index = state.todos.findIndex(el => el.id === action.key)
      state.todos[index] = {
        ...state.todos[index],
        ...action.payload
      }
      return {
        todos: [
          ...state.todos,
        ]
      };
    case 'DELETE':
      
      index = state.todos.findIndex(el => el.id === action.key)
      if (index > -1) {
        state.todos.splice(index, 1);
      }




      return {
        todos: [
          ...state.todos,
        ]
      };
    default:
      return state;
  }
}