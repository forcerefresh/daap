import React, { Context } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { IntegrationContextProvider, useAppRootSelector } from "./integration";

ReactDOM.render(
  <React.StrictMode>
    <IntegrationContextProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </IntegrationContextProvider>
  </React.StrictMode>,
  document.getElementById(useAppRootSelector())
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
