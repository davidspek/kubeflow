import { Status, BackendResponse, STATUS_TYPE } from 'kubeflow';

export interface VWABackendResponse extends BackendResponse {
  pvcs?: PVCResponseObject[];
  volumesnapshots?: volumesnapshotsResponseObject[];
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
  volumesnapshotClass: string;
}

export interface volumesnapshotsResponseObject {
  age: {
    uptime: string;
    timestamp: string;
  };
  restoreSize: string;
  source: string;
  modes: string;
  originalStorageClass: string;
  name: string;
  namespace: string;
  status: Status;
  snapshotClassName: string;
}

export interface volumesnapshotGroup {
  groupName: string;
  snapshots: volumesnapshotsResponseObject[];
}

export interface PVCProcessedObject extends PVCResponseObject {
  deleteAction?: string;
  closeViewerAction?: string;
  snapshotAction?: string;
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

export interface VolumeSnapshotPostObject {
  pvcName: string;
  snapshotName?: string;
  annotations?: string;
}
