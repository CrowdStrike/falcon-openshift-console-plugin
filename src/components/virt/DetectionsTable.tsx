import { Alert, Skeleton, Title } from '@patternfly/react-core';
import * as React from 'react';

export default function DetectionsTable({ client, deviceId }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [alerts, setAlerts] = React.useState([]);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.alerts
      .getQueriesAlertsV1(0, undefined, undefined, `device.device_id:'${deviceId}'`)
      .then((resp) => {
        setAlerts(resp['resources']);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, deviceId]);

  return (
    <>
      <Title headingLevel="h2">Recent detections</Title>
      {error && (
        <Alert variant="warning" title="Something went wrong">
          {error}
        </Alert>
      )}
      {loading ? <Skeleton /> : <pre>{JSON.stringify(alerts, null, 2)}</pre>}
    </>
  );
}
