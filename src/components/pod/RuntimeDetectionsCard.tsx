import { Card, CardTitle, CardBody } from '@patternfly/react-core';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';
import FindingsList from '../shared/FindingsList';
import { FalconClient } from 'crowdstrike-falcon';

interface RuntimeDetectionsCardProps {
  client: FalconClient;
  pod: any;
}

export default function RuntimeDetectionsCard({ client, pod }: RuntimeDetectionsCardProps) {
  const [promise, setPromise] = React.useState(null);

  const sevs = ['unknown', 'informational', 'low', 'medium', 'high', 'critical'];
  function sorter(a, b) {
    return sevs.indexOf(b.severity.toLowerCase()) - sevs.indexOf(a.severity.toLowerCase());
  }

  const header = [
    {
      field: 'detectionDescription',
      width: 4,
    },
    {
      field: 'detectTimestamp',
      width: 1,
    },
    {
      field: 'severity',
      width: 1,
    },
  ] as {
    // ensure width matches the component params, not generic number
    field: string;
    width?: 1 | 2 | 3 | 4 | 5;
  }[];

  const body = [
    {
      field: 'containerName',
      name: 'Container name',
    },
    {
      field: 'tacticAndTechnique',
      name: 'Tactic & technique',
    },
    {
      field: 'actionTaken',
      name: 'Action taken',
    },
    {
      field: 'commandLine',
      name: 'Command line',
    },
  ];

  const displayFns = {
    severity: function (s) {
      return <SeverityLabel name={s} />;
    },
    detectTimestamp: function (d) {
      return new Date(d).toUTCString();
    },
    commandLine: function (f) {
      // wrap in <pre> block
      return <pre>{f}</pre>;
    },
  };

  React.useEffect(() => {
    if (client == null) return;

    const filter = pod.status.containerStatuses.map((c) => {
      // format: cri-o://2ab4f0fd47cf217aa345b75f64cf18c88bf5aaa1e9e7daf43157841ee0fb8026
      // split on '//' and take the second part
      return `container_id:'${c.containerID.split('//')[1]}'`;
    });

    setPromise(client.runtimeDetections.getRuntimeDetectionsCombinedV2(filter));
  }, [client]);

  return (
    <Card>
      <CardTitle>Runtime detections</CardTitle>
      <CardBody>
        <FindingsList
          queryPromise={promise}
          sortFn={sorter}
          idField="detectionId"
          header={header}
          body={body}
          termWidth="15ch"
          displayFns={displayFns}
        />
      </CardBody>
    </Card>
  );
}
