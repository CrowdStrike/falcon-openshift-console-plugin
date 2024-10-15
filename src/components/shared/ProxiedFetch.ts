// make requests to our reverse proxy instead of directly to the CrowdStrike API, since it doesn't
// support arbitrary CORS
export default function proxiedFetch(url, options) {
  const proxyBase = window.location.origin.replace(
    'console-openshift-console',
    'api-gateway-falcon-openshift-console-plugin',
  );
  const path = url.substr(url.indexOf('.com') + 4);
  return fetch(proxyBase + path, options);
}
