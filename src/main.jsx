import {Amplify} from "aws-amplify";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import {Provider} from "react-redux";

import "./index.css";

import App from "./App";
import {AwsConfigAuth} from "./auth/auth";
import {getBuildConstant} from "./constants/build-constants";
import {store} from "./state";
import {getAPIBaseURL} from "./utils/commonUtils";
import "devextreme/dist/css/dx.material.blue.light.css";
import {ToastContainer} from "react-toastify";

axios.defaults.baseURL = getAPIBaseURL();
axios.defaults.headers.common["x-api-key"] = getBuildConstant(
    "REACT_APP_X_API_KEY",
);

Amplify.configure(AwsConfigAuth);

const existingConfig = Amplify.getConfig();

const APP_URL = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://production-app.affooh.com";

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
    Auth: {
        ...existingConfig.Auth,
        Cognito: {
            ...existingConfig.Auth.Cognito,
            loginWith: {
                oauth: {
                    domain: "affooh-production-auth.auth.us-east-1.amazoncognito.com",
                    scopes: ["openid", "email", "profile"],
                    redirectSignIn: [`${APP_URL}/auth/callback`],
                    redirectSignOut: [`${APP_URL}/logout`],
                    responseType: "code",
                },
            },
        },
    }
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <React.StrictMode>
            <App/>
            <ToastContainer
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </React.StrictMode>
    </Provider>,
);
