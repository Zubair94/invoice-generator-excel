import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toastrService: ToastrService) { }

  success(message: string, title: string){
    this.toastrService.success(message, title, {
      closeButton: true
    });
  }

  error(message: string, title: string){
    this.toastrService.error(message, title, {
      closeButton: true
    });
  }

  warning(message: string, title: string){
    this.toastrService.warning(message, title, {
      closeButton: true
    });
  }

  info(message: string, title: string){
    this.toastrService.info(message, title, {
      closeButton: true
    });
  }
}