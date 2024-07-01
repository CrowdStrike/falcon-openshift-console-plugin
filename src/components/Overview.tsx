import * as React from 'react';
import Helmet from 'react-helmet';
import {
  Card,
  CardTitle,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Page,
  PageSection,
  Title,
  Grid,
  GridItem,
  Spinner,
} from '@patternfly/react-core';
import { useK8sModel, k8sGet, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import NodeCoverageCard from './NodeCoverageCard';

export default function Overview() {
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
              <Card>
                <CardTitle>
                  <Title headingLevel="h3">Sensor Deployment</Title>
                </CardTitle>
                <CardBody>
                  <DescriptionList>
                    <DescriptionListGroup>
                      <DescriptionListTerm>FalconNodeSensor Status</DescriptionListTerm>
                      <DescriptionListDescription>
                        {/* status doesn't exist as a prop on K8sResourceCommon */}
                        {falconNodeSensor ? (
                          falconNodeSensor['status'].sensor
                        ) : (
                          <Spinner size="md" />
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>DaemonSet Status</DescriptionListTerm>
                      <DescriptionListDescription>
                        {daemonSet ? (
                          `${daemonSet['status'].numberReady} ready /
                          ${daemonSet['status'].desiredNumberScheduled} desired`
                        ) : (
                          <Spinner size="md" />
                        )}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </CardBody>
              </Card>
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
