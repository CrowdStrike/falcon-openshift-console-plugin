import { Card, CardTitle, CardBody, Gallery } from '@patternfly/react-core';
import * as React from 'react';
import HealthItem from './HealthItem';

export default function SecurityOverview({ host, alerts, vulns }) {
  function sensorHealthItem() {
    if (host == null) {
      return <HealthItem title="Sensor health" isInProgress={true} />;
    }
    let status = 'success';
    let reason = 'Operating normally';
    if (host.reducedFunctionalityMode == 'yes') {
      status = 'warning';
      reason = 'Reduced functionality mode';
    }
    //TODO: critical if offline?
    return <HealthItem title="Sensor health" status={status} reason={reason} />;
  }

  function alertsHealthItem() {
    if (alerts == null) {
      return <HealthItem title="Malicious activity" isInProgress={true} />;
    }
    let status = 'success';
    let reason = 'No significant detections';
    if (alerts && alerts.length > 0) {
      //TODO filter on severity
      status = 'warning';
      reason = 'Some events detected';
    }
    return <HealthItem title="Malicious activity" status={status} reason={reason} />;
  }

  function vulnsHealthItem() {
    if (vulns == null) {
      return <HealthItem title="Vulnerabilities" isInProgress={true} />;
    }
    let status = 'success';
    let reason = 'No remediable vulnerabilities';
    if (vulns && vulns.length > 0) {
      //TODO filter on severity
      status = 'warning';
      reason = 'Remediations available';
    }
    return <HealthItem title="Vulnerabilities" status={status} reason={reason} />;
  }

  //TODO: FIM? config assessment?

  return (
    <Card>
      <CardTitle>Security overview</CardTitle>
      <CardBody>
        <Gallery hasGutter>
          {sensorHealthItem()}
          {alertsHealthItem()}
          {vulnsHealthItem()}
        </Gallery>
      </CardBody>
    </Card>
  );
}
