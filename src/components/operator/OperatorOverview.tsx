import * as React from 'react';
import Helmet from 'react-helmet';
import { Page, PageSection, Title, Grid, GridItem } from '@patternfly/react-core';
import { useK8sModel, k8sGet, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import DeploymentStatusCard from './DeploymentStatusCard';
import NodeCoverageCard from './NodeCoverageCard';
import '../missing-pf-styles.css';

export default function OperatorOverview() {
  const [fnsModel] = useK8sModel({
    group: 'falcon.crowdstrike.com',
    version: 'v1alpha1',
    kind: 'FalconNodeSensor',
  });
  const [dsModel] = useK8sModel({
    group: 'apps',
    version: 'v1',
    kind: 'DaemonSet',
  });

  const [falconNodeSensor, setFalconNodeSensor] = React.useState<K8sResourceCommon>(null);
  const [daemonSet, setDaemonSet] = React.useState<K8sResourceCommon>(null);

  React.useEffect(() => {
    k8sGet({
      model: fnsModel,
      // could specify name to get just 1 but no guarantee someone didn't rename it
    })
      .then((data) => {
        // i have to refer to ["items"] vs. .items because K8sResourceCommon doesn't have an items prop
        setFalconNodeSensor(data['items'][0]);
      })
      .catch((err) => {
        console.log(err);
      });

    k8sGet({
      model: dsModel,
      ns: 'falcon-system',
      // DaemonSet name matches FNS name, but just get the first instance
    })
      .then((data) => {
        setDaemonSet(data['items'][0]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>CrowdStrike</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1">CrowdStrike</Title>
        </PageSection>
        <PageSection isFilled={true}>
          <Grid hasGutter>
            <GridItem span={6}>
              <DeploymentStatusCard falconNodeSensor={falconNodeSensor} daemonSet={daemonSet} />
            </GridItem>
            <GridItem span={6}>
              <NodeCoverageCard daemonSet={daemonSet} />
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    </>
  );
}
