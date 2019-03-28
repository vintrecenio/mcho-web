import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jQuery from 'jquery';
import 'datatables.net';
import 'datatables.net-bs';
declare var $: any;

@Component({
  selector: 'app-trail',
  templateUrl: './trail.component.html',
  styleUrls: ['./trail.component.css']
})
export class TrailComponent implements OnInit {

  //API URL
  private trails_url = 'http://localhost/mcho/api/trails';

  trails: any[];
  dataTable: any;
  table: any;

  initDataTable(){
      this.table = jQuery('table');
  
      $('table tfoot th').each( function () {
        var title = $(this).text();
          $(this).html( '<input type="text" class="form-control" placeholder="Search '+title+'..." />' );
        // $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
      });
      // jQuery DataTables :
      this.dataTable = this.table.DataTable({
        paging:true,
        lengthChange: false,
        bFilter:true,
        ordering:false,
        info: false,
        responsive: true
      });
  
      // Apply the search
      var filterColumns = [0,1,2];
      this.dataTable.columns(filterColumns).every( function () {
          var that = this;
    
          $( 'input', this.footer() ).on( 'keyup change', function () {
              if ( that.search() !== this.value ) {
                  that
                      .search( this.value.replace(/,/g, "|"), true, false )
                      .draw();
              }
          });
      });
  
    }

    loadTrails(){
      this.http.get(this.trails_url)
      .subscribe((data: any[]) => {
        this.trails = data;
        // Wait for changeDetection to occur
        this.chRef.detectChanges();
        this.initDataTable();
      });
    }

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadTrails();
  }

}
