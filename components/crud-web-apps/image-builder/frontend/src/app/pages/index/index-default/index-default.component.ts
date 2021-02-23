import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@app/environment';
import {
  NamespaceService,
  ExponentialBackoff,
  ActionEvent,
  STATUS_TYPE,
  DialogConfig,
  ConfirmDialogService,
  SnackBarService,
  DIALOG_RESP,
  SnackType,
} from 'kubeflow';
import { BWABackendService } from 'src/app/services/backend.service';
import { Subscription } from 'rxjs';
import {
  defaultConfig,
  getDeleteDialogConfig,
} from './config';
import { isEqual } from 'lodash';
import { WorkflowResponseObject, WorkflowProcessedObject } from 'src/app/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index-default',
  templateUrl: './index-default.component.html',
  styleUrls: ['./index-default.component.scss'],
})
export class IndexDefaultComponent implements OnInit, OnDestroy {
  env = environment;
  poller: ExponentialBackoff;

  currNamespace = '';
  subs = new Subscription();

  config = defaultConfig;
  rawData: WorkflowResponseObject[] = [];
  processedData: WorkflowProcessedObject[] = [];

  constructor(
    public ns: NamespaceService,
    public backend: BWABackendService,
    public confirmDialog: ConfirmDialogService,
    public snackBar: SnackBarService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.poller = new ExponentialBackoff({ interval: 1000, retries: 3 });

    // Poll for new data and reset the poller if different data is found
    this.subs.add(
      this.poller.start().subscribe(() => {
        if (!this.currNamespace) {
          return;
        }

        this.backend.getWorkflows(this.currNamespace).subscribe(workflows => {
          if (!isEqual(this.rawData, workflows)) {
            this.rawData = workflows;

            // Update the frontend's state
            this.processedData = this.processIncomingData(workflows);
            this.poller.reset();
          }
        });
      }),
    );

    // Reset the poller whenever the selected namespace changes
    this.subs.add(
      this.ns.getSelectedNamespace().subscribe(ns => {
        this.currNamespace = ns;
        this.poller.reset();
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.poller.stop();
  }

  // Event handling functions
  reactToAction(a: ActionEvent) {
    switch (a.action) {
      case 'newResourceButton': // TODO: could also use enums here
        this.newResourceClicked();
        break;
      case 'delete':
        this.deleteVolumeClicked(a.data);
        break;
    }
  }

  public newResourceClicked() {
    // Redirect to form page
    this.router.navigate(['/new']);
  }

  public deleteVolumeClicked(workflow: WorkflowProcessedObject) {
    const deleteDialogConfig = getDeleteDialogConfig(workflow.name);

    const ref = this.confirmDialog.open(workflow.name, deleteDialogConfig);
    const delSub = ref.componentInstance.applying$.subscribe(applying => {
      if (!applying) {
        return;
      }

      // Close the open dialog only if the DELETE request succeeded
      this.backend.deleteWorkflow(this.currNamespace, workflow.name).subscribe({
        next: _ => {
          this.poller.reset();
          ref.close(DIALOG_RESP.ACCEPT);
        },
        error: err => {
          const errorMsg = err;
          deleteDialogConfig.error = errorMsg;
          ref.componentInstance.applying$.next(false);
        },
      });

      // DELETE request has succeeded
      ref.afterClosed().subscribe(res => {
        delSub.unsubscribe();
        if (res !== DIALOG_RESP.ACCEPT) {
          return;
        }

        workflow.status.phase = STATUS_TYPE.TERMINATING;
        workflow.status.message = 'Preparing to delete the Image Build Job...';
        this.updateNotebookFields(workflow);
      });
    });
  }

  // Data processing functions
  updateNotebookFields(notebook: WorkflowProcessedObject) {
    notebook.deleteAction = this.processDeletionActionStatus(notebook);
  }

  processIncomingData(workflows: WorkflowResponseObject[]) {
    const workflowsCopy = JSON.parse(
      JSON.stringify(workflows),
    ) as WorkflowProcessedObject[];

    for (const wf of workflowsCopy) {
      this.updateNotebookFields(wf);
    }
    return workflowsCopy;
  }

  // Action handling functions
  processDeletionActionStatus(workflow: WorkflowProcessedObject) {
    if (workflow.status.phase !== STATUS_TYPE.TERMINATING) {
      return STATUS_TYPE.READY;
    }

    return STATUS_TYPE.TERMINATING;
  }

  public workflowTrackByFn(index: number, workflow: WorkflowProcessedObject) {
    return `${workflow.name}/${workflow.baseImage}`;
  }
}
