import { Status, BackendResponse, STATUS_TYPE } from 'kubeflow';

export interface VWABackendResponse extends BackendResponse {
  pvcs?: PVCResponseObject[];
}

export interface PVCResponseObject {
  age: {
    uptime: string;
    timestamp: string;
  };
  capacity: string;
  class: string;
  modes: string[];
  name: string;
  namespace: string;
  status: Status;
  pvcviewer: STATUS_TYPE;
}

export interface PVCProcessedObject extends PVCResponseObject {
  deleteAction?: string;
  closeViewerAction?: string;
  editAction?: string;
  ageValue?: string;
  ageTooltip?: string;
}

export interface PVCPostObject {
  name: string;
  type: string;
  size: string | number;
  class: string;
  mode: string;
  snapshot: string;
}
