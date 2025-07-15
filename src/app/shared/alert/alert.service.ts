import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  showSuccess(message: string) {
    Swal.fire({
      toast: true,
      icon: 'success',
      title: message,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  showError(message: string) {
    Swal.fire({
      toast: true,
      icon: 'error',
      title: message,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  async showConfirm(options: {
    title: string,
    text?: string,
    confirmButtonText?: string,
    cancelButtonText?: string
  }): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      text: options.text || '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: options.confirmButtonText || 'Yes, delete it!',
      cancelButtonText: options.cancelButtonText || 'Cancel'
    });
    return result.isConfirmed;
  }
}
