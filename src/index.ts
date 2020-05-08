import * as API from '../generated/api';

const BASE_PATH = 'https://apiprod.fattlabs.com';

export default function Fattmerchant(apiKey: string): API.DefaultApi {
  const api = new API.DefaultApi(BASE_PATH);
  const auth = new API.ApiKeyAuth('header', 'Authorization');
  auth.apiKey = apiKey;
  api.setDefaultAuthentication(auth);
  return api;
}

export * from '../generated/api';