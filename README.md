# Angular Material Data Grid


## What is Data Grid
DataGrid is used to display data in scrollable grid. It requires data source to populate data in the grid. DataGrid is a powerful html table with functionality like searching, sorting and pagination.

## What is mat-table
[Mat-Table](https://material.angular.io/components/table/overview) provides a Material Design styled data-table that can be used to display rows of data. `mat-table` contains powerful features like searching, sorting and pagination.

 
## About this exercise

**Backend Code Base:**
Previously we developed a base structure of an api solution in asp.net core that have just two api functions GetLast12MonthBalances & GetLast12MonthBalances/{userId} which returns data of the last 12 months total balances.

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

* FontAwesome library for icons
* Bootstrap library for styling



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
