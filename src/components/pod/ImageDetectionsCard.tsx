import { Card, CardTitle, CardBody } from '@patternfly/react-core';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';
import FindingsList from '../shared/FindingsList';

export default function ImageDetectionsCard({ client, pod }) {
  const [promise, setPromise] = React.useState(null);

  const sevs = ['unknown', 'informational', 'low', 'medium', 'high', 'critical'];
  function sorter(a, b) {
    return sevs.indexOf(b.detectionSeverity) - sevs.indexOf(a.detectionSeverity);
  }

  const header = [
    {
      field: 'title',
      width: 4,
    },
    {
      field: 'detectionType',
      width: 1,
    },
    {
      field: 'detectionSeverity',
      width: 1,
    },
  ];

  const body = [
    {
      field: 'description',
    },
    {
      field: 'remediation',
    },
    {
      field: 'details',
    },
  ];

  const displayFns = {
    detectionSeverity: function (s) {
      return <SeverityLabel name={s} />;
    },
    details: function (d) {
      return d.length > 0 ? (
        <ul>
          {d.map((dd) => {
            return <li>{dd}</li>;
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
      // format: quay.io/crowdstrike/vulnapp@sha256:1f559a24375b141c129dcee744abb7c7cd6409ea3d598b835c086212673377ba
      // split at @ first in case the registry has a port e.g. quay.io:9000
      return `image_digest:'${c.imageID.split('@')[1].split(':')[1]}'`;
    });

    setPromise(client.containerDetections.readCombinedDetections(filter));
  }, [client]);

  return (
    <Card>
      <CardTitle>Image detections</CardTitle>
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
