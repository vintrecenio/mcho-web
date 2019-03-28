import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import {DatepickerOptions} from 'ng2-datepicker';
import * as enLocale from 'date-fns/locale/en';
import { HttpClient } from '@angular/common/http';
import * as jQuery from 'jquery';
import 'datatables.net';
import 'datatables.net-bs';
declare var $: any;

import { CompleterService, CompleterData, CompleterItem } from 'ng2-completer';

@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrls: ['./supplies.component.css'],
})
export class SuppliesComponent implements OnInit {

  private readonly notifier: NotifierService;

  user = localStorage.getItem('user');

  categories: any[]
  expirations: any[];
  units: any[];
  suppliers: any[];
  recipients: any[];
  inventories: any[];
  dataTable: any;
  table: any;
  date: Date;
  addsupplyForm: FormGroup;
  addqtyForm: FormGroup;
  dispenseqtyForm: FormGroup;
  
  today = new Date(); 

  selectedItem:any;
  selectedCategory:any;

  submitted = false;

  //API URL
  private categories_url = "http://localhost/mcho/api/categories";
  private units_url = "http://localhost/mcho/api/units";
  private expirations_url = "http://localhost/mcho/api/expirations";
  private inventory_url = 'http://localhost/mcho/api/inventory';
  private suppliers_url = 'http://localhost/mcho/api/suppliers';
  private recipients_url = 'http://localhost/mcho/api/recipients';
  private addsupply_url = 'http://localhost/mcho/api/addsupply';
  private editsupply_url = 'http://localhost/mcho/api/editsupply';
  private addsupplyqty_url = 'http://localhost/mcho/api/addsupplyqty';
  private dispensesupplyqty_url = 'http://localhost/mcho/api/dispensesupplyqty';
  private checksupplyqty_url = 'http://localhost/mcho/api/checkstock';
  private checkexpirystock_url = 'http://localhost/mcho/api/checkexpirystock';
  
  private items_url = 'http://localhost/mcho/api/searchitem/';

  protected dataService: CompleterData;

  constructor(private http: HttpClient, private chRef: ChangeDetectorRef, notifierService: NotifierService, private completerService: CompleterService){
    this.notifier = notifierService;
    this.dataService = completerService.remote(this.items_url,'description','description');
  }

  get e() { return this.addsupplyForm.controls; }

  options_expiry: DatepickerOptions = {
    locale: enLocale,
    displayFormat: 'YYYY-MM-DD',
    placeholder: '- Select expiry date -',
    useEmptyBarTitle: false,
    minYear: this.today.getFullYear(),
    minDate: new Date(Date.now())
  };
  options_received: DatepickerOptions = {
    locale: enLocale,
    displayFormat: 'YYYY-MM-DD',
    placeholder: '- Select a date -',
    useEmptyBarTitle: false,
    minYear: this.today.getFullYear(),
    maxDate: new Date(Date.now() + 1)
  };

  onCategorySelect(cat_id:any){
    this.selectedCategory = cat_id;
    console.log(this.selectedCategory);
  }

  onItemSelect(selected:CompleterItem){
    if(selected)
    this.selectedItem = selected.originalObject.id;
    console.log(this.selectedItem);
  }

