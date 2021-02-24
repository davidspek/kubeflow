import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-secret',
  templateUrl: './form-secret.component.html',
  styleUrls: ['./form-secret.component.scss']
})
export class FormSecretComponent implements OnInit {
  @Input() parentForm: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
