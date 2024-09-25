import * as React from 'react';
import { Icon, Label, PageSection, Title } from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { ExternalLinkAltIcon, InfoCircleIcon } from '@patternfly/react-icons';

export default function PodDetails({ obj }) {
  const detections = [
    {
      severity: 'critical',
      description: 'copy-content on ip-10-0-171-199 by root',
      action: 'process killed',
      date: new Date(),
      details:
        'https://falcon.us-2.crowdstrike.com/activity-v2/detections/e82676877a894c809bc56d0a08568e54:ind:7b7611be964c409582c32770a8f7fae5:1719869491222958433-5701-727568',
    },
  ];

  const detectionsBody = detections.map((d, index) => {
    return (
      <Tr key={index}>
        <Td>{d.severity}</Td>
        <Td>{d.description}</Td>
        <Td>{d.action}</Td>
        <Td>{d.date.toDateString()}</Td>
        <Td>
          <a href={d.details} target="_blank" rel="noreferrer">
            <Icon size="md">
              <ExternalLinkAltIcon />
            </Icon>
          </a>
        </Td>
      </Tr>
    );
  });

  return (
    <PageSection variant="light">
      <Title headingLevel="h2">
        Recent Detections{' '}
        <Label color="orange" icon={<InfoCircleIcon />}>
          Mock
        </Label>
      </Title>
      <Table>
        <Thead>
          <Tr>
            <Th>Severity</Th>
            <Th>Description</Th>
            <Th>Action Taken</Th>
            <Th>Date</Th>
            <Th>Details</Th>
          </Tr>
        </Thead>
        <Tbody>{detectionsBody}</Tbody>
      </Table>
    </PageSection>
  );
}
