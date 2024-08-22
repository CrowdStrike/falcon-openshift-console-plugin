import { Label } from '@patternfly/react-core';
import { CriticalRiskIcon } from '@patternfly/react-icons';
import * as React from 'react';

export default function SeverityLabel({ name }) {
  // const colors = {
  //   critical: "#C9190B", // red-100
  //   high: '#EC7A08', // orange-300
  //   medium: '#F4C145', // gold-300
  //   low: '#5BA352', // green-400
  //   informational: '#2B9AF3', // blue-300
  //   unknown: '#8A8D90' // black-500
  // }
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
      {name.charAt(0).toUpperCase()}
      {name.substring(1).toLowerCase()}
    </Label>
  );
}
