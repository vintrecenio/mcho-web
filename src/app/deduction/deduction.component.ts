
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jQuery from 'jquery';
import 'datatables.net';
import 'datatables.net-bs';
declare var $: any;

@Component({
  selector: 'app-deduction',
  templateUrl: './deduction.component.html',
  styleUrls: ['./deduction.component.css']
})
export class DeductionComponent implements OnInit {

  //API URL
  private deductions_url = 'http://localhost/mcho/api/deduction';

  items: any[];
  dataTable: any;
  table: any;

  initDataTable(){
      this.table = jQuery('table');
  
      // jQuery DataTables :
      this.dataTable = this.table.DataTable({
        paging:true,
        lengthChange: false,
        bFilter:true,
        ordering:false,
        info: false,
        responsive: true
      });
  
    }

    loadODeductions(){
      this.http.get(this.deductions_url)
      .subscribe((data: any[]) => {
        this.items = data;
        // Wait for changeDetection to occur
        this.chRef.detectChanges();
        this.initDataTable();
      });
    }

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadODeductions();
  }

}
