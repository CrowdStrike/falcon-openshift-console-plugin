import { Alert, Skeleton, Title } from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
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
        if (resp['resources'].length == 0) return;
        return client.alerts.getV2({
          compositeIds: resp['resources'],
        });
      })
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
      {loading ? (
        <Skeleton />
      ) : (
        <Table variant="compact">
          <Thead>
            <Tr>
              <Th>Description</Th>
              <Th>Tactic</Th>
              <Th>Severity</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {alerts.map((a) => {
              return (
                <Tr>
                  <Td>{a.description}</Td>
                  <Td>{a.tactic}</Td>
                  <Td>{a.severityName}</Td>
                  <Td>{a.timestamp.toUTCString()}</Td>
                </Tr>
              );
            })}
            {/* TODO: what to show if there are no alerts reported (yet?) */}
          </Tbody>
        </Table>
      )}
    </>
  );
}
