import * as React from 'react';
import {
  Alert,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  PageSection,
  Spinner,
} from '@patternfly/react-core';
import { FalconClient } from 'crowdstrike-falcon';
import { useK8sModel, k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import ImageDetectionsCard from './ImageDetectionsCard';

export default function PodDetails({ obj }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [client, setClient] = React.useState<FalconClient>(null);

  const [secretModel] = useK8sModel({
    version: 'v1',
    kind: 'Secret',
  });

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
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
            titleText="Connecting to CrowdStrike"
            headingLevel="h4"
            icon={<EmptyStateIcon icon={Spinner} />}
          />
        </EmptyState>
      )}

      {!loading && !error && (
        <PageSection isFilled>
          <Grid hasGutter>
            <GridItem span={12}>
              <ImageDetectionsCard client={client} pod={obj} />
            </GridItem>
          </Grid>
        </PageSection>
      )}
    </>
  );
}
