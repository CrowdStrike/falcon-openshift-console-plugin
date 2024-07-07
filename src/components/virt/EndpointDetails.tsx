import { Grid, GridItem, Title } from '@patternfly/react-core';
import * as React from 'react';

export default function EndpointDetails({ host }) {
  return (
    <>
      <Grid>
        <GridItem span={12}>
          <Title headingLevel="h2">Endpoint Details</Title>
          <pre>{JSON.stringify(host, null, 2)}</pre>
        </GridItem>
        {/* <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Agent ID (AID)</DescriptionListTerm>
              <DescriptionListDescription>{host.aid}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Last Seen</DescriptionListTerm>
              <DescriptionListDescription>{host.last_seen}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem> */}
      </Grid>
    </>
  );
}
