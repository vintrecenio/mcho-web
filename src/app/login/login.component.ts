import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private readonly notifier: NotifierService;

  loading = false;
  submitted = false;
  loginForm: FormGroup;

  //API URL
  private login_url = 'http://localhost/mcho/api/login';
  private auth_url = 'http://localhost/mcho/api/check_auth';

  shakeForm() {
    var l = 30;  
    for( var i = 0; i <= 5; i++ ) {   
      $('form').animate( { 
          'margin-left': '+=' + ( l = -l ) + 'px',
          'margin-right': '-=' + l + 'px'
       }, 50);  
    }
  }

  loadForm(){
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
  });

  }

  // convenience getter for easy access to form fields
  get e() { return this.loginForm.controls; }

  validateAuth(){
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    this.http.post(this.auth_url, {user: user, token: token})
    .subscribe(response => {

      //console.log(response);
      
        if(response['status'] == 1){
          this.router.navigate(['/home', {outlets: {'content': ['supplies']}}]);
        }else{
          this.router.navigate(['/']);
        }
    },
    error => {
      //console.log(error.json());
    });
  }

  // validate login credentials
  validateCredential(){
    this.submitted = true;
    this.loading = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
        this.loading = false;
        this.shakeForm();
        return;
    }else{

      let data = this.loginForm.value;

      //console.log(JSON.stringify(data));
      let key_token = 'token'; 
      let key_user = 'user'; 

      this.http.post(this.login_url, JSON.stringify(data))
      .subscribe(response => {
        
          if(response['success'] == 1){
            // console.log(response['token']);
            //Save id and token to session storage
            localStorage.setItem(key_user, response['user']);
            localStorage.setItem(key_token, response['token']);

            this.loading = false;
            this.notifier.notify( 'success', response['msg']);
            this.router.navigate(['/home', {outlets: {'content': ['supplies']}}]);
          }else{
            this.notifier.notify( 'error', response['msg']);
            // $('#invalid_credential').html("<br><div class='alert alert-danger'>"+response['msg']+"</div>");
            this.shakeForm();
            this.loading = false;
          }
      },
      error => {
        this.loading = false;
        this.notifier.notify( 'error', 'Error connecting to the server. Please retry.');
        console.log(error);
      });
    }
  }

  constructor(private http: HttpClient, private router: Router, private formBuilder: FormBuilder, notifierService: NotifierService) { 
    this.notifier = notifierService;
  }

  ngOnInit() {
  
    this.validateAuth();
    this.loading = false;
    this.loadForm();
  }

}
