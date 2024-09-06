import {
  Button,
  ClipboardCopy,
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Grid,
  GridItem,
  Icon,
  Modal,
  ModalVariant,
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

  const toggleIsRawExpanded = () => {
    setIsRawExpanded(!isRawExpanded);
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
      <Modal
        title="Raw endpoint details"
        isOpen={isRawExpanded}
        onClose={toggleIsRawExpanded}
        variant={ModalVariant.medium}
      >
        <CodeBlock>
          <CodeBlockCode>{JSON.stringify(host, null, 2)}</CodeBlockCode>
        </CodeBlock>
      </Modal>
      <Grid>
        <GridItem span={12}>
          <Title headingLevel="h2" className="co-section-heading">
            Endpoint details
            {!loading && (
              <Button onClick={toggleIsRawExpanded} variant="link">
                Show raw details
              </Button>
            )}
          </Title>
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
                <ClipboardCopy hoverTip="Copy" clickTip="Copied" variant="inline-compact" isCode>
                  {host.deviceId}
                </ClipboardCopy>,
                'The Device ID may also be referred to as the Host ID, Asset ID, Agent ID, or AID.',
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
      </Grid>
    </>
  );
}
