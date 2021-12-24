import '../styles/globals.css'
import { PersistGate } from 'redux-persist/integration/react'

import { Provider, connect } from "react-redux";
import configureStore from "./store";


const { store, persistor } = configureStore();
function MyApp({ Component, pageProps }) {
  // persistor.purge()
  // console.log('here')
  return (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
         </PersistGate>
      </Provider>
  )
}

export default MyApp
