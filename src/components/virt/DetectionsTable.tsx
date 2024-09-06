import {
  Alert,
  DataList,
  DataListAction,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  Icon,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';
import ProcessTree from './ProcessTree';

export default function DetectionsTable({ client, deviceId }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [alerts, setAlerts] = React.useState([]);
  const [expanded, setExpanded] = React.useState([]);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.alerts
      .getQueriesAlertsV1(0, undefined, undefined, `device.device_id:'${deviceId}'`)
      .then((resp) => {
        if (resp['resources'].length == 0) return;
        // expand the details for the most recent detection
        setExpanded([resp['resources'][0]]);
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

  function toggle(id: string) {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)]
        : [...expanded, id];
    setExpanded(newExpanded);
  }

  return (
    <>
      <Title headingLevel="h2" className="co-section-heading">
        Recent detections
      </Title>
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
              <DataListItem isExpanded={expanded.includes(a.compositeId)}>
                <DataListItemRow>
                  <DataListToggle
                    onClick={() => toggle(a.compositeId)}
                    isExpanded={expanded.includes(a.compositeId)}
                    id={a.compositeId}
                  />
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
                    <a href={a.falcon_host_link} target="_blank" rel="noreferrer">
                      <Icon size="md">
                        <ExternalLinkAltIcon />
                      </Icon>
                    </a>
                  </DataListAction>
                </DataListItemRow>
                <DataListContent
                  aria-label="Alert details"
                  isHidden={!expanded.includes(a.compositeId)}
                >
                  <Title headingLevel="h5">Process tree</Title>
                  <ProcessTree eppAlert={a} />
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
