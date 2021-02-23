import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Config } from 'src/app/types';
import { getNameSyncValidators, getNameAsyncValidators } from 'kubeflow';

export function getFormDefaults(): FormGroup {
  const fb = new FormBuilder();

  return fb.group({
    name: ['', [Validators.required]],
    namespace: ['', [Validators.required]],
    baseImage: ['', [Validators.required]],
    customImage: ['', []],
    customImageCheck: [false, []],
    pipPackages: ['', []],
    condaPackages: ['', []],
    imageDestination: ['', []],
  });
}

export function initFormControls(formCtrl: FormGroup, config: Config) {
  // Sets the values from our internal dict. This is an initialization step
  // that should be only run once
  formCtrl.controls.pipPackages.setValue(config.pipPackages.value);
  if (config.pipPackages.readOnly) {
    formCtrl.controls.pipPackages.disable();
  }

  formCtrl.controls.pipPackages.setValue(config.pipPackages.value);
  if (config.condaPackages.readOnly) {
    formCtrl.controls.pipPackages.disable();
  }

  formCtrl.controls.baseImage.setValue(config.baseImage.value);
  if (config.baseImage.readOnly) {
    formCtrl.controls.baseImage.disable();
  }

  formCtrl.controls.imageDestination.setValue(config.imageDestination.value);
  if (config.imageDestination.readOnly) {
    formCtrl.controls.imageDestination.disable();
  }
}
