import * as React from 'react';
import { Card, CardBody, CardTitle, Spinner, Title } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts';
import { k8sGet, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

export default function NodeCoverageCard({ daemonSet }) {
  const [total, setTotal] = React.useState(0);
  const [unprotected, setUnprotected] = React.useState(0);
  const [deploying, setDeploying] = React.useState(0);
  const [deployed, setDeployed] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // get all machine count
  const [nodeModel] = useK8sModel({
    version: 'v1',
    kind: 'Node',
  });
  k8sGet({
    model: nodeModel,
  })
    .then((data) => {
      setTotal(data['items'].length);
      setDeployed(daemonSet['status'].numberReady);
      setDeploying(daemonSet['status'].desiredNumberScheduled - deployed);
      setUnprotected(total - daemonSet['status'].desiredNumberScheduled);
      setLoading(false);
    })
    .catch((err) => {
      console.log(err);
    });

  const coverageData = [
    { x: 'Unprotected', y: unprotected },
    { x: 'Deploying', y: deploying },
    { x: 'Protected', y: deployed },
  ];
  // not sure how to pass PF color names from https://www.patternfly.org/charts/colors-for-charts/
  const coverageColorScale = ['#6a6e73', '#8bc1f7', '#06c'];
  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h3">Sensor coverage</Title>
      </CardTitle>
      <CardBody>
        {loading ? (
          <Spinner />
        ) : (
          <ChartDonut
            data={coverageData}
            labels={({ datum }) => `${datum.x}: ${datum.y}`}
            legendData={coverageData.map((item) => {
              return { name: `${item.x}: ${item.y}` };
            })}
            legendPosition="right"
            legendOrientation="vertical"
            title={'' + total}
            subTitle="Nodes"
            padding={{ right: 120 }}
            colorScale={coverageColorScale}
            height={150}
            width={400}
          />
        )}
      </CardBody>
    </Card>
  );
}
