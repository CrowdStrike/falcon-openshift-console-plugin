import {
  Alert,
  Skeleton,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  DataListCell,
  DataListContent,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import * as React from 'react';
import './finding-list.css';

interface FindingsListProps {
  queryPromise: Promise<any>;
  sortFn?: (a: any, b: any) => number;
  idField: string;
  header: {
    field: string;
    width?: 1 | 2 | 3 | 4 | 5;
  }[];
  body: {
    field: string;
    name?: string;
  }[];
  termWidth?: string;
  displayFns: Record<string, (value: any) => any>;
}

export default function FindingsList({
  queryPromise,
  sortFn = null,
  idField,
  header,
  body,
  termWidth = null,
  displayFns,
}: FindingsListProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [findings, setFindings] = React.useState(null);
  const [expanded, setExpanded] = React.useState([]);

  React.useEffect(() => {
    if (queryPromise == null) return;

    queryPromise
      .then((resp) => {
        if (resp['resources'].length == 0) return;
        const findings = resp['resources'];
        if (sortFn) findings.sort(sortFn);
        setFindings(findings);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [queryPromise]);

  function toggle(id: string) {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)]
        : [...expanded, id];
    setExpanded(newExpanded);
  }

  function headerCells(finding) {
    return header.map((h) => {
      return (
        <DataListCell key={h.field} width={h.width ? h.width : null}>
          {/* if there is a custom display function for this field, call it; otherwise just display field value */}
          {h.field in displayFns ? displayFns[h.field](finding[h.field]) : finding[h.field]}
        </DataListCell>
      );
    });
  }

  return (
    <>
      {error && (
        <Alert variant="warning" title="Something went wrong">
          {error}
        </Alert>
      )}
      {loading && <Skeleton />}
      {!loading && !error && findings && findings.length > 0 && (
        <DataList aria-label="Findings">
          {findings.map((f) => {
            return (
              <DataListItem key={f[idField]} isExpanded={expanded.includes(f[idField])}>
                <DataListItemRow>
                  <DataListToggle
                    onClick={() => toggle(f[idField])}
                    isExpanded={expanded.includes(f[idField])}
                    id={f[idField]}
                  />
                  <DataListItemCells dataListCells={headerCells(f)} />
                </DataListItemRow>
                <DataListContent
                  aria-label="Finding details"
                  isHidden={!expanded.includes(f[idField])}
                >
                  <DescriptionList isHorizontal termWidth={termWidth} isCompact>
                    {body.map((b) => {
                      return (
                        <DescriptionListGroup key={b.field}>
                          <DescriptionListTerm className={!b.name && 'crwd-finding-field-as-name'}>
                            {b.name ? b.name : b.field}
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            {b.field in displayFns ? displayFns[b.field](f[b.field]) : f[b.field]}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      );
                    })}
                  </DescriptionList>
                </DataListContent>
              </DataListItem>
            );
          })}
        </DataList>
      )}
      {!loading && !error && findings && findings.length == 0 && (
        <EmptyState variant={EmptyStateVariant.xs}>
          <EmptyStateHeader titleText="No findings" icon={<EmptyStateIcon icon={CheckIcon} />} />
          <EmptyStateBody>
            <p>No findings.</p>
          </EmptyStateBody>
        </EmptyState>
      )}
    </>
  );
}
