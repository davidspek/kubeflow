import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-form-destination',
  templateUrl: './form-destination.component.html',
  styleUrls: ['./form-destination.component.scss']
})
export class FormDestinationComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() readonly: boolean;

  constructor() { }

  ngOnInit() {
  }

}
