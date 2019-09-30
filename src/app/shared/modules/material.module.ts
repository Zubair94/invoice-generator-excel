import { NgModule } from '@angular/core';
import { MatFormFieldModule, MatButtonModule, MatProgressBarModule } from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  exports: [
    MatFormFieldModule,
    MatButtonModule,
    MatProgressBarModule
  ]
})
export class MaterialModule { }
