import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SessionService } from './services/session.service';
import { filter, map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'ECommerce';
  noPadding = false;

  constructor(private sessionService: SessionService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.sessionService.initializeSession();

    //listen to route changes
    //drills down to the deepest child in case of nested routing
    //checks if that route's data has noPadding = true
    //sets this.noPadding accordingly
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let child = this.route.firstChild;
          while (child?.firstChild) {
            child = child.firstChild;
          }
          return child;
        }),
        filter(route => !!route),
        map(route => route!.snapshot.data['noPadding'] === true)
      )
      .subscribe((noPadding: boolean) => {
        this.noPadding = noPadding;
      });
  }
}
