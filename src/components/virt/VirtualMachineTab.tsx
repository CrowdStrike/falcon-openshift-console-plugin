import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Gallery,
  Grid,
  GridItem,
  PageSection,
  Spinner,
} from '@patternfly/react-core';
import * as React from 'react';
import EndpointDetails from './EndpointDetails';
import { FalconClient } from 'crowdstrike-falcon';
import { k8sGet, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import DetectionsTable from './DetectionsTable';
import NoAgent from './NoAgent';
import VulnsTable from './VulnsTable';
import '../missing-pf-styles.css';
import './style.css';
import HealthItem from './HealthItem';

export default function VirtualMachineTab({ obj }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [client, setClient] = React.useState<FalconClient>(null);
  const [deviceId, setDeviceId] = React.useState('');

  const [secretModel] = useK8sModel({
    version: 'v1',
    kind: 'Secret',
  });

  // we'll use this string in an Error that breaks the promise chain, but won't trigger the error banner
  const NO_HOST_ERR = 'nohost';

  React.useEffect(() => {
    k8sGet({ model: secretModel, name: 'crowdstrike-api', ns: obj.metadata.namespace })
      .then((secret) => {
        setClient(
          new FalconClient({
            cloud: 'us-2', // TODO: cast cloud to FalconCloud type
            // cloud: atob(secret['data'].cloud),
            clientId: atob(secret['data'].client_id),
            clientSecret: atob(secret['data'].client_secret),
          }),
        );
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  React.useEffect(() => {
    if (client == null) return;

    const filter = obj.spec.template.spec.domain.devices.interfaces
      .map((iface) => {
        return `connection_mac_address:'${iface.macAddress.toLowerCase().replaceAll(':', '-')}'`;
      })
      .join(',');
    client.hosts
      .queryDevicesByFilter(0, 2, undefined, filter)
      .then((resp) => {
        if (resp['resources'].length > 1) {
          throw new Error(`Multiple matching agents: ${resp['resources']}`);
        } else if (resp['resources'].length == 0) {
          throw new Error(NO_HOST_ERR);
        }
        setDeviceId(resp['resources'][0]);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message != NO_HOST_ERR) {
          setError(err.message);
        }
        setLoading(false);
      });
  }, [client]);

  return (
    <>
      {error && (
        <Alert variant="danger" title="Something went wrong">
          {error}
        </Alert>
      )}

      {loading && (
        <EmptyState variant={EmptyStateVariant.lg}>
          <EmptyStateHeader
            titleText="Looking for agent"
            headingLevel="h4"
            icon={<EmptyStateIcon icon={Spinner} />}
          />
        </EmptyState>
      )}

      {!loading && !error && !deviceId && <NoAgent />}

      {deviceId && (
        <>
          <PageSection isFilled>
            <Grid hasGutter>
              <GridItem span={12}>
                <Card>
                  <CardTitle>Security overview</CardTitle>
                  <CardBody>
                    <Gallery hasGutter>
                      <HealthItem
                        status="success"
                        title="Sensor health"
                        reason="Operating normally"
                      />
                      <HealthItem
                        status="danger"
                        title="Malicious activity"
                        reason="Critical events detected"
                      />
                      <HealthItem
                        status="warning"
                        title="Vulnerabilities"
                        reason="Remediations available"
                      />
                      <HealthItem title="Compliance" reason="No profile configured" />
                    </Gallery>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem lg={4} md={12}>
                <EndpointDetails client={client} deviceId={deviceId} />
              </GridItem>
              <GridItem lg={8} md={12}>
                <DetectionsTable client={client} deviceId={deviceId} />
              </GridItem>
              <GridItem span={12}>
                <VulnsTable client={client} deviceId={deviceId} />
              </GridItem>
            </Grid>
          </PageSection>
        </>
      )}
    </>
  );
}
