import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as Highcharts from 'highcharts';
import * as Exporting from 'highcharts/modules/exporting';
import * as NoData from 'highcharts/modules/no-data-to-display';
declare var $: any;

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  //API URL
  private items_url = 'http://localhost/mcho/api/items';
  private dispenseyears_url = 'http://localhost/mcho/api/dispenseyears';
  private dailydispense_url = 'http://localhost/mcho/api/dailydispense';

  x: any[];
  y: any[];
  chart: any;
  items: any[];
  years: any[];

  complianceForm: FormGroup;

  months= [
    { 'id' :1 , 'name':'January'},
    { 'id' :2 , 'name':'February'},
    { 'id' :3 , 'name':'March'},
    { 'id' :4 , 'name':'April'},
    { 'id' :5 , 'name':'May'},
    { 'id' :6 , 'name':'June'},
    { 'id' :7 , 'name':'July'},
    { 'id' :8 , 'name':'August'},
    { 'id' :9 , 'name':'September'},
    { 'id' :10, 'name':'October'},
    { 'id' :11, 'name':'November'},
    { 'id' :12, 'name':'December'}
  ];

loadComplianceForm(cat:any,month:any,year:any){
this.complianceForm = new FormGroup({
        selectItem:new FormControl(),
        selectMonth: new FormControl(),
        selectYear: new FormControl()
      });
        //Set default values to dropdowns
this.complianceForm.controls['selectItem'].setValue(0, {onlySelf: true});
this.complianceForm.controls['selectMonth'].setValue(month, {onlySelf: true});
this.complianceForm.controls['selectYear'].setValue(year, {onlySelf: true});
}

loadItems(){
    this.http.get(this.items_url)
    .subscribe((data: any[]) => {
      this.items = data;
      this.chRef.detectChanges();
    });
}

loadDispenseYears(){
    this.http.get(this.dispenseyears_url)
    .subscribe((data: any[]) => {
      this.years = data;
      this.chRef.detectChanges();
    });
}

loadDailyDispense(item:any,month:any,year:any){
    let data = { item_id: item, month: month, year: year};

      this.http.post(this.dailydispense_url, JSON.stringify(data))
      .subscribe(response => {
        this.x = response[0]['date'];
        this.y = response[1]['qty'];
        console.log(this.x);
        console.log(this.y);

        this.generateDDChart(item,month,year,this.x,this.y);
        
      });
}

generateDDChart(item:any, month:any, year:any, x:any[], y:any[]){
    
    Highcharts.chart('chart', {

        title: {
            text: 'Daily Item Dispense'
        },
    
        subtitle: {
            text: month + '/' + year
        },

        lang: {
            noData: "No data available"
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '16px',
                color: "#e40202be"
            }
        },

        xAxis: {
            title: {
                text: 'Days'
            },
            categories: x,
            crosshair: true,
            tickInterval: 1
        },
        series: [
        {
            name: "Item",
            data: y,
        }],
    
        yAxis: {
            title: {
                text: 'Quantity'
            }
        },
        legend: {
            adjustChartSize: true,
            layout: 'vertical',
            align: 'center',
            verticalAlign: 'top'
        },

        credits: {
            enabled: false
             },
            colors: [
                "#e40202be"
            ],
    
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    
    });
}

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef) { }

  ngOnInit() {

    // Return today's date and time
    var currentTime = new Date()
    // returns the month (from 0 to 11)
    var month = currentTime.getMonth() + 1;
    // returns the year (four digits)
    var year = currentTime.getFullYear(); 

    this.loadComplianceForm(2,month,year);

    this.loadItems();
    this.loadDispenseYears();

    Exporting(Highcharts);
    NoData(Highcharts);

    this.loadDailyDispense(0,month,year);
   
  }

}
