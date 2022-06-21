import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs';
import { Account } from '../../models/account';
import environment from '../../../environments/environment';
import AccountsService from '../../services/accounts.service';
@Component({
  selector: 'app-manage-accounts',
  templateUrl: './manage-accounts.component.html',
  styleUrls: ['./manage-accounts.component.css'],
})
export default class ManageAccountsComponent implements OnInit {
  // using ViewChild we will access paginator and sort controls defined in html template
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  accounts: Array<Account>;
  // current data shown on the grid 
  dataSource: MatTableDataSource<Account>;
  resultCount: Number;
  pageSize = environment.gridDefaultPageSize;

  displayedColumns: string[] = [
    'accountTitle',
    'accountNumber',
    'currentBalance',
    'email',
    'phoneNumber',
    'accountStatus',
    'button'
  ];

  constructor(private accountService: AccountsService) { }

  ngOnInit() {
    if (this.paginator != undefined) {
      this.loadAccounts(this.paginator.pageIndex, this.paginator.pageSize);
    }
    else
      this.loadAccounts(0, this.pageSize);

  }


  loadAccounts(pageIndex: number, pageSize: number) {

    // picking up pageIndex and pageSize information from the paginator.
    this.accountService.getAllAccountsPaginated(pageIndex, pageSize).subscribe({
      next: (data) => {
        // whenever new set of data comes from server we reinitialize the datastore.
        this.dataSource = new MatTableDataSource(data.accounts);
        this.dataSource.sort = this.sort;
        this.resultCount = data.resultCount;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  applyFilter(event: Event) {
    // picking up filter value from textbox
    const filterValue = (event.target as HTMLInputElement).value;
    // filtering each property of object array based on filter criteria. 
    // each time data is to be filtered is picked from this.accounts because it has original copy if data returned form teh server
    const filteredData = this.accounts.filter(x => x.accountTitle.includes(filterValue) ||
      x.currentBalance.toString().includes(filterValue) ||
      x.user.email.includes(filterValue) ||
      x.user.phoneNumber.includes(filterValue) ||
      x.accountNumber.includes(filterValue))
    // initializing the datastore with filtered data.
    this.dataSource = new MatTableDataSource(filteredData);
  }
}
