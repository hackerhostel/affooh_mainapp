import { Amplify } from "aws-amplify";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ToastProvider } from "react-toast-notifications";

import "./index.css";

import App from "./App";
import { AwsConfigAuth } from "./auth/auth";
import { getBuildConstant } from "./constants/build-constants";
import { store } from "./state";
import { getAPIBaseURL } from "./utils/commonUtils";
import "devextreme/dist/css/dx.material.blue.light.css";

axios.defaults.baseURL = getAPIBaseURL();
axios.defaults.headers.common["x-api-key"] = getBuildConstant(
  "REACT_APP_X_API_KEY",
);

Amplify.configure(AwsConfigAuth);

const existingConfig = Amplify.getConfig();

Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: {
      ...existingConfig.API?.REST,
      AffoohAPI: {
        endpoint: getAPIBaseURL(),
        region: "us-east-1",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <React.StrictMode>
      <ToastProvider autoDismiss={true} placement={"bottom-left"}>
        <App />
      </ToastProvider>
    </React.StrictMode>
  </Provider>,
);
