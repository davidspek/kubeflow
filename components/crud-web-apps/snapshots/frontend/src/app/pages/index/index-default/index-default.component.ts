import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import {
  NamespaceService,
  ActionEvent,
  ConfirmDialogService,
  ExponentialBackoff,
  STATUS_TYPE,
  DIALOG_RESP,
  DialogConfig,
  SnackBarService,
  SnackType,
} from 'kubeflow';
import { defaultConfig } from './config';
import { environment } from '@app/environment';
import { SWABackendService } from 'src/app/services/backend.service';
import { SnapshotResponseObject, SnapshotProcessedObject } from 'src/app/types';
import { Subscription, Observable, Subject } from 'rxjs';
import { isEqual } from 'lodash';
import { FormDefaultComponent } from '../../form/form-default/form-default.component';

@Component({
  selector: 'app-index-default',
  templateUrl: './index-default.component.html',
  styleUrls: ['./index-default.component.scss'],
})
export class IndexDefaultComponent implements OnInit {
  public env = environment;
  public poller: ExponentialBackoff;

  public currNamespace = '';
  public subs = new Subscription();

  public config = defaultConfig;
  public rawData: SnapshotResponseObject[] = [];
  public processedData: SnapshotProcessedObject[] = [];
  fillerNav = Array();
  snapshotGroup = Array();

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  constructor(
    public ns: NamespaceService,
    public confirmDialog: ConfirmDialogService,
    public backend: SWABackendService,
    public dialog: MatDialog,
    public snackBar: SnackBarService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    this.poller = new ExponentialBackoff({ interval: 1000, retries: 3 });

    // Poll for new data and reset the poller if different data is found
    this.subs.add(
      this.poller.start().subscribe(() => {
        if (!this.currNamespace) {
          return;
        }

        this.backend.getSnapshots(this.currNamespace).subscribe(snapshots => {
          if (!isEqual(this.rawData, snapshots)) {
            this.rawData = snapshots;

            // Update the frontend's state
            this.processedData = this.parseIncomingData(snapshots);
            this.poller.reset();
            this.fillerNav = Array.from({length: this.snapshotTrackByFn.length}, (_, i) => this.processedData[i].source.persistentVolumeClaimName);
            // var group;
            // for (group in this.fillerNav) {
            //   this.snapshotGroup = this.processedData.filter(this.processedData.values)
            //   this.snapshotGroup = Array.from({length: this.fillerNav.length}, (_, i) => this.processedData[this.fillerNav.forEach].source.persistentVolumeClaimName);
            //   this.snapshotGroup = this.processedData.find(this.processedData.forEach(this.processedData.source.))
            // }
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

  public reactToAction(a: ActionEvent) {
    switch (a.action) {
      case 'newResourceButton': // TODO: could also use enums here
        this.newResourceClicked();
        break;
      case 'delete':
        this.deleteVolumeClicked(a.data);
        break;
    }
  }

  // Functions for handling the action events
  public newResourceClicked() {
    const ref = this.dialog.open(FormDefaultComponent, {
      width: '600px',
      panelClass: 'form--dialog-padding',
    });

    ref.afterClosed().subscribe(res => {
      if (res === DIALOG_RESP.ACCEPT) {
        this.snackBar.open(
          'Volume was submitted successfully.',
          SnackType.Success,
          2000,
        );
        this.poller.reset();
      }
    });
  }

  public deleteVolumeClicked(snapshot: SnapshotProcessedObject) {
    const deleteDialogConfig: DialogConfig = {
      title: `Are you sure you want to delete this volume? ${snapshot.name}`,
      message: 'Warning: All data in this volume will be lost.',
      accept: 'DELETE',
      confirmColor: 'warn',
      cancel: 'CANCEL',
      error: '',
      applying: 'DELETING',
      width: '600px',
    };

    const ref = this.confirmDialog.open(snapshot.name, deleteDialogConfig);
    const delSub = ref.componentInstance.applying$.subscribe(applying => {
      if (!applying) {
        return;
      }

      // Close the open dialog only if the DELETE request succeeded
      this.backend.deleteSnapshot(this.currNamespace, snapshot.name).subscribe({
        next: _ => {
          this.poller.reset();
          ref.close(DIALOG_RESP.ACCEPT);
        },
        error: err => {
          // Simplify the error message
          const errorMsg = err;
          console.log(err);
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

        snapshot.status.phase = STATUS_TYPE.TERMINATING;
        snapshot.status.message = 'Preparing to delete the Volume...';
        snapshot.deleteAction = STATUS_TYPE.UNAVAILABLE;
      });
    });
  }

  // Utility funcs
  public parseIncomingData(snapshots: SnapshotResponseObject[]): SnapshotProcessedObject[] {
    const snapshotsCopy = JSON.parse(JSON.stringify(snapshots)) as SnapshotProcessedObject[];

    for (const snapshot of snapshotsCopy) {
      snapshot.deleteAction = this.parseDeletionActionStatus(snapshot);
      snapshot.ageValue = snapshot.age.uptime;
      snapshot.ageTooltip = snapshot.age.timestamp;
    }

    return snapshotsCopy;
  }

  public parseDeletionActionStatus(snapshot: SnapshotProcessedObject) {
    if (snapshot.status.phase !== STATUS_TYPE.TERMINATING) {
      return STATUS_TYPE.READY;
    }

    return STATUS_TYPE.TERMINATING;
  }

  public snapshotTrackByFn(index: number, snapshot: SnapshotProcessedObject) {
    return `${snapshot.name}/${snapshot.namespace}/${snapshot.restoreSize}`;
  }
}
