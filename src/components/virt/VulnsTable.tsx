import { Alert, Skeleton, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import * as React from 'react';

export default function VulnsTable({ client, deviceId }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [vulns, setVulns] = React.useState([]);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.spotlightVulnerabilities
      .combinedQueryVulnerabilities(`aid:'${deviceId}'`, undefined, undefined, undefined, ['cve'])
      .then((resp) => {
        setVulns(resp['resources']);
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
      <Title headingLevel="h2">Vulnerabilities</Title>
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
              <Th>Package</Th>
              <Th>Severity</Th>
              <Th>Base Score</Th>
              <Th>CVE</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vulns.map((v) => {
              return (
                <Tr>
                  <Td>{v.apps[0].productNameVersion}</Td>
                  <Td>{v.cve.severity}</Td>
                  <Td>{v.cve.baseScore}</Td>
                  <Td>{v.cve.id}</Td>
                </Tr>
              );
            })}
            {/* TODO: what to show if there are no vulns reported (yet?) */}
          </Tbody>
        </Table>
      )}
    </>
  );
}
