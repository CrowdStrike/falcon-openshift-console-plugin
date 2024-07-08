import {
  Alert,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
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

  // we'll use this string in an Error that breaks the promise chain, but won't trigger the error banner
  const NO_HOST_ERR = 'nohost';

  React.useEffect(() => {
    k8sGet({ model: secretModel, name: 'crowdstrike-api', ns: obj.metadata.namespace })
      .then((secret) => {
        return new FalconClient({
          cloud: 'us-2', // TODO: cast cloud to FalconCloud type
          // cloud: atob(secret['data'].cloud),
          clientId: atob(secret['data'].client_id),
          clientSecret: atob(secret['data'].client_secret),
        });
      })
      .then((client) => {
        const mac = obj.spec.template.spec.domain.devices.interfaces[0].macAddress
          .toLowerCase()
          .replaceAll(':', '-');
        return Promise.all([
          client,
          client.hosts.queryDevicesByFilter(0, 2, undefined, `mac_address:'${mac}'`),
        ]);
      })
      .then(([client, resp]) => {
        if (resp['resources'].length > 1) {
          throw new Error(`Multiple matching agents: ${resp['resources']}`);
        } else if (resp['resources'].length == 0) {
          // TODO: use empty state
          throw new Error(NO_HOST_ERR);
        }
        return client['hosts'].getDeviceDetailsV2([resp['resources'][0]]);
      })
      .then((resp) => {
        setHost(resp['resources'][0]);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message != NO_HOST_ERR) {
          setError(err.message);
        }
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageSection variant="light">
        {error && (
          <Alert variant="danger" title="Something went wrong">
            {error}
          </Alert>
        )}

        {loading && <Spinner />}

        {host && <EndpointDetails host={host} />}

        {!loading && !error && !host && (
          <EmptyState variant={EmptyStateVariant.lg}>
            <EmptyStateHeader
              titleText="No agent found"
              headingLevel="h4"
              icon={<EmptyStateIcon icon={DisconnectedIcon} />}
            />
            <EmptyStateBody>
              <p>We couldn't find a running Falcon agent that matches this system's MAC address.</p>
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
