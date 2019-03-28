import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet} from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { trigger, animate, transition, style, state, group} from '@angular/animations';
declare var $ :any;

export const routeStateTrigger =
  // trigger name for attaching this animation to an element using the [@triggerName] syntax
  trigger('routeState', [

    // route 'enter and leave (<=>)' transition
    transition('*<=>*', [

      // css styles at start of transition
      style({ opacity: 0 }),

      // animation and styles at end of transition
      animate('0.4s', style({ opacity: 1 }))
    ]),

  ]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeStateTrigger]
})
export class HomeComponent implements OnInit {

  //API URL
  private auth_url = 'http://localhost/mcho/api/check_auth';
  private logout_url = 'http://localhost/mcho/api/logout';

  user = localStorage.getItem('user');
  token = localStorage.getItem('token');

  getAnimationData(outlet: RouterOutlet){
    const routeData = outlet.activatedRouteData['animation'];
    if(!routeData){
      return 'suppliesPage';
    }
    return routeData['page'];
  }

  toggleMenu(){
    $('#wrapper').toggleClass('toggled');
  }

  logOut(){

    this.http.post(this.logout_url, {user: this.user, token: this.token})
    .subscribe(response => {

      console.log(response);
      
        if(response['success'] == 1){
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          $('#modalConfirmLogout').modal('hide');
            
          this.router.navigate(['/']);
        }
    },
    error => {
      console.log(error);
    });
  }

  aClick(){
    return false;
  }

  openLogoutModal(){
    $('#modalConfirmLogout').modal('show');
  }

  validateAuth(){

    this.http.post(this.auth_url, {user: this.user, token: this.token})
    .subscribe(response => {
      
        if(response['status'] == 1){
          this.router.navigate(['/home', {outlets: {'content': ['supplies']}}]);
        }else{
          this.router.navigate(['/']);
        }
    },
    error => {
      console.log(error);
    });
  }

  animateMenu(){
    var forEach=function(t,o,r){if("[object Object]"===Object.prototype.toString.call(t))for(var c in t)Object.prototype.hasOwnProperty.call(t,c)&&o.call(r,t[c],c,t);else for(var e=0,l=t.length;l>e;e++)o.call(r,t[e],e,t)};

    var hamburgers = document.querySelectorAll(".hamburger");
    if (hamburgers.length > 0) {
      forEach(hamburgers, function(hamburger) {
        hamburger.addEventListener("click", function() {
          this.classList.toggle("is-active");
        }, false);
      }, true);
    }
  }
  
  constructor(private http: HttpClient, private router: Router, public loader: LoadingBarService) {

   }

  ngOnInit() {
    this.validateAuth();
    this.animateMenu();
  }

  items = [
    {
      title: 'Inventory',
      link: ['/home', {outlets: {'content': ['supplies']}}],
    },
    {
      title: 'Monitoring',
      link: ['/home', {outlets: {'content': ['monitor']}}],
    },
    {
      title: 'Audit Trail',
      link: ['/home', {outlets: {'content': ['trail']}}],
    },
    // {
    //   title: 'Account',
    //   link: ['/home', {outlets: {'content': ['accounts']}}],
    // },
  ];

}
