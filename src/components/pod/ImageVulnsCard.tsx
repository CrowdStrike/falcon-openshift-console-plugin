import { Card, CardTitle, CardBody, Label } from '@patternfly/react-core';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';
import FindingsList from '../shared/FindingsList';
import { FalconClient } from 'crowdstrike-falcon';

interface ImageVulnsCardProps {
  client: FalconClient;
  pod: any;
}

export default function ImageVulnsCard({ client, pod }: ImageVulnsCardProps) {
  const [promise, setPromise] = React.useState(null);

  function sorter(a, b) {
    return b.cvssScore - a.cvssScore;
  }

  const header = [
    {
      field: 'cveId',
      width: 3,
    },
    {
      field: 'cvssScore',
      width: 1,
    },
    {
      field: 'exploitedStatusString',
      width: 1,
    },
    {
      field: 'severity',
      width: 1,
    },
  ] as {
    field: string;
    width?: 1 | 2 | 3 | 4 | 5;
  }[];

  const body = [
    {
      field: 'description',
    },
  ];

  const displayFns = {
    severity: function (s) {
      return <SeverityLabel name={s} />;
    },
    exploitedStatusString: function (exploited) {
      return exploited == 'Available' ? (
        <Label color="red">Known exploit</Label>
      ) : (
        <Label>Unproven</Label>
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

    setPromise(client.containerVulnerabilities.readCombinedVulnerabilities(filter));
  }, [client]);

  return (
    <Card>
      <CardTitle>Image vulnerabilities</CardTitle>
      <CardBody>
        <FindingsList
          queryPromise={promise}
          sortFn={sorter}
          idField="cveId"
          header={header}
          body={body}
          displayFns={displayFns}
        />
      </CardBody>
    </Card>
  );
}
