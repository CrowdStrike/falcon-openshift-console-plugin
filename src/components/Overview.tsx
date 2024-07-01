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
} from '@patternfly/react-core';
import { useK8sModel, k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import './NodeCoverageCard';
import NodeCoverageCard from './NodeCoverageCard';

export default function Overview() {
  // const { t } = useTranslation('plugin__console-plugin-template');

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

  const [fnsStatus, setFnsStatus] = React.useState('');
  const [dsStatus, setDsStatus] = React.useState('');

  React.useEffect(() => {
    k8sGet({
      model: fnsModel,
    })
      .then((data) => {
        // i have to refer to ["items"] vs. .items because K8sResourceCommon doesn't have an items prop
        setFnsStatus(data['items'][0].status.sensor);
      })
      .catch((err) => {
        console.log(err);
      });

    k8sGet({
      model: dsModel,
      name: 'falcon-node-sensor',
      ns: 'falcon-system',
    })
      .then((data) => {
        setDsStatus(`${data['status'].numberReady} / ${data['status'].desiredNumberScheduled}`);
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
                      <DescriptionListDescription>{fnsStatus}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>DaemonSet Status</DescriptionListTerm>
                      <DescriptionListDescription>{dsStatus}</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem span={6}>
              <NodeCoverageCard />
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    </>
  );
}
