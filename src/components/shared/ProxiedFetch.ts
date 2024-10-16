import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

// make requests to our reverse proxy instead of directly to the CrowdStrike API, since it doesn't
// support arbitrary CORS
export default function proxiedFetch(url, options) {
  const proxyBase = '/api/proxy/plugin/falcon-openshift-console-plugin/reproxy/crwdapi';
  const path = url.substr(url.indexOf('.com') + 4);
  return consoleFetch(proxyBase + path, options);
}
