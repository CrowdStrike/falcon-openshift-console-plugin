import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Spinner,
  Title,
} from '@patternfly/react-core';

export default function DeploymentStatusCard({ falconNodeSensor, daemonSet }) {
  return (
    <>
      <Card>
        <CardTitle>
          <Title headingLevel="h3">Sensor deployment</Title>
        </CardTitle>
        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>FalconNodeSensor status</DescriptionListTerm>
              <DescriptionListDescription>
                {/* status doesn't exist as a prop on K8sResourceCommon */}
                {falconNodeSensor ? falconNodeSensor['status'].sensor : <Spinner size="md" />}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>DaemonSet status</DescriptionListTerm>
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
    </>
  );
}
