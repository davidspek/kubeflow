import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-conda',
  templateUrl: './form-conda.component.html',
  styleUrls: ['./form-conda.component.scss']
})
export class FormCondaComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() readonly: boolean;

  constructor() { }

  ngOnInit() {
  }

}
