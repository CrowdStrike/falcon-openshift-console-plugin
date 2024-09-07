import { GalleryItem, Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import * as React from 'react';

export default function HealthItem({ status = null, title, reason }) {
  let icon = <i className="fas fa-minus"></i>;
  if (status == 'success') {
    icon = <CheckCircleIcon />;
  } else if (status == 'danger') {
    icon = <ExclamationCircleIcon />;
  } else if (status == 'warning') {
    icon = <ExclamationTriangleIcon />;
  }
  return (
    <GalleryItem className="crwd-health-item">
      <div>
        <Icon status={status} size="lg">
          {icon}
        </Icon>
      </div>
      <div className="crwd-health-item__content">
        <div>{title}</div>
        <div>
          <small className="text-muted">{reason}</small>
        </div>
      </div>
    </GalleryItem>
  );
}
