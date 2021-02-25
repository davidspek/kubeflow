import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Config, WorkflowFormObject } from 'src/app/types';
import { Subscription } from 'rxjs';
import {
  NamespaceService,
  BackendService,
  SnackBarService,
  SnackType,
  getNameError,
} from 'kubeflow';
import { Router } from '@angular/router';
import { getFormDefaults, initFormControls } from './utils';
import { BWABackendService } from 'src/app/services/backend.service';
import { environment } from '@app/environment';

@Component({
  selector: 'app-form-default',
  templateUrl: './form-default.component.html',
  styleUrls: ['./form-default.component.scss'],
})
export class FormDefaultComponent implements OnInit, OnDestroy {
  currNamespace = '';
  formCtrl: FormGroup;
  config: Config;

  blockSubmit = false;
  formReady = false;
  existingWorkflows = new Set<string>();

  subscriptions = new Subscription();

  constructor(
    public namespaceService: NamespaceService,
    public backend: BWABackendService,
    public router: Router,
    public popup: SnackBarService,
  ) {}

  ngOnInit(): void {
    // Initialize the form control
    this.formCtrl = this.getFormDefaults();

    // Update the form Values from the default ones
    this.backend.getConfig().subscribe(config => {
      if (Object.keys(config).length === 0) {
        // Don't fire on empty config
        return;
      }

      this.config = config;
      this.initFormControls(this.formCtrl, config);
    });

    // Keep track of the selected namespace
    this.subscriptions.add(
      this.namespaceService.getSelectedNamespace().subscribe(namespace => {
        this.currNamespace = namespace;
        this.formCtrl.controls.namespace.setValue(this.currNamespace);
      }),
    );
  }

  ngOnDestroy() {
    // Unsubscriptions
    this.subscriptions.unsubscribe();
  }

  // Functions for handling the Form Group of the entire Form
  getFormDefaults() {
    return getFormDefaults();
  }

  initFormControls(formCtrl: FormGroup, config: Config) {
    initFormControls(formCtrl, config);
  }

  // Form Actions
  getSubmitWorkflow(): WorkflowFormObject {
    const workflowCopy = this.formCtrl.value as WorkflowFormObject;
    const workflow = JSON.parse(JSON.stringify(workflowCopy));

    // Use the custom image instead
    if (workflow.customImageCheck) {
      workflow.image = workflow.customImage;
    }

    return workflow;
  }

  onSubmit() {
    const workflow = this.getSubmitWorkflow();
    this.backend.createWorkflow(workflow).subscribe(() => {
      this.popup.close();
      this.router.navigate(['/']);
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
