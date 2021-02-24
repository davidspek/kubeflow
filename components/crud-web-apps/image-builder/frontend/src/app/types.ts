import { Status, BackendResponse } from 'kubeflow';

export interface BWABackendResponse extends BackendResponse {
  workflows?: WorkflowResponseObject[];
  config?: Config;
}

export interface WorkflowResponseObject {
  name: string;
  namespace: string;
  status: Status;
  reason: string;
  age: string;
  baseImage: string;
  volumes: string[];
  cpu: string;
  gpus: {
    count: number;
    message: string;
  };
  memory: string;
  environment: string;
  shortImage: string;
}

export interface WorkflowProcessedObject extends WorkflowResponseObject {
  deleteAction?: string;
}

export interface WorkflowFormObject {
  name: string;
  namespace: string;
  baseImage: string;
  customImage?: string;
  customImageCheck: boolean;
  pipPackages: string;
  condaPackages: string;
  imageDestination: string;
  secretName: string;
}

// Types of the Configuration with default values from backend
export interface Config {
  baseImage?: {
    value: string;
    options: string[];
    readOnly?: boolean;
  };

  pipPackages?: {
    value: string;
    readOnly?: boolean;
  };

  condaPackages?: {
    value: string;
    readOnly?: boolean;
  };

  imageDestination?: {
    value: string;
    readOnly?: boolean;
  };

  secretName?: {
    value: string;
    readOnly?: boolean;
  };

}
