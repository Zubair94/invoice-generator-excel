import { NgModule } from '@angular/core';
import { GeneratorRoutingModule } from './generator-routing.module';
import { GeneratorComponent } from './generator.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [GeneratorComponent],
  imports: [
    SharedModule,
    GeneratorRoutingModule
  ]
})
export class GeneratorModule { }
