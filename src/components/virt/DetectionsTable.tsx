import {
  Alert,
  DataList,
  DataListAction,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Icon,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';

export default function DetectionsTable({ client, deviceId }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [alerts, setAlerts] = React.useState([]);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.alerts
      .getQueriesAlertsV1(0, undefined, undefined, `device.device_id:'${deviceId}'`)
      .then((resp) => {
        if (resp['resources'].length == 0) return;
        return client.alerts.getV2({
          compositeIds: resp['resources'],
        });
      })
      .then((resp) => {
        setAlerts(resp['resources']);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, deviceId]);

  return (
    <>
      <Title headingLevel="h2">Recent detections</Title>
      {error && (
        <Alert variant="warning" title="Something went wrong">
          {error}
        </Alert>
      )}
      {loading ? (
        <Skeleton />
      ) : (
        <DataList aria-label="Endpoint alerts">
          {alerts.map((a) => {
            return (
              <DataListItem>
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell width={4}>{a.description}</DataListCell>,
                      <DataListCell width={1}>{a.tactic}</DataListCell>,
                      <DataListCell width={1}>
                        <SeverityLabel name={a.severityName} />
                      </DataListCell>,
                      <DataListCell width={2}>{a.timestamp.toUTCString()}</DataListCell>,
                    ]}
                  />
                  <DataListAction
                    aria-label="Link to alert details in Falcon console"
                    aria-labelledby="detailsLink"
                    id="detailsLink"
                  >
                    {/* TODO: falcon_host_link not present in ExternalAlert spec but is returned by Alerts API */}
                    <a href={a.falcon_host_link} target="_blank">
                      <Icon size="md">
                        <ExternalLinkAltIcon />
                      </Icon>
                    </a>
                  </DataListAction>
                </DataListItemRow>
                <DataListContent aria-label="Alert details">
                  {/* TODO: cmdline is not in spec */}
                  <pre>{a.cmdline}</pre>
                </DataListContent>
              </DataListItem>
            );
          })}
          {/* TODO: what to show if there are no alerts reported (yet?) */}
        </DataList>
      )}
    </>
  );
}
