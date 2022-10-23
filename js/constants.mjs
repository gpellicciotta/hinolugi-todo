// Application constants

// Where the back-end API can be reached:
export const API_BASE_URL = window.location.origin;
//export const API_BASE_URL = "http://localhost:5052/";
//export const API_BASE_URL = "https://utils.pellicciotta.com";

// Time interval after which to show a wait UI if an async action hasn't completed yet:
export const WAIT_UI_DELAY_TIME = 700; // 700 ms

// Time interval at which to sync data with server:
export const SERVER_SYNC_TIME = 60000; // Every 60 seconds
//export const SERVER_SYNC_TIME = 120000; // Every 2 minutes
//export const SERVER_SYNC_TIME = 100000; // Every 10 seconds

// For testing without actual back-end:
export const RUN_MODE = 'demo'; // options: 'announcement', 'demo' or 'normal'

// For testing purposes:
export const REGISTER_SERVICE_WORKER = false;

// For emulating slow connections:
export const SLOW_MODE = false;
//export const SLOW_MODE = true;

// For emulating unstable connections:
export const UNSTABLE_NETWORK_MODE = false;
//export const UNSTABLE_NETWORK_MODE = true;

// Whether to open a separate window for the oauth flow:
export const OAUTH_IN_SEPARATE_WINDOW = false;
//export const OAUTH_IN_SEPARATE_WINDOW = true;