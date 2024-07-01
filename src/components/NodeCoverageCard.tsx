import * as React from 'react';
import { Card, CardBody, CardTitle, Title } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts';

export default function NodeCoverageCard() {
  // get all machine count
  const coverageData = [
    { x: 'Unprotected', y: '2' },
    { x: 'Deploying', y: '3' },
    { x: 'Protected', y: '5' },
  ];
  // not sure how to pass PF color names from https://www.patternfly.org/charts/colors-for-charts/
  const coverageColorScale = ['#6a6e73', '#8bc1f7', '#06c'];
  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h3">Sensor Coverage</Title>
      </CardTitle>
      <CardBody>
        <ChartDonut
          data={coverageData}
          labels={({ datum }) => `${datum.x}: ${datum.y}`}
          legendData={coverageData.map((item) => {
            return { name: `${item.x}: ${item.y}` };
          })}
          legendPosition="right"
          legendOrientation="vertical"
          title="10"
          subTitle="Nodes"
          padding={{ right: 120 }}
          colorScale={coverageColorScale}
          height={150}
          width={400}
        />
      </CardBody>
    </Card>
  );
}
