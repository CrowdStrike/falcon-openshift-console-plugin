import { Card, CardTitle, CardBody, Gallery } from '@patternfly/react-core';
import * as React from 'react';
import HealthItem from './HealthItem';

export default function SecurityOverview() {
  return (
    <Card>
      <CardTitle>Security overview</CardTitle>
      <CardBody>
        <Gallery hasGutter>
          <HealthItem status="success" title="Sensor health" reason="Operating normally" />
          <HealthItem
            status="danger"
            title="Malicious activity"
            reason="Critical events detected"
          />
          <HealthItem status="warning" title="Vulnerabilities" reason="Remediations available" />
          <HealthItem title="Compliance" reason="No profile configured" />
        </Gallery>
      </CardBody>
    </Card>
  );
}
