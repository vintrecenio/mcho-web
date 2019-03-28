import { Component, OnInit, ChangeDetectorRef,ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotifierService } from 'angular-notifier';
import * as XLSX from 'xlsx';
import * as jQuery from 'jquery';
import 'datatables.net';
import 'datatables.net-bs';
declare var $: any;

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {


  private readonly notifier: NotifierService;

  //API URL
  private recipients_url = 'http://localhost/mcho/api/recipients';
  private recipients_inv_url = 'http://localhost/mcho/api/recipient_inv';
  private recipients_inv_detailed_url = 'http://localhost/mcho/api/recipient_inv_detailed';
  private dispensesupplyqty_url = 'http://localhost/mcho/api/dispensesupplyqty';
  private deductrecipientstock_url = 'http://localhost/mcho/api/deductrecipientstock';
  private checksupplyqty_url = 'http://localhost/mcho/api/checkstock';
  private checkexpirystock_url = 'http://localhost/mcho/api/checkexpirystock';
  private expirations_url = "http://localhost/mcho/api/expirations";
  private recipient_mainstock_url = 'http://localhost/mcho/api/recipientmainstock';

  private validate_item_url = 'http://localhost/mcho/api/validateitem';

  user = localStorage.getItem('user');

  expirations: any[];
  recipients: any[];
  invs: any[];
  dataTable: any;
  table: any;
  remaining: any;
  expiry: any;
  mainstock:any;
  expr:any;

  rawjson:any[];

  arrayBuffer:any;
  file:File;

  incomingfile(event) 
  {
  this.file= event.target.files[0]; 
  }
  
  private ischecked: boolean;
  
  uploadExcel() {
    let fileReader = new FileReader();
      fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();
          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary"});
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          // console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));

          this.rawjson = XLSX.utils.sheet_to_json(worksheet,{raw:true, range:5});

          //loop here to deduct items
          this.rawjson.forEach(element => {
              this.checkItemExistence(element.Description);
              // console.log(element.Description + " " + element.Qty);
          });
      }
      fileReader.readAsArrayBuffer(this.file);
    }

  checkItemExistence(descr: any){
      let x = { desc: descr };
      this.http.post(this.validate_item_url, x)
      .subscribe(response => {
        if(response['item_id'] != 0){
          console.log(descr + " " + response['item_id']);
        }else{
          console.log("Item not found");
        }
      },
    error => {
      console.log(error);
    }); 
  }

  onRecipientChange(recipient:any){
    if(this.ischecked == true){
      this.updateRecipientInventoryDetailed(recipient);
    }else{
      this.updateRecipientInventory(recipient);
    }
  }

  onToggle(value:boolean,recipient:any){
    this.ischecked = value;
    if(this.ischecked == true){
      this.updateRecipientInventoryDetailed(recipient);
    }else{
      this.updateRecipientInventory(recipient);
    }
  }

  initDataTable(){
    this.table = jQuery('#table_main');
    // jQuery DataTables :
    this.dataTable = this.table.DataTable({
      scrollY:"350px",
      scrollCollapse:true,
      paging:false,
      bFilter:true,
      ordering:false,
      info: false,
      responsive: true,
      rowCallback: function( row, data, index ) {
        if ( data[2] <= 5 )
        {
            $('td', row).addClass('paleredClass');
        }
        if ( data[2] == 0 )
        {   
            $('td', row).addClass('redClass');
        }
      }
    });
  
    }

    loadRecipientInventory(rid:any){
      let x = { recipient: rid};

      this.http.post(this.recipients_inv_url, x)
      .subscribe((data: any[]) => {
        this.invs = data;
        // Wait for changeDetection to occur
        this.chRef.detectChanges();
        this.initDataTable();
      });
    }

    loadRecipients(){
      this.http.get(this.recipients_url)
      .subscribe((data: any[]) => {
        this.recipients = data;
        this.chRef.detectChanges();
      });
    }

    updateRecipientInventory(rid: any){
      let x = { recipient: rid};

      this.http.post(this.recipients_inv_url, x)
      .subscribe((data: any[]) => {
        this.invs = data;
        // Wait for changeDetection to occur
        this.dataTable.destroy();
        this.chRef.detectChanges();
        this.initDataTable();
      });
    }

    updateRecipientInventoryDetailed(rid: any){
      let x = { recipient: rid};

      this.http.post(this.recipients_inv_detailed_url, x)
      .subscribe((data: any[]) => {
        this.invs = data;
        // Wait for changeDetection to occur
        this.dataTable.destroy();
        this.chRef.detectChanges();
        this.initDataTable();
      });
    }

    aClick(){
      return false;
    }

    onChangeExpiration(exp:any){

      //console.log(exp);

      if(exp != 0)
      {
      let x = { expiry_id: exp };
      this.http.post(this.checkexpirystock_url, JSON.stringify(x))
      .subscribe(response => {
        $('#exp_stock').show();
        $('#exp_stock').text(response['exp_remaining'] + ' remaining');
        console.log(response['exp_remaining']);
      },
      error => {
        this.notifier.notify( 'error', 'There was an error checking the stock.');
        console.log(error);
      
      });
    }else{
      $('#exp_stock').hide();
    }
    
    }

    loadExpirations(item_id:any){

      let x = { item_id: item_id };
      this.http.post(this.expirations_url, JSON.stringify(x))
      .subscribe((data: any[]) => {
        this.expirations = data;
        // Wait for changeDetection to occur
        this.chRef.detectChanges();
        
      });
    }  

    showDispenseStockModal(item_id : any, desc: any, unit: any){
      this.loadExpirations(item_id);
      this.loadModalElements(item_id,desc,unit);
    }

    showDeductQtyModal(item_id:any,desc:any,unit:any,recipient:any){ 
      let x = { item_id: item_id, recipient: recipient };
  
      this.http.post(this.recipient_mainstock_url, JSON.stringify(x))
      .subscribe(response => {
        this.mainstock = response['mainstock'];

        $('#item_id_deduct').val(item_id);
        $('#subheader_deduct').text(desc + ' (' + this.mainstock + ' ' + (this.mainstock > 1 ? (unit.slice(-1) == 'e' ? unit + 's' : unit + 'es') : unit) + ' in their stock)');
        $('#modalDeductStock').modal('show');
      },
      error => {
        this.notifier.notify( 'error', 'There was an error checking the recipient main stock.');
        console.log(error);
      
      }); 
    }

    loadModalElements(item_id : any, desc: any, unit: any){
      let x = { item_id: item_id };
  
      this.http.post(this.checksupplyqty_url, JSON.stringify(x))
      .subscribe(response => {
    
        if(response['remaining'] > 0){
          this.remaining = response['remaining'];
          this.notifier.hideNewest();
          $('#item_id').val(item_id);
          $('#subheader_stock').text(desc + ' (' + this.remaining + ' ' + (this.remaining > 1 ? (unit.slice(-1) == 'e' ? unit + 's' : unit + 'es') : unit) + ' in stock)');
          $('#modalDispenseStock').modal('show');
        
        }else{
          this.notifier.notify( 'warning', 'Sorry, we are running out of stock for this item.');
        }
    
      },
    error => {
      this.notifier.notify( 'error', 'There was an error checking the stock.');
      console.log(error);
    
    }); 
    }

    saveDeduction(item_id:any, recipient:any, qty:any, remarks:any){

      if(qty == ''){
        this.shakeModal();
        this.notifier.notify( 'warning', 'Please specify the quantity to deduct');
      }else{

          let data = { user: this.user, item_id: item_id, recipient: recipient, remarks: remarks, qty: qty};
        
          this.deductStock(data,recipient);
    }

    }

    deductStock(data, recipient:any){
      this.http.post(this.deductrecipientstock_url, JSON.stringify(data))
      .subscribe(response => {

        if(response['success'] == 1){
          //Close modal
          //this.dataTable.destroy();
          if(this.ischecked == false){
            this.updateRecipientInventory(recipient);
          }else{
            this.updateRecipientInventoryDetailed(recipient);
          }

          $('#modalDeductStock').modal('hide');
          this.notifier.notify( 'success', response['msg']);
          console.log(response);
        }else{
          this.shakeModal();
          this.notifier.notify( 'error', response['msg']);
        }

      },
      error => {
        this.notifier.notify( 'error', 'There was an error deducting stock.');
        console.log(error);
      });
    }

    saveDispense(item_id : any, recipient: any, remarks:any, qty:any, expid:any){

      let data = { user: this.user, supply_id: item_id, date_dispense: "", recipient_dispense: recipient, remarks_dispense: remarks, qty_dispense: qty, expiry_dispense: expid};
    
      this.http.post(this.dispensesupplyqty_url, JSON.stringify(data))
      .subscribe(response => {
        //console.log(response['msg']);
    
        if(response['success'] == 1){
            //Close modal
            if(this.ischecked == false){
              this.updateRecipientInventory(recipient);
            }else{
              this.updateRecipientInventoryDetailed(recipient);
            }
            $('#modalDispenseStock').modal('hide');
            this.notifier.notify( 'success', response['msg']);
            console.log(response);
        }else{
          this.shakeModal();
          this.notifier.notify( 'error', response['msg']);
        }
    
      },
    error => {
      this.notifier.notify( 'error', 'There was an error dispensing stock.');
      console.log(error);
    
    });
    }

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef, notifierService: NotifierService) { 
    this.notifier = notifierService;
  }

  shakeModal() {
    var l = 30;  
    for( var i = 0; i <= 5; i++ ) {   
      $('.modal').animate( { 
          'margin-left': '+=' + ( l = -l ) + 'px',
          'margin-right': '-=' + l + 'px'
       }, 50);  
    }
  }

  ngOnInit() {
    this.loadRecipients();
    this.loadRecipientInventory(0);

  }

}
