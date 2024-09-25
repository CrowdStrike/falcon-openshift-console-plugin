import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import * as React from 'react';

export default function ImageAssessment({ client, containerStatus }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [assessment, setAssessment] = React.useState(null);

  const digest = containerStatus.imageID.split(':')[1];

  React.useEffect(() => {
    if (client == null) return;

    client.containerImages
      .getCombinedImages(`image_digest:'${digest}'`)
      .then((resp) => {
        if (resp['resources'].length > 0) {
          setAssessment(resp['resources'][0]);
        }
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client]);

  return (
    <>
      <Card>
        <CardTitle>{containerStatus.name}</CardTitle>
        <CardBody>
          {error && (
            <Alert variant="warning" title="Something went wrong">
              {error}
            </Alert>
          )}
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Image name</DescriptionListTerm>
              <DescriptionListDescription>{containerStatus.image}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Image ID</DescriptionListTerm>
              <DescriptionListDescription>{containerStatus.imageID}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Base OS</DescriptionListTerm>
              <DescriptionListDescription>
                {assessment ? assessment.baseOs : loading && <Spinner size="md" />}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>
    </>
  );
}
