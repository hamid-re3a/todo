import '../styles/globals.css'
import { PersistGate } from 'redux-persist/integration/react'

import { Provider, connect } from "react-redux";
import configureStore from "../redux/store";
import { useRouter } from "next/router";


const { store, persistor } = configureStore();
function MyApp({ Component, pageProps }) {
  // persistor.purge()
  // console.log('here')
  const router = useRouter();
  if (router.locale === 'en-US')
    import('semantic-ui-css/semantic.min.css')
    else 
    import('../styles/semantic.rtl.min.css')
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  )
}

export default MyApp
