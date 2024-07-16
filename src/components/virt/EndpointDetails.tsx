import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';

export default function EndpointDetails({ client, deviceId }) {
  const [loading, setLoading] = React.useState(true);
  const [isRawExpanded, setIsRawExpanded] = React.useState(false);
  const [host, setHost] = React.useState(null);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.hosts.getDeviceDetailsV2([deviceId]).then((resp) => {
      setHost(resp['resources'][0]);
      setLoading(false);
    });
  }, [client, deviceId]);

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
          <Title headingLevel="h2">Endpoint details</Title>
        </GridItem>
        <GridItem span={6}>
          {loading ? (
            <>
              <Skeleton width="75%"></Skeleton>
            </>
          ) : (
            <>
              {detail('Hostname', host.hostname)}
              {detail('Operating system', host.osVersion)}
              {detail('Kernel', host.kernelVersion)}
            </>
          )}
        </GridItem>
        <GridItem span={6}>
          {loading ? (
            <>
              <Skeleton width="75%"></Skeleton>
            </>
          ) : (
            <>
              {detail('Device ID', host.deviceId)}
              {detail('Sensor version', host.agentVersion)}
              {detail(
                'In reduced functionality mode',
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
            </>
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