  onChangeExpiration(exp:any){

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

  showAddSupplyModal(category:any){
    //Load suppliers
    this.http.get(this.suppliers_url)
    .subscribe((data: any[]) => {
      this.suppliers = data;
      this.chRef.detectChanges();
    });
    this.selectedCategory = category;
    console.log(this.selectedCategory);

    if(category == 0){
    $('#addnew_title').text('Add New');
    }else if(category == 1){
    $('#addnew_title').text('Add New Medicine');
    }else{
    $('#addnew_title').text('Add New Supply');
    }
    
    $('#modalAddSupply').modal('show');
  }

  loadCategories(){
    this.http.get(this.categories_url)
    .subscribe((data: any[]) => {
      this.categories = data;
      this.chRef.detectChanges();
    });
  }

  loadForm(){
    this.addsupplyForm = new FormGroup({
      date_received:new FormControl('', Validators.required),
      supplier: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      qty: new FormControl('', Validators.required),
      unit: new FormControl('', Validators.required),
      expiry: new FormControl('', Validators.required),
    });

    //Set default values to dropdowns
    this.addsupplyForm.controls['supplier'].setValue('0', {onlySelf: true});
    this.addsupplyForm.controls['unit'].setValue('0', {onlySelf: true});

    this.selectedItem = 0;
    this.selectedCategory = 0;

    console.log(this.selectedCategory);
  }

  loadAddQtyForm(){
    this.addqtyForm = new FormGroup({
      supplier_add: new FormControl('', Validators.required),
      qty_add: new FormControl('', Validators.required),
      remarks_add: new FormControl(''),
      date_received_add: new FormControl('', Validators.required),
      expiry_add: new FormControl('', Validators.required),
    });

    //Set default values to dropdowns
    this.addqtyForm.controls['supplier_add'].setValue('0', {onlySelf: true});
  }

  loadDispenseQtyForm(){
    this.dispenseqtyForm = new FormGroup({
      date_dispense: new FormControl('', Validators.required),
      recipient_dispense: new FormControl('', Validators.required),
      qty_dispense: new FormControl('', Validators.required),
      remarks_dispense: new FormControl(''),
      expiry_dispense: new FormControl('', Validators.required),
    });

    //Set default values to dropdowns
    this.dispenseqtyForm.controls['recipient_dispense'].setValue('0', {onlySelf: true});
  }

  loadExpirationsAddQty(item_id:any){

    let x = { item_id: item_id };
    this.http.post(this.expirations_url, JSON.stringify(x))
    .subscribe((data: any[]) => {
      this.expirations = data;
      // Wait for changeDetection to occur
      this.chRef.detectChanges();

      this.addqtyForm.controls['expiry_add'].setValue('0', {onlySelf: true});
      
    });
  }

  loadExpirationsDispenseQty(item_id:any){

    let x = { item_id: item_id };
    this.http.post(this.expirations_url, JSON.stringify(x))
    .subscribe((data: any[]) => {
      this.expirations = data;
      // Wait for changeDetection to occur
      this.chRef.detectChanges();

      this.dispenseqtyForm.controls['expiry_dispense'].setValue('0', {onlySelf: true});
      
    });
  }

/*   loadSupplies(cat:any){
    this.http.get(this.inventory_url)
    .subscribe((data: any[]) => {
      this.inventory = data;
      // Wait for changeDetection to occur
      this.chRef.detectChanges();
      this.initDataTable();
    });
  } */

  loadInventory(cat_id:any){
    let x = { category: cat_id};

    this.http.post(this.inventory_url, x)
    .subscribe((data: any[]) => {
      this.inventories = data;
      console.log(data);
      // Wait for changeDetection to occur
      this.chRef.detectChanges();
      this.initDataTable();
    });
  }

  loadUnits(){
    this.http.get(this.units_url)
    .subscribe((data: any[]) => {
      this.units = data;
      // Wait for changeDetection to occur
      this.chRef.detectChanges();
      
    });
  }

  updateInventory(cat_id:any){
    let x = { category: cat_id};

    this.http.post(this.inventory_url, x)
    .subscribe((data: any[]) => {
      this.inventories = data;
      // Wait for changeDetection to occur
      console.log(data);
      this.dataTable.destroy();
      this.chRef.detectChanges();
      this.initDataTable();
    });
  }

  initDataTable(){
    this.table = jQuery('table');

    $('table tfoot th').each( function () {
      var title = $(this).text();
      if(title == 'Description' || title == 'Category' || title == 'Stock' || title == 'Unit'){
        $(this).html( '<input type="text" class="form-control" placeholder="Search '+title+'..." />' );
      }
      // $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
    });
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
      },
/*       columnDefs: [{
        // puts a button in the last column
      targets: [6], render: function (a, b, data, d) {
            if (data[2] > 0) {
                return '<a href="" class="dyna-a" "><span title="Dispense Stock"><i class="glyphicon glyphicon-arrow-right" (click)="showDispenseQtyModal(supply.item, tdesc.id, tstock.id, tunit.id)"></i></span></a>';
            }
            return "";
        }
      }] */
    });

    // Apply the search
    var filterColumns = [0,1,2,3];
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

  showEditModal(sid : any, desc: any){
    $('#supply_edit_id').val(sid);
    $('#description_edit').val(desc);
    $('#modalEditSupply').modal('show');
  }

  showAddQtyModal(did : any, desc: any, stock: any, unit: any){
    this.http.get(this.suppliers_url)
    .subscribe((data: any[]) => {
      this.suppliers = data;
      this.chRef.detectChanges();
    });
    this.loadExpirationsAddQty(did);
    $('#supply_id').val(did);
    $('#subheader_newstock').text(desc + ' (' + stock + ' ' + (stock > 1 ? (unit.slice(-1) == 'e' ? unit + 's' : unit + 'es') : unit) + ' remaining)');
    $('#modalAddQty').modal('show');
  }

  showDispenseQtyModal(sid: any,desc: any, stock: any, unit: any){

    $('#exp_stock').hide();

    let x = { item_id: sid };
  
    this.http.post(this.checksupplyqty_url, JSON.stringify(x))
    .subscribe(response => {
  
      if(response['remaining'] > 0){
        this.notifier.hideNewest();
        this.http.get(this.recipients_url)
        .subscribe((data: any[]) => {
          this.recipients = data;
          this.chRef.detectChanges();
        });
        this.loadExpirationsDispenseQty(sid);
        $('#dispense_id').val(sid);
        $('#subheader_dispense').text(desc + ' (' + stock + ' ' + (stock > 1 ? (unit.slice(-1) == 'e' ? unit + 's' : unit + 'es') : unit) + ' total in stock)');
        $('#modalDispenseQty').modal('show');
      }else{
        this.notifier.notify( 'warning', 'Sorry, this item is currently out of stock.');
      }
  
    },
  error => {
    this.notifier.notify( 'error', 'There was an error checking the stock.');
    console.log(error);
  
  });

  }

  aClick(){
    return false;
  }

  ngOnInit(){
    this.loadCategories();
    this.loadForm();
    this.loadAddQtyForm();
    this.loadDispenseQtyForm();
    this.loadInventory(0);
    this.loadUnits();

    if (!this.chRef['destroyed']) {
      this.chRef.detectChanges();
  }

/*     $(".table").on('click', '.dyna-a', function() {
     return false;
    });

    $(".table").on('click', '.glyphicon-arrow-right', function() {
      alert("row" + $(this).closest('td').parent()[0].sectionRowIndex+ "Data Submitted" );  
      // var idx = $(this).cell('.selected', 0).index();
      // var data = $(this).rows( idx.row ).data();
      // alert(data);
     }); */
  
  }

