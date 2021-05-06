import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
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
import { VWABackendService } from 'src/app/services/backend.service';
import { PVCResponseObject, PVCProcessedObject, volumesnapshotsResponseObject, volumesnapshotGroup, VolumeSnapshotPostObject } from 'src/app/types';
import { Subscription, Observable, Subject } from 'rxjs';
import { isEqual } from 'lodash';
import { FormDefaultComponent } from '../../form/form-default/form-default.component';
import { MatIconModule, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import * as _ from 'underscore';
import { getTime } from 'date-fns';

@Component({
  selector: 'app-snapshot',
  templateUrl: './snapshot.component.html',
  styleUrls: ['./snapshot.component.scss'],
  // animations: [
  //   trigger('bodyExpansion', [
  //     state('collapsed, void', style({ height: '0px', visibility: 'hidden' })),
  //     state('expanded', style({ height: '*', visibility: 'visible' })),
  //     transition('expanded <=> collapsed, void => collapsed',
  //       animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    // ])
  // ]
})
export class SnapshotComponent implements OnInit {
  public env = environment;
  public poller: ExponentialBackoff;

  public currNamespace = '';
  public subs = new Subscription();
  public volumesnapshotGroups: volumesnapshotGroup[] = [];
  public intermedaiteVolumesnapshotGroups: volumesnapshotGroup[] = [];
  public selectedSnapshot: volumesnapshotsResponseObject;

  public config = defaultConfig;
  public rawData: PVCResponseObject[] = [];
  public rawSnapshotData: volumesnapshotsResponseObject[] = [];
  public processedData: PVCProcessedObject[] = [];


  constructor(
    public ns: NamespaceService,
    public confirmDialog: ConfirmDialogService,
    public backend: VWABackendService,
    public dialog: MatDialog,
    public snackBar: SnackBarService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer
  ) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('static/assets/mdi.svg')
    );
  }

  ngOnInit() {
    this.poller = new ExponentialBackoff({ interval: 1000, retries: 3 });

    // Poll for new data and reset the poller if different data is found
    this.subs.add(
      this.poller.start().subscribe(() => {
        if (!this.currNamespace) {
          return;
        }

        this.backend.getPVCs(this.currNamespace).subscribe(pvcs => {
          if (!isEqual(this.rawData, pvcs)) {
            this.rawData = pvcs;

            // Update the frontend's state
            this.processedData = this.parseIncomingData(pvcs);
            this.poller.reset();
          }
        });

        this.backend.getVolumeSnapshots(this.currNamespace).subscribe(volumesnapshots => {
          if (!isEqual(this.rawSnapshotData, volumesnapshots)) {
            this.rawSnapshotData = volumesnapshots;

            // Update the frontend's state
            this.volumesnapshotGroups = this.parseIncomingSnapshotData(volumesnapshots);
            this.poller.reset();
            console.log(this.volumesnapshotGroups)
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
      case 'snapshot':
        this.snapshotVolumeClicked(a.data);
        break;
    }
  }

  public snapshotVolumeClicked(pvc: PVCProcessedObject) {
    console.log("snapshot clicked pvc: ", pvc)

    pvc.snapshotAction = this.parseSnapshotActionStatus(pvc);

    this.backend.createVolumeSnapshot(this.currNamespace, pvc.name).subscribe({
      next: res => {
        this.poller.reset();
      },
      error: err => {
        pvc.snapshotAction = this.parseSnapshotActionStatus(pvc);
      },
    });
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

  public deleteVolumeClicked(pvc: PVCProcessedObject) {
    const deleteDialogConfig: DialogConfig = {
      title: `Are you sure you want to delete this volume? ${pvc.name}`,
      message: 'Warning: All data in this volume will be lost.',
      accept: 'DELETE',
      confirmColor: 'warn',
      cancel: 'CANCEL',
      error: '',
      applying: 'DELETING',
      width: '600px',
    };

    const ref = this.confirmDialog.open(pvc.name, deleteDialogConfig);
    const delSub = ref.componentInstance.applying$.subscribe(applying => {
      if (!applying) {
        return;
      }

      // Close the open dialog only if the DELETE request succeeded
      this.backend.deletePVC(this.currNamespace, pvc.name).subscribe({
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

        pvc.status.phase = STATUS_TYPE.TERMINATING;
        pvc.status.message = 'Preparing to delete the Volume...';
        pvc.deleteAction = STATUS_TYPE.UNAVAILABLE;
      });
    });
  }

  // Utility funcs
  public parseIncomingData(pvcs: PVCResponseObject[]): PVCProcessedObject[] {
    const pvcsCopy = JSON.parse(JSON.stringify(pvcs)) as PVCProcessedObject[];

    for (const pvc of pvcsCopy) {
      pvc.deleteAction = this.parseDeletionActionStatus(pvc);
      pvc.snapshotAction = this.parseSnapshotActionStatus(pvc);
      pvc.ageValue = pvc.age.uptime;
      pvc.ageTooltip = pvc.age.timestamp;
    }

    return pvcsCopy;
  }

  // Sort snapshots into groups based on their origin PVC
  public parseIncomingSnapshotData(volumesnapshots: volumesnapshotsResponseObject[]): volumesnapshotGroup[] {
    this.intermedaiteVolumesnapshotGroups = []
    const groupedVolumesnapshots = _.groupBy(volumesnapshots, 'source');
      Object.keys(groupedVolumesnapshots).forEach(element => { 
        var groupName = element
        var snapshot = groupedVolumesnapshots[element].sort((b, a) => getTime(a.age.timestamp) - getTime(b.age.timestamp))
        var object = {groupName: groupName, snapshots: snapshot}
        console.log(snapshot.length)
        this.intermedaiteVolumesnapshotGroups.push(object)
        });
    return this.intermedaiteVolumesnapshotGroups;
  }

  public parseDeletionActionStatus(pvc: PVCProcessedObject) {
    if (pvc.status.phase !== STATUS_TYPE.TERMINATING) {
      return STATUS_TYPE.READY;
    }

    return STATUS_TYPE.TERMINATING;
  }

  public parseSnapshotActionStatus(pvc: PVCProcessedObject) {
    // If the PVC is being created or there was an error, then
    // don't allow the user to edit it
    if (
      pvc.status.phase === STATUS_TYPE.UNINITIALIZED ||
      pvc.status.phase === STATUS_TYPE.WAITING ||
      pvc.status.phase === STATUS_TYPE.WARNING ||
      pvc.status.phase === STATUS_TYPE.TERMINATING ||
      pvc.status.phase === STATUS_TYPE.ERROR
    ) {
      return STATUS_TYPE.UNAVAILABLE;
    }
    if (
      pvc.volumesnapshotClass !== null
    ) {
      return STATUS_TYPE.READY;
    }

    return STATUS_TYPE.UNAVAILABLE;
  }

  public pvcTrackByFn(index: number, pvc: PVCProcessedObject) {
    return `${pvc.name}/${pvc.namespace}/${pvc.capacity}`;
  }
}
