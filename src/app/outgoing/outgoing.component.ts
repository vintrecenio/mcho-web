
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jQuery from 'jquery';
import 'datatables.net';
import 'datatables.net-bs';
declare var $: any;

@Component({
  selector: 'app-outgoing',
  templateUrl: './outgoing.component.html',
  styleUrls: ['./outgoing.component.css']
})
export class OutgoingComponent implements OnInit {

  //API URL
  private outgoing_url = 'http://localhost/mcho/api/outgoing';

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

    loadOutgoing(){
      this.http.get(this.outgoing_url)
      .subscribe((data: any[]) => {
        this.items = data;
        // Wait for changeDetection to occur
        this.chRef.detectChanges();
        this.initDataTable();
      });
    }

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadOutgoing();
  }

}
