import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export default function proxiedFetchFactory(cloud) {
  return (url, options) => {
    // make requests to our reverse proxy instead of directly to the CrowdStrike API, since it doesn't
    // support arbitrary CORS
    const proxyBase = '/api/proxy/plugin/falcon-openshift-console-plugin/reproxy/crwdapi';
    const path = url.substr(url.indexOf('.com') + 4);

    // add region to request header so our reverse proxy can forward correctly
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['X-CS-REGION'] = cloud;

    // use consoleFetch to ensure CSRF headers are added
    return consoleFetch(proxyBase + path, options);
  };
}
