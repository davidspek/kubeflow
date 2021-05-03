import { ActionListValue, ActionIconValue, TableColumn, TableConfig } from 'kubeflow';
import { tableConfig } from '../config';

const actionsCol: TableColumn = {
  matHeaderCellDef: '',
  matColumnDef: 'actions',
  value: new ActionListValue([
    new ActionIconValue({
      name: 'snapshot',
      tooltip: 'Take snapshot',
      color: 'primary',
      field: 'snapshotAction',
      iconReady: 'material:camera_alt',
    }),
    new ActionIconValue({
      name: 'edit',
      tooltip: 'Browse',
      color: 'primary',
      field: 'editAction',
      iconInit: 'material:folder',
      iconReady: 'custom:folderSearch',
    }),
    new ActionIconValue({
      name: 'close-viewer',
      tooltip: 'Close Viewer',
      color: 'warn',
      field: 'closeViewerAction',
      iconReady: 'material:close',
    }),
    new ActionIconValue({
      name: 'delete',
      tooltip: 'Delete Volume',
      color: 'warn',
      field: 'deleteAction',
      iconReady: 'material:delete',
    }),
  ]),
};

export const defaultConfig: TableConfig = {
  title: tableConfig.title,
  newButtonText: tableConfig.newButtonText,
  columns: tableConfig.columns.concat(actionsCol),
};
