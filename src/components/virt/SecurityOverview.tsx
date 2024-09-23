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

    const hasHighCritical =
      alerts.filter((a) => {
        const s = a.severityName.toLowerCase();
        return s == 'high' || s == 'critical';
      }).length > 0;
    const hasLowMed = alerts.length > 0 && !hasHighCritical;

    let status = 'success';
    let reason = 'No detections';
    if (hasHighCritical) {
      status = 'danger';
      reason = 'High or critical detections';
    } else if (hasLowMed) {
      status = 'warning';
      reason = 'Medium or low detections';
    }

    return <HealthItem title="Malicious activity" status={status} reason={reason} />;
  }

  function vulnsHealthItem() {
    if (vulns == null) {
      return <HealthItem title="Vulnerability management" isInProgress={true} />;
    }

    let hasHighCritical = false;
    let hasLowMed = false;
    vulns.forEach((v) => {
      // ignore vulns that don't have any remediations
      if (!v.remediation.entities || v.remediation.entities.length == 0) return;

      const s = v.cve.severity.toLowerCase();
      hasHighCritical = hasHighCritical || s == 'critical' || s == 'high';
      hasLowMed = hasLowMed || (s != 'critical' && s != 'high');
    });

    let status = 'success';
    let reason = 'No remediations available';
    if (hasHighCritical) {
      status = 'danger';
      reason = 'High or critical remediations';
    } else if (hasLowMed) {
      status = 'warning';
      reason = 'Medium or low remediations';
    }

    return <HealthItem title="Vulnerability management" status={status} reason={reason} />;
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
