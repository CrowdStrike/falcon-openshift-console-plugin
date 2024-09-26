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
    return sevs.indexOf(b.severity) - sevs.indexOf(a.severity);
  }

  // This function is used to format the date in the format we want without installing any
  // additional libraries
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = [
      'Jan.',
      'Feb.',
      'Mar.',
      'Apr.',
      'May',
      'Jun.',
      'Jul.',
      'Aug.',
      'Sep.',
      'Oct.',
      'Nov.',
      'Dec.',
    ];

    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
  }

  const header = [
    {
      field: 'tacticAndTechnique',
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
      field: 'detectionDescription',
      name: 'Description',
    },
    {
      field: 'commandLine',
      name: 'Command line',
    },
    {
      field: 'imageDigest',
      name: 'Image digest',
    },
  ];

  const displayFns = {
    severity: function (s) {
      return <SeverityLabel name={s} />;
    },
    detectTimestamp: function (d) {
      // return format(parseISO(d), 'MMM. d, yyyy HH:mm:ss');
      return formatDate(d);
    },
    details: function (d) {
      return d.length > 0 ? (
        <ul>
          {d.map((dd) => {
            return <li key={dd}>{dd}</li>;
          })}
        </ul>
      ) : (
        'no additional details'
      );
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
          displayFns={displayFns}
        />
      </CardBody>
    </Card>
  );
}
