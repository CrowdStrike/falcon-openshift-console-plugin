# api-gateway

For security reasons, the CrowdStrike API does not support arbitrary CORS, which means we cannot
make requests for CrowdStrike data directly from the plugin's client side code. This API gateway
allows the plugin's frontend to make API requests via a service running inside the cluster.

## Usage

The API gateway is deployed automatically with the Helm chart.
