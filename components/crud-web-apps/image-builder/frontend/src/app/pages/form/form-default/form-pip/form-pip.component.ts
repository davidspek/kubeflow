import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-pip-namespace',
  templateUrl: './form-pip.component.html',
  styleUrls: ['./form-pip.component.scss'],
})
export class FormPipComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() readonlyPip: boolean;

  constructor() {}

  ngOnInit() {}

}
