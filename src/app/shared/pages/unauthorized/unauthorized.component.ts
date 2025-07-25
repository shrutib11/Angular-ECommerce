import { Component, OnInit } from '@angular/core';
import { ComponentCommunicationService } from '../../../services/component-communication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent implements OnInit{
  constructor(private modalService: ComponentCommunicationService, private router : Router){}
  ngOnInit(): void {
    this.modalService.hideNavbar();
  }

  backToHome(){
    this.router.navigate(['/'])
    this.modalService.showNavbar();
  }
}
