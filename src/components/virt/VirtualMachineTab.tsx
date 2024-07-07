import {
  Alert,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  PageSection,
  Spinner,
} from '@patternfly/react-core';
import * as React from 'react';
import EndpointDetails from './EndpointDetails';
import { FalconClient } from 'crowdstrike-falcon';
import { DisconnectedIcon } from '@patternfly/react-icons';
import { k8sGet, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

export default function VirtualMachineTab({ obj }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [host, setHost] = React.useState(null);

  const [secretModel] = useK8sModel({
    version: 'v1',
    kind: 'Secret',
  });

  React.useEffect(() => {
    k8sGet({ model: secretModel, name: 'crowdstrike-api', ns: obj.metadata.namespace })
      .then((secret) => {
        console.log('SECRET', secret);
        return new FalconClient({
          cloud: 'us-2', // TODO: cast cloud to FalconCloud type
          // cloud: atob(secret['data'].cloud),
          clientId: atob(secret['data'].client_id),
          clientSecret: atob(secret['data'].client_secret),
        });
      })
      .then((client) => {
        console.log('CLIENT', client);
        const mac = obj.spec.template.spec.domain.devices.interfaces[0].macAddress
          .toLowerCase()
          .replaceAll(':', '-');
        console.log('MAC', mac);
        return Promise.all([
          client,
          client.hosts.queryDevicesByFilter(0, 2, undefined, `mac_address:'${mac}'`),
        ]);
      })
      .then(([client, resp]) => {
        console.log('AID', resp);
        if (resp['resources'].length > 1) {
          throw new Error(`Multiple matching agents: ${resp['resources']}`);
        } else if (resp['resources'].length == 0) {
          // TODO: use empty state
          throw new Error('No matching host');
        }
        return client['hosts'].getDeviceDetailsV2([resp['resources'][0]]);
      })
      .then((resp) => {
        console.log('HOST', resp);
        setHost(resp['resources'][0]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(JSON.stringify(err));
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageSection variant="light">
        {error && (
          <Alert variant="danger" title="Something went wrong">
            <pre>{error}</pre>
          </Alert>
        )}

        {loading && <Spinner />}

        {host && <EndpointDetails host={host} />}

        {!loading && !error && !host && (
          <EmptyState>
            <EmptyStateHeader
              titleText="No agent found"
              headingLevel="h4"
              icon={<EmptyStateIcon icon={DisconnectedIcon} />}
            />
            <EmptyStateBody>
              <p>
                We couldn't find a running Falcon agent that matches this system. Make sure the
                Falcon agent is running on this system, and that you can find it in the Falcon
                console.
              </p>
            </EmptyStateBody>
            {/* <EmptyStateFooter>
      <EmptyStateActions>
        <Button variant="link">Clear all filters</Button>
      </EmptyStateActions>
    </EmptyStateFooter> */}
          </EmptyState>
        )}
      </PageSection>
    </>
  );
}
