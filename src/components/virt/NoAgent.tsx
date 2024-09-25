import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Button,
} from '@patternfly/react-core';
import { DisconnectedIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import * as React from 'react';

export default function NoAgent() {
  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        titleText="No agent found"
        headingLevel="h4"
        icon={<EmptyStateIcon icon={DisconnectedIcon} />}
      />
      <EmptyStateBody>
        <p>
          We couldn&apos;t find a running Falcon agent that matches this system&apos;s MAC address.
          If the agent is installed, make sure the <code>falcon-sensor</code> service is running.
        </p>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            component="a"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            target="_blank"
            href="https://catalog.redhat.com/software/collection/crowdstrike/falcon"
          >
            Deploy with Ansible
          </Button>
          <Button
            component="a"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            target="_blank"
            href="https://falcon.crowdstrike.com/login/?unilogin=true&next=/documentation/page/cba4f917/deploy-falcon-sensor-for-linux-using-cli"
          >
            Deploy manually
          </Button>
        </EmptyStateActions>
        <EmptyStateActions></EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
