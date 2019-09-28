import { Component, OnInit } from '@angular/core';
import { AlertService } from '../core/services/alert.service';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent implements OnInit {

  constructor(private alertService: AlertService) { }

  ngOnInit() {
  }

  test(){
    this.alertService.success("test", "test");
  }

}
