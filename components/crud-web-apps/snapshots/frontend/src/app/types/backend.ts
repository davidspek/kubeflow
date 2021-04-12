import { Status, BackendResponse } from 'kubeflow';

export interface SWABackendResponse extends BackendResponse {
  snapshots?: SnapshotResponseObject[];
}

export interface SnapshotResponseObject {
  age: {
    uptime: string;
    timestamp: string;
  };
  restoreSize: string;
  class: string;
  modes: string[];
  name: string;
  namespace: string;
  status: Status;
  source: {
    persistentVolumeClaimName: string;
  }
}

export interface SnapshotProcessedObject extends SnapshotResponseObject {
  deleteAction?: string;
  editAction?: string;
  ageValue?: string;
  ageTooltip?: string;
}

export interface SnapshotPostObject {
  name: string;
  type: string;
  size: string | number;
  class: string;
  mode: string;
  snapshot: string;
}
