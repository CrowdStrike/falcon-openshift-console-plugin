import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Skeleton,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';
import { CheckIcon } from '@patternfly/react-icons';

export default function VulnsTable({ client, deviceId, vulns, setVulns }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [groupedVulns, setGroupedVulns] = React.useState([]);
  const [expanded, setExpanded] = React.useState([]);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.spotlightVulnerabilities
      .combinedQueryVulnerabilities(
        `aid:'${deviceId}'+(cve.severity:'CRITICAL',cve.severity:'HIGH')+cve.remediation_level:'O'`,
        undefined,
        1000,
        undefined,
        ['cve', 'remediation'],
      )
      .then((resp) => {
        //TODO: handle pagination
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
    const grouped = {};
    // put all the vulns together under the app name
    for (const v of vulns) {
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
    for (const g in grouped) {
      grouped[g].vulns.sort((a, b) => {
        return b.cve.baseScore - a.cve.baseScore;
      });
    }
    // sort groups by maxBaseScore desc
    const sorted = Object.values(grouped);
    sorted.sort((a, b) => {
      return b['maxBaseScore'] - a['maxBaseScore'];
    });

    setGroupedVulns(sorted);
  }, [vulns]);

  function toggle(id: string) {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)]
        : [...expanded, id];
    setExpanded(newExpanded);
  }

  return (
    <Card>
      <CardTitle>Top vulnerabilities</CardTitle>
      <CardBody>
        {error && (
          <Alert variant="warning" title="Something went wrong">
            {error}
          </Alert>
        )}
        {loading && <Skeleton />}
        {!loading && !error && groupedVulns.length > 0 && (
          <>
            <p style={{ marginBlockEnd: '14px' }}>
              Displaying remediable vulnerabilities with a critical or high severity.
            </p>
            <DataList aria-label="Vulnerabilities">
              {groupedVulns.map((g) => {
                return (
                  <DataListItem isExpanded={expanded.includes(g.app.productNameNormalized)}>
                    <DataListItemRow>
                      <DataListToggle
                        onClick={() => toggle(g.app.productNameNormalized)}
                        isExpanded={expanded.includes(g.app.productNameNormalized)}
                        id={g.app.productNameNormalized}
                      />
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell>{g.app.productNameVersion}</DataListCell>,
                          <DataListCell>
                            <SeverityLabel
                              name="critical"
                              text={g.counts.critical}
                              showColor={g.counts.critical > 0}
                            />{' '}
                            <SeverityLabel
                              name="high"
                              text={g.counts.high}
                              showColor={g.counts.high > 0}
                            />
                          </DataListCell>,
                        ]}
                      />
                    </DataListItemRow>
                    <DataListContent
                      aria-label="Vulnerability details"
                      isHidden={!expanded.includes(g.app.productNameNormalized)}
                    >
                      <Table variant="compact">
                        <Thead>
                          <Tr>
                            <Th>CVE</Th>
                            <Th>NVD Base Score</Th>
                            <Th>NVD Severity</Th>
                            <Th>ExPRT Rating</Th>
                            <Th>Remediation</Th>
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
                                <Td>
                                  <SeverityLabel name={v.cve.exprtRating} />
                                </Td>
                                <Td>
                                  {v.remediation.entities &&
                                    v.remediation.entities.length > 0 &&
                                    v.remediation.entities[0].action}
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
            </DataList>{' '}
          </>
        )}
        {!loading && !error && groupedVulns.length == 0 && (
          <EmptyState variant={EmptyStateVariant.xs}>
            <EmptyStateHeader
              titleText="No vulnerabilities"
              icon={<EmptyStateIcon icon={CheckIcon} />}
            />
            <EmptyStateBody>
              <p>
                The Falcon sensor has not found any critical or high vulnerabilities with
                remediations.
              </p>
            </EmptyStateBody>
          </EmptyState>
        )}
      </CardBody>
    </Card>
  );
}
