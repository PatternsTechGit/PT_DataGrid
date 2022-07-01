# Angular Material Data Grid


## What is Data Grid
DataGrid is used to display data in scrollable grid. It requires data source to populate data in the grid. DataGrid is a powerful html table with functionality like searching, sorting and pagination.

## What is mat-table
[Mat-Table](https://material.angular.io/components/table/overview) provides a Material Design styled data-table that can be used to display rows of data. `mat-table` contains powerful features like searching, sorting and pagination.

 
## About this exercise

**Backend Code Base:**
Previously we developed a base structure of an api solution in asp.net core that have just two api functions `GetLast12MonthBalances` & `GetLast12MonthBalances/{userId}` which returns data of the last 12 months total balances.

 ![1](https://user-images.githubusercontent.com/100709775/174861820-11a39314-f8ea-42d0-90cd-e7f6a74d8c68.jpg)

 There are 4 Projects in the solution.

**Entities** : This project contains DB models like User where each User has one Account and each Account can have one or many Transaction. There is also a Response Model of LineGraphData that will be returned as API Response.

**Infrastructure**: This project contains BBBankContext that serves as fake DBContext that populates one User with its corresponding Account that has some Transactions dated of last twelve months with hardcoded data.

**Services**: This project contains TransactionService with the logic of converting Transactions into LineGraphData after fetching them from BBBankContext.

**BBBankAPI**: This project contains TransactionController with two GET methods `GetLast12MonthBalances` & `GetLast12MonthBalances/{userId}` to call the TransactionService.

![2](https://user-images.githubusercontent.com/100709775/174861824-b40818a7-6aa1-4351-900b-3fba69e6bc26.png)

For more details about this base project see: [Service Oriented Architecture Lab](https://github.com/PatternsTechGit/PT_ServiceOrientedArchitecture)

**Frontend Code Base:**

Previously, we scaffolded a new Angular application in which we have

* FontAwesome library for icons.
* Bootstrap library for styling.



## In this exercise

 * We will implement AccountController that will return the relevant information.
 * We will implement data grid using Angular Material's mat-table in BBankUI project.
 * We will implement pagination using mat-table.
 * We will implement sorting using mat-table.
 * We will implement searching and filtering.


 Here are the steps to begin with 

# Server Side Implementation 

## Step 1 : Create Account Controller

We will create a new `AccountController` in BBankAPI project then create a new method named `GetAllAccountsPaginated` which will be calling the `AccountService` to get the accounts related information.
 The AccountController will looks like below :

```cs
[Route("api/[controller]")]
    [ApiController]
    public class AccountsController : Controller
    {
        private readonly IAccountsService _accountsService; 
        public AccountsController(IAccountsService accountsService)
        {
            _accountsService = accountsService;
        }

        [HttpGet]
        [Route("GetAllAccountsPaginated")]
        public async Task<ActionResult> GetAllAccountsPaginated([FromQuery] int pageIndex, [FromQuery] int pageSize)
        {
            try
            {
                return new OkObjectResult(await _accountsService.GetAllAccountsPaginated(pageIndex, pageSize));
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(ex);
            }
        }
    }
```

## Step 2 : Create IAccountsService Interface

We will create `IAccountsService` interface under Contracts folder in Services project, which will contains `GetAllAccountsPaginated` method

```cs
   public interface IAccountsService
    {
        Task<AccountsListResponse> GetAllAccountsPaginated(int pageIndex, int pageSize);
    }
```

## Step 3 : Create AccountsListResponse & PhoneNumber Property

We will create `AccountsListResponse` class under Responses folder in Entities project, which will contains the list of Accounts and ResultCount as below :

```cs
  public class AccountsListResponse
    {
        public IEnumerable<Account> Accounts { get; set; }
        // paginator requires total counts of the data available on server
        public int ResultCount { get; set; }
    }
```

Also we will add a new property `PhoneNumber` in `User` class as below 

```cs
public string PhoneNumber { get; set; }
```
 
 ## Step 4 : Implement IAccountsService

We will create `AccountService` class in Services project, which will implement the `IAccountsService` interface which will return the required account related information as below :

```cs
public class AccountService : IAccountsService
    {
        private readonly BBBankContext _bbBankContext;
        public AccountService(BBBankContext BBBankContext)
        {
            _bbBankContext = BBBankContext;
        }
        
        public async Task<AccountsListResponse> GetAllAccountsPaginated(int pageIndex, int pageSize)
        {
            // totalCount of data available on server.
            var totalCount =  _bbBankContext.Accounts.Count;
            var accounts =  _bbBankContext.Accounts
                // first n number of records will be skipped based on pageSize and pageIndex
                // for example for pageIndex 2 of pageSize is 10 first 10 records will be skipped.
                .Skip((pageIndex) * pageSize)
                .Take(pageSize)
                .ToList();
            return new AccountsListResponse
            {
                Accounts = accounts,
                ResultCount = totalCount
            };
        }
    }
```

## Step 5 : Setup BBBankContext with Fake Details

Go to `BBBankContext` class in Infrastructure project and create accounts and users objects with and fake values as below :

```cs
  this.Users = new List<User>();

            // initializing a new user 
            this.Users.Add(new User
            {
                Id = AzureADUserID,
                FirstName = "Raas",
                LastName = "Masood",
                Email = "rassmasood@hotmail.com",
                ProfilePicUrl = "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_crop,g_face,r_max/w_200/lady.jpg"
            });

            // initializing 24 new fake users. 
            for (int i = 1; i < 25; i++)
            {
                this.Users.Add(new User { Id = i.ToString(), FirstName = "Fake", LastName = "Fake", Email = "fake@fake.com", PhoneNumber = i.ToString() + "998877665", ProfilePicUrl = "https://images.freeimages.com/images/premium/previews/1670/16703169-disgusted-lounge-singer.jpg" });
            }
            // creating the collection for account list
            this.Accounts = new List<Account>();

            // initializing a new account 
            this.Accounts.Add(new Account
            {
                Id = "aa45e3c9-261d-41fe-a1b0-5b4dcf79cfd3",
                AccountNumber = "0001-1001",
                AccountTitle = "Raas Masood",
                CurrentBalance = 3500M,
                AccountStatus = AccountStatus.Active,
                User = this.Users[0]
            });

            // initializing 24 new fake Accounts. 
            for (int i = 1; i < 25; i++)
            {
                this.Accounts.Add(new Account { UserId = i.ToString(), Id = Guid.NewGuid().ToString(), AccountNumber = i.ToString() + "-xxx-xxx", AccountStatus = AccountStatus.InActive, CurrentBalance = i * 100, AccountTitle = "Fake Account " + i.ToString(),User= this.Users[i] });
            }  
```

## Step 6 : Add AccountService to the container

Go to  `program.cs` class in BBankAPI project and add the accountService reference in services container as below 

```cs
    builder.Services.AddScoped<IAccountsService, AccountService>();
```

Run the project and see its working as below :

![AccountDetails](https://user-images.githubusercontent.com/100709775/174651287-8d6a252e-358c-4d6a-864b-838b908757cf.PNG)





# Client Side Implementation 

First we will install Angular Material in our BBankUI, to see how it's installed see : https://github.com/PatternsTechGit/PT_Angular-Materials-Side

## Step 1 : Setup Account Service.

Create a new file `accounts.service.ts` in services folder which will contain the `getAllAccountsPaginated` method which will call the API method to retrieve the required accounts information as below :

```ts
export default class AccountsService {
  constructor(private httpClient: HttpClient) { }

  getAllAccountsPaginated(pageIndex: number, pageSize: number): Observable<AccountListsResponse> {
    return this.httpClient.get<AccountListsResponse>(`${environment.apiUrlBase}Accounts/GetAllAccountsPaginated?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  }
}
```
## Step 2 : Setup AccountResponse.

Create a new file `account.ts` in models folder which will contain the `AccountListsResponse` class which has account property of `Accounts` class and `resultCount` property as number. Further `Accounts` class contains user property which is object of `user` class 

```ts
export class AccountListsResponse {
  accounts: Array<Account>;
  resultCount: number;
}

export class Account {
  accountTitle: string;
  user: User;
  currentBalance: number;
  accountStatus: number;
  accountNumber: string;
}
export class User {
  profilePicUrl: string;
  email: string;
  phoneNumber: string;
}

```

## Step 3 : Create Environment Variable  

Go to `environment.ts` and create a new `gridDefaultPageSize` object with default value 10 as below :

```ts
export const environment = {
  production: false,
  apiUrlBase: 'http://localhost:5070/api/',
  gridDefaultPageSize: 10
};
```

## Step 4 : Import Modules
Go to `app.module.ts` and import `MatTableModule` `MatSortModule` `MatPaginatorModule` and `BrowserAnimationsModule` modules as below :

```ts
 imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule ,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    BrowserAnimationsModule
  ],
```

## Step 5 : Implement Mat-Table

Go to `app.component.ts` and create an instance of `AccountsService` in constructor. Create a method `loadAccounts` that will called on `ngOnInit()` to get accounts information. Further we will subscribe  `paginator.page` on `ngAfterViewInit()` which will automatically emits pagination values like page number.


The `matSort` is used, respectively, to add sorting state and display to tabular data.

We will be using `MatPaginator` to provide navigation between paged information. Displays the size of the current page, user-selectable options to change that size, what items are being shown, and navigational button to go to the previous or next page.

The `AppComponent` class will looks like below :

```ts
export class AppComponent implements OnInit {

  title = 'BBBankUI';
  lineGraphData: lineGraphData;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  accounts: Array<Account>;
  // current data shown on the grid 
  dataSource: MatTableDataSource<Account>;
  resultCount: number;
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


  constructor(private transactionService: TransactionService, private accountService: AccountsService) { }

  ngOnInit(): void {
    if(this.paginator.pageSize==undefined)
    this.paginator.pageSize=this.pageSize;
   this.loadAccounts(this.paginator.pageIndex, this.paginator.pageSize); 

    this.transactionService
      .GetLast12MonthBalances('aa45e3c9-261d-41fe-a1b0-5b4dcf79cfd3')
      .subscribe({
        next: (data) => {
          this.lineGraphData = data;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
  ngAfterViewInit(): void {
    this.paginator.page
      .pipe(
        // after view is initialized we are sure that paginator is populated by now
        // paginator emits events when user selects new page. so we are loading page specific data from server.
        tap(() => this.loadAccounts(this.paginator.pageIndex, this.paginator.pageSize))
      )
      .subscribe();
  }

  loadAccounts(pageIndex: number, pageSize: number) {

    // picking up pageIndex and pageSize information from the paginator.
    this.accountService.getAllAccountsPaginated(pageIndex, pageSize).subscribe({
      
      next: (data) => {
        this.paginator.page
        // whenever new set of data comes from server we reinitialize the datastore.
        this.dataSource = new MatTableDataSource(data.accounts);
        this.dataSource.sort = this.sort;
        this.resultCount = data.resultCount;
        this.accounts  = data.accounts;

      },
      error: (error) => {
        console.log(error);
      },
    });
  }

}
```



## Step 6 : Configure Mat-Table
Go to `app.component.html` and create mat-table which provides a Material Design styled data-table that can be used to display rows of data. along with this we will create a textbox for searching and filtering. 

The mat table contains multiple [Features](https://material.angular.io/components/table/api) as below :

* **dataSource** - When providing a DataSource object, the table will use the Observable stream provided by the connect function and trigger updates when that stream emits new data array values.
* **matSortActive** When the data is passed to the Data Table, its usually already sorted. This directive allows us to inform the Data Table that the data is already initially sorted by the seqNo column, so the seqNo column sorting icon will be displayed as an upwards arrow
* **matSortDirection** This is a companion directive to matSortActive, it specifies the direction of the initial sort. In this case, the data is initially sorted by the seqNo column in ascending order, and so the column header will adapt the sorting icon accordingly.
* **mat-header** Header row (on top) is defined using mat-header-row and is supplied with the list of columns to show in form of string array (displayedColumns).
*  **mat-paginator**  Adds pagination capability to the mat table.

We will create the grid using mat table as below :

```html
<div class="card card-tasks">
  <div class="card-header">
      <div class="row">
          <div class="col-12 col-sm-6">
              <h6 class="title">All Accounts</h6>
          </div>
          <div class="col-12 col-sm-6">

          </div>
      </div>
  </div>
  <div class="card-body">
      <div class="table-full-width table-responsive">
          <!-- mat-table makes html table am angular material table -->
          <!-- dataSource attr is set to dataSource property of type MatTableDataSource in the code -->
          <!-- by default on page load gird will be sorted on accountNumber column -->
          <!-- matSort makes the mat table sortable -->
          <!-- matSortDirection sets the starting sort order of matSortActive column -->
          <table mat-table [dataSource]="dataSource" matSort matSortActive="accountTitle" matSortDisableClear
              matSortDirection="asc">
              <!-- Title Column -->
              <!-- each column is defined using matColumnDef and its value matches tha values in displayedColumns array in code. -->
              <ng-container matColumnDef="accountTitle">
                  <!-- to make any column sortable we have to add mat-sort-header to th tag -->
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="pupo">ACCOUNT TITLE</th>
                  <!-- matCellDef defines the cell and single row of datasource array (set in [dataSource]="dataSource") can be accessed here. -->
                  <td mat-cell *matCellDef="let row">
                      <!-- look and feel of each individual cell can be defined here -->
                      <div class="row">
                          <div class="col-lg-3">
                              <div class="photo">
                                  <!-- each property of the row can be accessed here -->
                                  <img src="{{row.user?.profilePicUrl}} " alt="Avatar">
                              </div>

                          </div>
                          <div class="col-lg-9 pupo">
                              {{row.accountTitle}}
                          </div>
                      </div>

                  </td>
              </ng-container>

              <!-- Number Column -->
              <ng-container matColumnDef="accountNumber">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="pupo">ACCOUNT NUMBER</th>
                  <td mat-cell *matCellDef="let row" class="pupo">{{row.accountNumber}}</td>
              </ng-container>

              <!-- State Column -->
              <ng-container matColumnDef="currentBalance">
                  <th mat-header-cell *matHeaderCellDef class="pupo">CURRENT BALANCE</th>
                  <td mat-cell *matCellDef="let row" class="pupo">{{row.currentBalance | currency}}</td>
              </ng-container>

              <!-- Created Column -->
              <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="pupo">
                      EMAIL
                  </th>
                  <td mat-cell *matCellDef="let row" class="pupo">{{row.user?.email}}</td>
              </ng-container>
              <!-- Created Column -->
              <ng-container matColumnDef="phoneNumber">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header class="pupo">
                      Phone Number
                  </th>
                  <td mat-cell *matCellDef="let row" class="pupo">{{row.user?.phoneNumber}}</td>
              </ng-container>
              <!-- Created Column -->
              <ng-container matColumnDef="accountStatus">
                  <th mat-header-cell *matHeaderCellDef class="pupo">
                      STATUS
                  </th>
                  <td mat-cell *matCellDef="let row"><span class="status-inactive"
                          [ngClass]="{'status-inactive': row.accountStatus == 1,'status-active': row.accountStatus == 0 }">
                          <i class="fas fa-circle"></i></span> </td>
              </ng-container>
              <ng-container matColumnDef="button">
                  <th mat-header-cell *matHeaderCellDef>

                  </th>
                  <td mat-cell *matCellDef="let row"><button class="btn btn-primary">
                          <!-- (click)=manage(row) -->
                          Manage
                      </button> </td>
              </ng-container>
              <!--  header row (on top) is defined using mat-header-row and is supplied with the list of columns to show in form of string array (displayedColumns) -->
              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="pups"></tr>
              <!-- Data row definition for the mat-table. Captures the data row's template and other properties such as the columns to display and a when predicate that describes when this row should be used. -->
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="pups"></tr>
          </table>
      </div>
  </div>
</div>
<div class="card-footer">
  <div class="button-container">
      <!-- mat-paginator  adds pagination capability to the mat table -->
      <!-- resultCount has total number of results returned from the server will be shown on paginator. e.g. 1-5 of 22  -->
      <!-- pageSize is defaulted to 10, But can be customized using pageSizeOptions -->
      <mat-paginator [length]="resultCount" [pageSize]="pageSize" style="margin-right: 20px;"></mat-paginator>
  </div>
</div>
```

## Step 7 : Implement Searching/Filtering
We will create `applyFilter`function which will be triggered on `(keyup)` event of textbox for filtering the records. This function will be using 
`accounts` object for filtering and then set the filtered result back to `dataSource` object.

Go to `app.component.html` and create a textbox with `(keyup)` event as below : 

```html 
  <!-- Simple text box that calls a function when a user types something -->
              <input (keyup)="applyFilter($event)" type="text" class="form-control" placeholder="Search">
```

Go to `app.component.ts` and create a function `applyFilter` as below :

```ts
 applyFilter(event: Event) {
    // picking up filter value from text box
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

```




## Step 8 : Configure Css Styles 
Go to `app.component.css` and add the following `css` for styling.

```css
/* Structure */
.example-container {
  position: relative;
  min-height: 200px;
}

.example-table-container {
  position: relative;
  max-height: 400px;
  overflow: auto;
}

 table {
  width: 100%;
}

.example-loading-shade {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 56px;
  right: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.example-rate-limit-reached {
  color: #980000;
  max-width: 360px;
  text-align: center;
}

/* Column Widths */
.mat-column-number,
.mat-column-state {
  max-width: 64px;
}

.mat-column-created {
  max-width: 124px;
}



/* Manthan */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #ffffff;
  background-clip: border-box;
  border: 0.0625rem solid rgba(34, 42, 66, 0.05);
  border-radius: 0.2857rem;
}
.category,
.card-category {
  text-transform: capitalize;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}
.card-category {
  font-size: 0.75rem;
}
.card {
  background: #27293d;
  border: 0;
  position: relative;
  width: 100%;
  margin-bottom: 30px;
  box-shadow: 0 1px 20px 0px rgba(0, 0, 0, 0.1);
}
.card label {
  color: rgba(255, 255, 255, 0.6);
}
.card .card-title {
  margin-bottom: .75rem;
}
.card .card-body {
  padding: 15px;
}
.card .card-body.table-full-width {
  padding-left: 0;
  padding-right: 0;
}
.card .card-body .card-title {
  color: #ffffff;
  text-transform: inherit;
  font-weight: 300;
  margin-bottom: .75rem;
}
.card .card-body .card-description,
.card .card-body .card-category {
  color: rgba(255, 255, 255, 0.6);
}
.card .card-header {
  padding: 15px 15px 0;
  border: 0;
  color: rgba(255, 255, 255, 0.8);
}
.card .card-header .card-title {
  color: #ffffff;
  font-weight: 100;
}
.card .card-header .card-category {
  color: #9A9A9A;
  margin-bottom: 5px;
  font-weight: 300;
}
.card-body {
  padding: 1.25rem;
}
.card-tasks .card-body .table {
  margin-bottom: 0;
  white-space: nowrap;
}
.card-tasks .card-body .table>thead>tr>th,
.card-tasks .card-body .table>tbody>tr>th,
.card-tasks .card-body .table>tfoot>tr>th,
.card-tasks .card-body .table>thead>tr>td,
.card-tasks .card-body .table>tbody>tr>td,
.card-tasks .card-body .table>tfoot>tr>td {
  padding-top: 10px;
  padding-bottom: 10px;
}
.table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th {
  border-color: rgba(255,255,255,.1);
  padding: 12px 7px;
  vertical-align: middle;
}

table {
  background-color: transparent;
  color: white;
}
.table>tbody>tr>td, .table>thead>tr>th, .table>tfoot>tr>th {
  color: rgba(255,255,255,.7)!important;
}
.table td, .table th {
  padding: 1rem;
  vertical-align: top;
  border-top: .0625rem solid #e3e3e3;
}
.table>thead>tr>th {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 500;
  border: 0;
}

.pupo{
 margin-top: 10px;
 color: white;
}
.pups{
  color: #9d9ea7;
  font-size: smaller;
  border-color: #980000;
  border-bottom: #980000;
}
tr.mat-sort-header-container{
  color: white;
}
tr.mat-row {
/*   border: 1px solid #e7e7e7;
  font-weight: bold; */
  color: rgba(255,255,255,.7)!important;
  height: 68px !important;
  border-color: #3c3e4f!important;
}
tr:hover.mat-row {
  background-color: rgba(0,0,0,.075) !important;
  
}
.table>tfoot>tr>th {
  font-size: 12px;
  font-weight: 500;
}
.card-tasks .table-full-width {
  /* max-height: 410px; */
  position: relative;
}
.card-tasks .card-header .title {
  margin-right: 20px;
  margin-top: 15px;
  margin-bottom: 15px;
  font-weight: 400;
}
.card p {
  color: rgba(255,255,255,.8);
  margin-bottom: 0;
}
.text-muted {
  color: #6c757d!important;
  font-weight: 300;
}
.photo {
  display: inline-block;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  vertical-align: middle;
  overflow: hidden;
}
.photo img {
  width: 100%;
}
.card-tasks .card-body i {
  color: #9A9A9A;
  font-size: 1.25em;
  transition: all .3s ease 0s;
}
.card-tasks .card-body i:hover {
  color: #ffffff;
  transition: all .3s ease 0s;
}
.form-control {
background-color: #27293d;
font-size: 1.125rem;
font-weight: 300;
color: #fff;
border: 1px solid #93949e;
margin-bottom: 1rem;
}
span.status-active i, span.status-inactive i {
font-size: .75rem !important;
padding-right: 8px;
padding-top: 0;
}
span.status-active i {
color: #2da3e0 !important;
}
span.status-inactive i {
color: #e3879e !important;
}
.card .card-footer {
  background-color: transparent;
  border: 0;
  padding: 15px;
}
mat-paginator {
  background-color: transparent;
  color: white;
}
```


## Final Output

Run the application and see its working.

![DataGrid Updated video](https://user-images.githubusercontent.com/100709775/176945677-467a14c3-28ca-42f4-8a17-8f0d6ab1ebc5.gif)


