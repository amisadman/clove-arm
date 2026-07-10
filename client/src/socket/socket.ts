import { io } from 'socket.io-client';

const SERVER_PORT = 3001;

/**
 * "localhost" baked into the env at build time means "whichever device
 * loaded this page" — correct when the dashboard is opened on the same
 * machine as the server, but wrong the instant a phone loads /controller
 * from another device on the LAN (its own localhost has no server on it).
 * Falling back to the current page's hostname works for both cases, since
 * that's the address the browser used to reach this app in the first place.
 */
function resolveServerUrl(): string {
  const envUrl = import.meta.env.VITE_SERVER_URL;
  if (envUrl && !/^https?:\/\/localhost(:|\/|$)/i.test(envUrl)) {
    return envUrl;
  }
  return `http://${window.location.hostname}:${SERVER_PORT}`;
}

export const SERVER_URL = resolveServerUrl();

const socket = io(SERVER_URL);

export default socket;
