import {
  Card,
  CardTitle,
  CardBody,
  Alert,
  Skeleton,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  DataListCell,
  DataListContent,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';

export default function ImageDetectionsCard({ client, pod }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [detections, setDetections] = React.useState(null);
  const [expanded, setExpanded] = React.useState([]);

  React.useEffect(() => {
    if (client == null) return;

    const filter = pod.status.containerStatuses.map((c) => {
      // format: quay.io/crowdstrike/vulnapp@sha256:1f559a24375b141c129dcee744abb7c7cd6409ea3d598b835c086212673377ba
      // split at @ first in case the registry has a port e.g. quay.io:9000
      return `image_digest:'${c.imageID.split('@')[1].split(':')[1]}'`;
    });

    client.containerDetections
      .readCombinedDetections(filter)
      .then((resp) => {
        if (resp['resources'].length > 0) {
          setDetections(resp['resources']);
        }
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client]);

  function toggle(id: string) {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)]
        : [...expanded, id];
    setExpanded(newExpanded);
  }

  return (
    <Card>
      <CardTitle>Image detections</CardTitle>
      <CardBody>
        {error && (
          <Alert variant="warning" title="Something went wrong">
            {error}
          </Alert>
        )}
        {loading && <Skeleton />}
        {!loading && !error && detections && detections.length > 0 && (
          <DataList aria-label="Image detections">
            {detections.map((d) => {
              return (
                <DataListItem isExpanded={expanded.includes(d.detectionId)}>
                  <DataListItemRow>
                    <DataListToggle
                      onClick={() => toggle(d.detectionId)}
                      isExpanded={expanded.includes(d.detectionId)}
                      id={d.detectionId}
                    />
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell width={4}>{d.title}</DataListCell>,
                        <DataListCell width={1}>{d.detectionType}</DataListCell>,
                        <DataListCell width={1}>
                          <SeverityLabel name={d.detectionSeverity} />
                        </DataListCell>,
                      ]}
                    />
                  </DataListItemRow>
                  <DataListContent
                    aria-label="Alert details"
                    isHidden={!expanded.includes(d.detectionId)}
                  >
                    <DescriptionList isHorizontal isCompact>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Description</DescriptionListTerm>
                        <DescriptionListDescription>{d.description}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Remediation</DescriptionListTerm>
                        <DescriptionListDescription>{d.remediation}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Details</DescriptionListTerm>
                        <DescriptionListDescription>
                          {d.details.length > 0 ? (
                            <ul>
                              {d.details.map((dd) => {
                                return <li>{dd}</li>;
                              })}
                            </ul>
                          ) : (
                            'no additional details'
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </DataListContent>
                </DataListItem>
              );
            })}
          </DataList>
        )}
        {!loading && !error && detections && detections.length == 0 && (
          <EmptyState variant={EmptyStateVariant.xs}>
            <EmptyStateHeader
              titleText="No image detections"
              icon={<EmptyStateIcon icon={CheckIcon} />}
            />
            <EmptyStateBody>
              <p>The Falcon sensor has not detected any detections within the pod's images.</p>
            </EmptyStateBody>
          </EmptyState>
        )}
      </CardBody>
    </Card>
  );
}
