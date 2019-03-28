import { StatisticsComponent } from './statistics/statistics.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { Ng2CompleterModule } from "ng2-completer";

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SuppliesComponent } from './supplies/supplies.component';
import { AccountsComponent } from './accounts/accounts.component';
import { NgDatepickerModule } from 'ng2-datepicker';
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { TrailComponent } from './trail/trail.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { IncomingComponent } from './incoming/incoming.component';
import { OutgoingComponent } from './outgoing/outgoing.component';
import { DeductionComponent } from './deduction/deduction.component';
import { SampleComponent } from './sample/sample.component';

const appRoutes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'home', component: HomeComponent, children:
  [
    { path: 'supplies', component: SuppliesComponent, outlet: "content", data: {animation: {page: 'suppliesPage'}} },
    { path: 'monitor', component: MonitoringComponent, outlet: "content", data: {animation: {page: 'monitoringPage'}} },
    { path: 'incoming', component: IncomingComponent, outlet: "content", data: {animation: {page: 'incomingPage'}} },
    { path: 'outgoing', component: OutgoingComponent, outlet: "content", data: {animation: {page: 'outgoingPage'}} },
    { path: 'deduction', component: DeductionComponent, outlet: "content", data: {animation: {page: 'deductionPage'}} },
    { path: 'trail', component: TrailComponent, outlet: "content", data: {animation: {page: 'trailPage'}} },
    { path: 'statistics', component: StatisticsComponent, outlet: "content", data: {animation: {page: 'statisticsPage'}} },
    { path: 'accounts', component: AccountsComponent, outlet: "content", data: {animation: {page: 'accountsPage'}} }

  ]
  },
]

/**
 * Custom angular notifier options
 */
const customNotifierOptions: NotifierOptions = {
  position: {
		horizontal: {
			position: 'right',
			distance: 12
		},
		vertical: {
			position: 'top',
			distance: 12,
			gap: 10
		}
	},
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 1
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SuppliesComponent,
    StatisticsComponent,
    AccountsComponent,
    TrailComponent,
    MonitoringComponent,
    IncomingComponent,
    OutgoingComponent,
    DeductionComponent,
    SampleComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    NgDatepickerModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    NotifierModule.withConfig(customNotifierOptions),
    PDFExportModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    Ng2CompleterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
