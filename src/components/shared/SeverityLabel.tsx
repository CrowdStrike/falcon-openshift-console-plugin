import { Label } from '@patternfly/react-core';
import { CriticalRiskIcon } from '@patternfly/react-icons';
import * as React from 'react';

export default function SeverityLabel({ name, text = null }) {
  const n = name.toLowerCase();

  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'gold',
    low: 'green',
    informational: 'blue',
  };

  const color = n in colors ? colors[n] : null;
  const icon = n == 'critical' ? <CriticalRiskIcon /> : null;

  return (
    <Label color={color} icon={icon}>
      {text ? (
        text
      ) : (
        <>
          {name.charAt(0).toUpperCase()}
          {name.substring(1).toLowerCase()}
        </>
      )}
    </Label>
  );
}
