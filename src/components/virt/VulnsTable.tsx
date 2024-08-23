import {
  Alert,
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DomainBaseAPIVulnerabilityV2 } from 'crowdstrike-falcon/dist/models';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';

export default function VulnsTable({ client, deviceId }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [vulns, setVulns] = React.useState<DomainBaseAPIVulnerabilityV2[]>();
  const [groupedVulns, setGroupedVulns] = React.useState([]);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.spotlightVulnerabilities
      .combinedQueryVulnerabilities(`aid:'${deviceId}'`, undefined, undefined, undefined, [
        'cve',
        'remediation',
      ])
      .then((resp) => {
        setVulns(resp['resources']);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, deviceId]);

  React.useEffect(() => {
    if (!vulns) return;
    let grouped = {};
    // put all the vulns together under the app name
    for (let v of vulns) {
      //TODO: when would there be multiple apps?
      const app = v.apps[0].productNameNormalized;
      if (!(app in grouped)) {
        grouped[app] = {
          app: v.apps[0],
          maxBaseScore: 0,
          counts: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
          },
          vulns: [],
        };
      }
      grouped[app].vulns.push(v);
      grouped[app].counts[v.cve.severity.toLowerCase()]++;
      if (v.cve.baseScore > grouped[app].maxBaseScore) {
        grouped[app].maxBaseScore = v.cve.baseScore;
      }
    }
    // sort individual vulns by baseScore desc
    for (let g in grouped) {
      grouped[g].vulns.sort((a, b) => {
        console.log(b.cve.baseScore, a.cve.baseScore);
        return b.cve.baseScore - a.cve.baseScore;
      });
    }
    // sort groups by maxBaseScore desc
    let sorted = Object.values(grouped);
    sorted.sort((a, b) => {
      return b['maxBaseScore'] - a['maxBaseScore'];
    });

    setGroupedVulns(sorted);
  }, [vulns]);

  return (
    <>
      <Title headingLevel="h2">Vulnerabilities</Title>
      {error && (
        <Alert variant="warning" title="Something went wrong">
          {error}
        </Alert>
      )}
      {loading ? (
        <Skeleton />
      ) : (
        <DataList aria-label="Vulnerabilities">
          {groupedVulns.map((g) => {
            return (
              <DataListItem>
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell>{g.app.productNameNormalized}</DataListCell>,
                      <DataListCell>
                        {g.counts.critical > 0 ? (
                          <SeverityLabel name="critical" text={g.maxBaseScore} />
                        ) : (
                          <>{g.maxBaseScore}</>
                        )}
                      </DataListCell>,
                    ]}
                  />
                </DataListItemRow>
                <DataListContent aria-label="Vulnerability details">
                  <Table variant="compact">
                    <Thead>
                      <Tr>
                        <Th>CVE</Th>
                        <Th>Base Score</Th>
                        <Th>Severity</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {g.vulns.map((v) => {
                        return (
                          <Tr>
                            <Td>{v.cve.id}</Td>
                            <Td>{v.cve.baseScore}</Td>
                            <Td>
                              <SeverityLabel name={v.cve.severity} />
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
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
