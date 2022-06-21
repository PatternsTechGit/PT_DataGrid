# Angular Material Data Grid


## What is Data Grid
DataGrid is used to display data in scrollable grid. It requires data source to populate data in the grid. DataGrid is a powerful html table with functionality like searching, sorting and pagination.

## What is mat-table
[Mat-Table](https://material.angular.io/components/table/overview) provides a Material Design styled data-table that can be used to display rows of data. `mat-table` contains powerful features like searching, sorting and pagination.

 
## About this exercise

Previously we scaffolded a new Angular application in which we have integrated

* Scaffolded the angular application
* FontAwesome Library for icons
* Bootstrap Library for styling buttons
* Bootstrap NavBar component
* We have multiple components e.g. (CreateAccountComponent,   ManageAccountsComponent, DepositFundsComponent, TransferFundsComponent) in our application for which we have already configured routing.
* SideNav having links which are navigating to these components.
* We developed a base structure of an api solution in Asp.net core that have just two api functions GetLast12MonthBalances & GetLast12MonthBalances/{userId} which returns data of the last 12 months total balances.
* There is an authorization service with two functions Login & Logout, The login function is setting up a hardcoded user properties (Name,Email,Roles) and storing it in local storage where as logout function is removing that user object from local storage.
* Links on the sideNav are shown or hidden based on the logged in user's role
*  We also have a toolbar that shows Logged in User's Name.



## In this exercise

 * We will implement AccountController that will return the relevant information.
 * We will implement data grid using Angular Material's mat-table in BBankUI project.
 * We will implement pagination using mat-table.
 * We will implement sorting using mat-table.
 * We will implement searching and filtering.


 Here are the steps to begin with 

# Server Side Implementation 

## Step 1 : Create Account Controller

We will create a new `AccountController` in BBankAPI project then create a new method named `GetAllAccountsPaginated` which will be calling the `AccountService` to get the accounts related information from database.
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

We will create `IAccountsService` interface under Contracts folder in Services project, which will contains on one method `GetAllAccountsPaginated`

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
            var totalCount =  _bbBankContext.Accounts.Count();
            var accounts =  _bbBankContext.Accounts.Include(x => x.User)
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

## Step 5 : Configure BBBankContext

Go to `BBBankContext` class in Infrastructure project and change the `List<Account>` Account to `IQueryable<Account>` and `List<User>` to `IQueryable<User>`, then we will create accounts and users objects with hardcode and fake values as below :

```cs
    public class BBBankContext
    {
        private string AzureADUserID = "37846734-172e-4149-8cec-6f43d1eb3f60";


        public BBBankContext()
        {

            // creating the collection for account list

            List<Account> accountsList = new List<Account>();

            // initializing a new account 

            accountsList.Add(new Account
            {
                Id = "37846734-172e-4149-8cec-6f43d1eb3f60",
                AccountNumber = "0001-1001",
                AccountTitle = "Ali Taj",
                CurrentBalance = 2055M,
                AccountStatus = AccountStatus.Active,
                UserId = "b6111852-a1e8-4757-9820-70b8c20e1ff0"

            });

            accountsList.Add(new Account
            {
                Id = "2f115781-c0d2-4f98-a70b-0bc4ed01d780",
                AccountNumber = "0002-2002",
                AccountTitle = "Salman Taj",
                CurrentBalance = 545M,
                AccountStatus = AccountStatus.Active,
                UserId = "582ebb0b-f9e0-4385-8787-37bd337f18b7"

            });

            // adding some fake accounts for fake users to support pagination
            for (int i = 3; i < 23; i++)
            {
                accountsList.Add(new Account { UserId = i.ToString(), Id = Guid.NewGuid().ToString(), AccountNumber = i.ToString() + "-xxx-xxx", AccountStatus = AccountStatus.InActive, CurrentBalance = i * 100, AccountTitle = "Fake Account " + i.ToString() });
            }

            this.Accounts = accountsList.AsQueryable();

            List<User> usersList = new List<User>();


            usersList.Add(new User
            {
                Id = "2a2615d0-1c0d-4b9c-b41b-cc01aeb35919",
                FirstName = "Raas",
                LastName = "Masood",
                Email = "admin@patternstech.com",
                ProfilePicUrl = "",
                PhoneNumber = "6096647504",

            });

            usersList.Add(new User
            {
                Id = "b6111852-a1e8-4757-9820-70b8c20e1ff0",
                FirstName = "Ali",
                LastName = "Taj",
                Email = "malitaj-dev@outlook.com",
                PhoneNumber = "1234567890",
                ProfilePicUrl = "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_crop,g_face,r_max/w_200/lady.jpg"

            });
            usersList.Add(new User
            {
                Id = "582ebb0b-f9e0-4385-8787-37bd337f18b7",
                FirstName = "Salman",
                LastName = "Taj",
                Email = "salman-dev@outlook.com",
                PhoneNumber = "0987654321",
                ProfilePicUrl = "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"

            });

            // adding some fake users in the database to support pagination
            for (int i = 3; i < 23; i++)
            {
                usersList.Add(new User { Id = i.ToString(), FirstName = "Fake", LastName = "Fake", Email = "fake@fake.com", PhoneNumber = i.ToString() + "998877665", ProfilePicUrl = "https://images.freeimages.com/images/premium/previews/1670/16703169-disgusted-lounge-singer.jpg" });
            }

            this.Users = usersList.AsQueryable();
           
        }

        public List<Transaction> Transactions { get; set; }
        public IQueryable<Account> Accounts { get; set; }
        public IQueryable<User> Users { get; set; }
    }
```

## Step 6 : Add AccountService to the container.

Go to  `program.cs` class in BBankAPI project and add the accountService reference in services container as below 

```cs
    builder.Services.AddScoped<IAccountsService, AccountService>();
```

Run the project and see its working as below :

![AccountsResult](https://user-images.githubusercontent.com/100709775/174598888-56da93c7-c914-46b3-849c-312dcc254eba.PNG)




# Client Side Implementation 
