
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jQuery from 'jquery';
import 'datatables.net';
import 'datatables.net-bs';
declare var $: any;

@Component({
  selector: 'app-incoming',
  templateUrl: './incoming.component.html',
  styleUrls: ['./incoming.component.css']
})
export class IncomingComponent implements OnInit {

  //API URL
  private trails_url = 'http://localhost/mcho/api/incoming';

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

    loadIncoming(){
      this.http.get(this.trails_url)
      .subscribe((data: any[]) => {
        this.items = data;
        // Wait for changeDetection to occur
        this.chRef.detectChanges();
        this.initDataTable();
      });
    }

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadIncoming();
  }

}
