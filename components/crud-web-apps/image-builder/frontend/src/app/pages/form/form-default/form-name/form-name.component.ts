import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
  FormGroup,
  ValidatorFn,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { NamespaceService } from 'kubeflow';
import { Subscription } from 'rxjs';
import { BWABackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-form-name-namespace',
  templateUrl: './form-name.component.html',
  styleUrls: ['./form-name.component.scss'],
})
export class FormNameComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  existingWorkflows: Set<string> = new Set<string>();

  @Input() parentForm: FormGroup;

  constructor(
    private backend: BWABackendService,
    private ns: NamespaceService,
  ) {}

  ngOnInit() {
    // Keep track of the existing Notebooks in the selected Namespace
    // Use these names to check if the input name exists
    const nsSub = this.ns.getSelectedNamespace().subscribe(ns => {
      this.backend.getWorkflows(ns).subscribe(workflow => {
        this.existingWorkflows.clear();
        workflow.map(workflow => this.existingWorkflows.add(workflow.name));
      });
    });

    this.subscriptions.add(nsSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
