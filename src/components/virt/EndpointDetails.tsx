import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Grid,
  GridItem,
  Icon,
  Title,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';

export default function EndpointDetails({ host }) {
  const [isRawExpanded, setIsRawExpanded] = React.useState(false);

  const onRawToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsRawExpanded(isExpanded);
  };

  function detail(desc, value) {
    return (
      <>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{desc}</DescriptionListTerm>
            <DescriptionListDescription>{value}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </>
    );
  }

  return (
    <>
      <Grid>
        <GridItem span={12}>
          <Title headingLevel="h2">Endpoint Details</Title>
        </GridItem>
        <GridItem span={6}>
          {detail('Hostname', host.hostname)}
          {detail('Operating System', host.osVersion)}
          {detail('Kernel', host.kernelVersion)}
        </GridItem>
        <GridItem span={6}>
          {detail('Device ID', host.deviceId)}
          {detail('Sensor Version', host.agentVersion)}
          {detail(
            'In Reduced Functionality Mode',
            host.reducedFunctionalityMode == 'yes' ? (
              <>
                <Icon status="warning" isInline>
                  <ExclamationTriangleIcon />
                </Icon>{' '}
                yes
              </>
            ) : (
              <>
                <Icon status="success" isInline>
                  <CheckCircleIcon />
                </Icon>{' '}
                no
              </>
            ),
          )}
        </GridItem>
        <GridItem span={12}>
          <ExpandableSection
            toggleText={isRawExpanded ? 'Hide full host details' : 'Show full host details'}
            onToggle={onRawToggle}
            isExpanded={isRawExpanded}
          >
            <pre>{JSON.stringify(host, null, 2)}</pre>
          </ExpandableSection>
        </GridItem>
      </Grid>
    </>
  );
}
