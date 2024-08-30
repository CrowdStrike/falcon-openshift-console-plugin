import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  ExpandableSection,
  Grid,
  GridItem,
  Icon,
  Popover,
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

    client.hosts
      .getDeviceDetailsV2([deviceId])
      .then((resp) => {
        setHost(resp['resources'][0]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [client, deviceId]);

  const onRawToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsRawExpanded(isExpanded);
  };

  function detail(name, value, desc?) {
    return (
      <>
        <DescriptionListGroup>
          {desc ? (
            <DescriptionListTermHelpText>
              <Popover headerContent={<div>{name}</div>} bodyContent={<div>{desc}</div>}>
                <DescriptionListTermHelpTextButton>{name}</DescriptionListTermHelpTextButton>
              </Popover>
            </DescriptionListTermHelpText>
          ) : (
            <DescriptionListTerm>{name}</DescriptionListTerm>
          )}
          <DescriptionListDescription>{value}</DescriptionListDescription>
        </DescriptionListGroup>
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
            <DescriptionList>
              {detail('Hostname', host.hostname)}
              {detail('Operating system', host.osVersion)}
              {detail('Kernel', host.kernelVersion)}
            </DescriptionList>
          )}
        </GridItem>
        <GridItem span={6}>
          {loading ? (
            <>
              <Skeleton width="75%"></Skeleton>
            </>
          ) : (
            <DescriptionList>
              {detail(
                'Device ID',
                host.deviceId,
                'The Device ID may also be referred to as the Agent ID or simply AID.',
              )}
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
            </DescriptionList>
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
