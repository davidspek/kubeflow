import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ValidatorFn,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  NamespaceService,
  getExistingNameValidator,
  dns1035Validator,
  getNameError,
  DIALOG_RESP,
} from 'kubeflow';
import { VWABackendService } from 'src/app/services/backend.service';
import { PVCPostObject, volumesnapshotsResponseObject, volumesnapshotGroup } from 'src/app/types';
import { MatDialogRef } from '@angular/material';
import * as _ from 'underscore';
import { Key } from 'selenium-webdriver';
import { getTime } from 'date-fns';

@Component({
  selector: 'app-form-default',
  templateUrl: './form-default.component.html',
  styleUrls: ['./form-default.component.scss'],
})
export class FormDefaultComponent implements OnInit, OnDestroy {
  public TYPE_ROK_SNAPSHOT = 'rok_snapshot';
  public TYPE_VOLUMESNAPSHOT = 'snapshot';
  public TYPE_EMPTY = 'empty';

  public subs = new Subscription();
  public formCtrl: FormGroup;
  public blockSubmit = false;

  public currNamespace = '';
  public pvcNames = new Set<string>();
  public volumesnapshotGroups: volumesnapshotGroup[] = [];
  public selectedSnapshot: volumesnapshotsResponseObject;
  public storageClasses: string[] = [];
  public defaultStorageClass: string;

  constructor(
    public ns: NamespaceService,
    public fb: FormBuilder,
    public backend: VWABackendService,
    public dialog: MatDialogRef<FormDefaultComponent>,
  ) {
    this.formCtrl = this.fb.group({
      type: ['empty', [Validators.required]],
      name: ['', [Validators.required]],
      namespace: ['', [Validators.required]],
      size: [10, []],
      class: ['$empty', [Validators.required]],
      mode: ['ReadWriteOnce', [Validators.required]],
      snapshot: ['', []],
    });
  }

  ngOnInit() {
    this.formCtrl.controls.namespace.disable();

    this.backend.getStorageClasses().subscribe(storageClasses => {
      this.storageClasses = storageClasses;

      // Once we have the list of storage classes, get the
      // default one from the backend and make it the preselected
      this.backend.getDefaultStorageClass().subscribe(defaultClass => {
        this.defaultStorageClass = defaultClass;
        this.formCtrl.controls.class.setValue(defaultClass);
      });
    });

    this.subs.add(
      this.ns.getSelectedNamespace().subscribe(ns => {
        this.currNamespace = ns;
        this.formCtrl.controls.namespace.setValue(ns);

        this.backend.getPVCs(ns).subscribe(pvcs => {
          this.pvcNames.clear();
          pvcs.forEach(pvc => this.pvcNames.add(pvc.name));
        });

        this.backend.getVolumeSnapshots(ns).subscribe(volumesnapshots => {
          const groupedVolumesnapshots = _.groupBy(volumesnapshots, 'source');
          Object.keys(groupedVolumesnapshots).forEach(element => { 
            var groupName = element
            var snapshot = groupedVolumesnapshots[element].sort((b, a) => getTime(a.age.timestamp) - getTime(b.age.timestamp))
            var object = {groupName: groupName, snapshots: snapshot}
            this.volumesnapshotGroups.push(object)
          });
          this.formCtrl.get('type').valueChanges.subscribe(volType => {
            if (volType === this.TYPE_VOLUMESNAPSHOT) {
              this.formCtrl.get('snapshot').setValidators([Validators.required]);
              this.formCtrl.get('snapshot').valueChanges.subscribe(volumesnapshot => {
                var index = volumesnapshots.findIndex(x => x.name === volumesnapshot);
                this.selectedSnapshot = volumesnapshots[index]
                this.formCtrl.controls.size.setValue(Number(this.selectedSnapshot.restoreSize.replace('Gi','')));

                if (this.selectedSnapshot.modes !== null) {
                  this.formCtrl.controls.mode.setValue(JSON.parse(this.selectedSnapshot.modes)[0]);
                } else {
                  this.formCtrl.controls.mode.setValue('ReadWriteOnce')
                }
                if (this.selectedSnapshot.originalStorageClass !== null) {
                  this.formCtrl.controls.class.setValue(JSON.parse(this.selectedSnapshot.originalStorageClass));
                } else {
                  this.formCtrl.controls.class.setValue(this.defaultStorageClass)
                }
              });
            }
          });
        });
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public onSubmit() {
    const pvc: PVCPostObject = JSON.parse(JSON.stringify(this.formCtrl.value));
    pvc.size = pvc.size + 'Gi';
    this.blockSubmit = true;

    this.backend.createPVC(this.currNamespace, pvc).subscribe(
      result => {
        this.dialog.close(DIALOG_RESP.ACCEPT);
      },
      error => {
        this.blockSubmit = false;
      },
    );
  }

  public onCancel() {
    this.dialog.close(DIALOG_RESP.CANCEL);
  }
}
