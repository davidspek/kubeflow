import {
  PropertyValue,
  StatusValue,
  ActionListValue,
  ActionIconValue,
  ActionButtonValue,
  TRUNCATE_TEXT_SIZE,
  MenuValue,
  DialogConfig,
} from 'kubeflow';

// --- Configs for the Confirm Dialogs ---
export function getDeleteDialogConfig(name: string): DialogConfig {
  return {
    title: `Are you sure you want to delete this notebook server? ${name}`,
    message:
      'Warning: Your data might be lost if the notebook server is not' +
      ' backed by persistent storage',
    accept: 'DELETE',
    confirmColor: 'warn',
    cancel: 'CANCEL',
    error: '',
    applying: 'DELETING',
    width: '600px',
  };
}

// --- Config for the Resource Table ---
export const defaultConfig = {
  title: 'Notebook Servers',
  newButtonText: 'NEW SERVER',
  columns: [
    {
      matHeaderCellDef: 'Status',
      matColumnDef: 'status',
      value: new StatusValue(),
    },
    {
      matHeaderCellDef: 'Name',
      matColumnDef: 'name',
      value: new PropertyValue({
        field: 'name',
        truncate: TRUNCATE_TEXT_SIZE.SMALL,
        tooltipField: 'name',
      }),
    },
    {
      matHeaderCellDef: 'Age',
      matColumnDef: 'age',
      value: new PropertyValue({ field: 'age' }),
    },
    {
      matHeaderCellDef: 'Image',
      matColumnDef: 'image',
      value: new PropertyValue({
        field: 'shortImage',
        tooltipField: 'image',
        truncate: TRUNCATE_TEXT_SIZE.MEDIUM,
      }),
    },
    {
      matHeaderCellDef: 'GPUs',
      matColumnDef: 'gpus',
      value: new PropertyValue({
        field: 'gpus.count',
        tooltipField: 'gpus.message',
      }),
    },
    {
      matHeaderCellDef: 'CPUs',
      matColumnDef: 'cpu',
      value: new PropertyValue({ field: 'cpu' }),
    },
    {
      matHeaderCellDef: 'Memory',
      matColumnDef: 'memory',
      value: new PropertyValue({ field: 'memory' }),
    },
    {
      matHeaderCellDef: 'Volumes',
      matColumnDef: 'volumes',
      value: new MenuValue({ field: 'volumes', itemsIcon: 'storage' }),
    },

    {
      matHeaderCellDef: '',
      matColumnDef: 'actions',
      value: new ActionListValue([
        new ActionIconValue({
          name: 'delete',
          tooltip: 'Delete this notebook server',
          color: '',
          field: 'deleteAction',
          iconReady: 'material:delete',
        }),
      ]),
    },
  ],
};