saveSupply(){
  this.submitted = true;

  let x = { user: this.user, item_id: this.selectedItem, category: this.selectedCategory};
  let y = this.addsupplyForm.value;

  let data = Object.assign(x, y)

  if (this.addsupplyForm.invalid) {
    this.shakeModal();
    this.notifier.notify( 'error', 'All fields are required');
    return;
  }else{
      //console.log(JSON.stringify(data));
      if(this.selectedCategory == 0){
        this.shakeModal();
        this.notifier.notify( 'error', 'Please select a category');
      }else{

      this.http.post(this.addsupply_url, JSON.stringify(data))
      .subscribe(response => {
        console.log(response);

        if(response['success'] == 1){
            //Close modal
            this.updateInventory(0);
            $('#modalAddSupply').modal('hide');
            this.notifier.notify( 'success', response['msg']);
            this.loadForm();
            //console.log(response);
            
        }else{
          this.shakeModal();
          this.notifier.notify( 'error', response['msg']);
        }

      },
    error => {
      this.notifier.notify( 'error', 'A server error encountered.');
      console.log(error);
    });

      }
    }
}

saveSupplyQty(sid: any){

  //console.log(sid);
  let x = { user: this.user, supply_id: sid };
  let y = this.addqtyForm.value;

  let data = Object.assign(x, y)

  console.log(JSON.stringify(data));

  this.http.post(this.addsupplyqty_url, JSON.stringify(data))
  .subscribe(response => {
    //console.log(response['msg']);

    if(response['success'] == 1){
        //Close modal
        this.updateInventory(0);
        $('#modalAddQty').modal('hide');
        this.notifier.notify( 'success', response['msg']);
        console.log(response);
    }

  },
error => {
  this.notifier.notify( 'error', 'There was an error adding quantity to this item.');
  console.log(error);

});

}

saveDispenseQty(did: any){
    //console.log(sid);
    let x = { user: this.user, supply_id: did };
    let y = this.dispenseqtyForm.value;
  
    let data = Object.assign(x, y)
  
    console.log(JSON.stringify(data));
  
    this.http.post(this.dispensesupplyqty_url, JSON.stringify(data))
    .subscribe(response => {
      //console.log(response['msg']);
  
      if(response['success'] == 1){
          //Close modal
          this.updateInventory(0);
          $('#modalDispenseQty').modal('hide');
          this.notifier.notify( 'success', response['msg']);
          console.log(response);
      }else{
        this.notifier.notify( 'error', response['msg']);
      }
  
    },
  error => {
    this.notifier.notify( 'error', 'There was an error dispensing stock.');
    console.log(error);
  
  });
}


saveSupplyInfo(sid: HTMLInputElement, desc: HTMLInputElement){

  let data = { user: this.user, supply_id: sid, supply_desc: desc };

  this.http.post(this.editsupply_url, JSON.stringify(data))
  .subscribe(response => {
    //console.log(response['msg']);

    if(response['success'] == 1){
        //Close modal
        this.updateInventory(0);
        $('#modalEditSupply').modal('hide');
        this.notifier.notify( 'success', response['msg']);
        console.log(response);
    }else{
        this.notifier.notify( 'warning', response['msg']);
    }

  },
error => {
  this.notifier.notify( 'error', 'There was an error editing the item.');
  console.log(error);

});

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

}
