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
import * as React from 'react';
import SeverityLabel from '../shared/SeverityLabel';
import { CheckIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

export default function VulnsTable({ client, deviceId, vulns, setVulns }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [expanded, setExpanded] = React.useState([]);
  const [sortedRemediations, setSortedRemediations] = React.useState([]);

  React.useEffect(() => {
    if (!client || !deviceId) return;

    client.spotlightVulnerabilities
      .combinedQueryVulnerabilities(
        // only retrieve vulns that have an official vendor remediation available
        `aid:'${deviceId}'+cve.remediation_level:'O'`,
        undefined,
        5000,
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

    const remediationToCve = {};
    vulns.forEach((v) => {
      // ignore vulns that don't have a remediation
      if (!v.remediation.entities || v.remediation.entities.length == 0) return;
      const r = v.remediation.entities[0];
      if (!(r.id in remediationToCve)) {
        remediationToCve[r.id] = r;
        Object.assign(remediationToCve[r.id], {
          cves: [],
          maxBaseScore: 0,
          counts: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
          },
        });
      }
      remediationToCve[r.id].cves.push(v.cve);

      remediationToCve[r.id].counts[v.cve.severity.toLowerCase()]++;
      if (v.cve.baseScore > remediationToCve[r.id].maxBaseScore) {
        remediationToCve[r.id].maxBaseScore = v.cve.baseScore;
      }
    });

    const sorted = Object.values(remediationToCve);
    sorted.sort((a, b) => {
      return b['maxBaseScore'] - a['maxBaseScore'];
    });
    sorted.forEach((r) => {
      r['cves'].sort((a, b) => {
        return b.baseScore - a.baseScore;
      });
    });
    setSortedRemediations(sorted);
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
      <CardTitle>Addressable vulnerabilities</CardTitle>
      <CardBody>
        {error && (
          <Alert variant="warning" title="Something went wrong">
            {error}
          </Alert>
        )}
        {loading && <Skeleton />}
        {!loading && !error && sortedRemediations.length > 0 && (
          <>
            <p style={{ marginBlockEnd: '14px' }}>
              Displaying vulnerabilities with official vendor remediations.
            </p>
            <DataList aria-label="Remediations">
              {sortedRemediations.map((r) => {
                return (
                  <DataListItem key={r.id} isExpanded={expanded.includes(r.id)}>
                    <DataListItemRow>
                      <DataListToggle
                        onClick={() => toggle(r.id)}
                        isExpanded={expanded.includes(r.id)}
                        id={r.id}
                      />
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell key="action" width={4}>
                            {r.action}
                          </DataListCell>,
                          <DataListCell key="maxscore" width={2}>
                            {r.maxBaseScore}
                          </DataListCell>,
                          <DataListCell key="severity" width={2}>
                            <SeverityLabel
                              name="critical"
                              text={r.counts.critical}
                              showColor={r.counts.critical > 0}
                            />{' '}
                            <SeverityLabel
                              name="high"
                              text={r.counts.high}
                              showColor={r.counts.high > 0}
                            />{' '}
                            <SeverityLabel
                              name="medium"
                              text={r.counts.medium}
                              showColor={r.counts.medium > 0}
                            />{' '}
                            <SeverityLabel
                              name="low"
                              text={r.counts.low}
                              showColor={r.counts.low > 0}
                            />
                          </DataListCell>,
                        ]}
                      />
                    </DataListItemRow>
                    <DataListContent
                      aria-label="Vulnerability details"
                      isHidden={!expanded.includes(r.id)}
                    >
                      <Table variant="compact">
                        <Thead>
                          <Tr>
                            <Th>CVE</Th>
                            <Th>NVD Base Score</Th>
                            <Th>NVD Severity</Th>
                            <Th>ExPRT Rating</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {r.cves.map((c) => {
                            return (
                              <Tr key={c.id}>
                                <Td>{c.id}</Td>
                                <Td>{c.baseScore}</Td>
                                <Td>
                                  <SeverityLabel name={c.severity} />
                                </Td>
                                <Td>
                                  <SeverityLabel name={c.exprtRating} />
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
            </DataList>
          </>
        )}
        {!loading && !error && sortedRemediations.length == 0 && (
          <EmptyState variant={EmptyStateVariant.xs}>
            <EmptyStateHeader
              titleText="No remediations"
              icon={<EmptyStateIcon icon={CheckIcon} />}
            />
            <EmptyStateBody>
              <p>The Falcon platform has not found any remediations to apply to this host.</p>
            </EmptyStateBody>
          </EmptyState>
        )}
      </CardBody>
    </Card>
  );
}
