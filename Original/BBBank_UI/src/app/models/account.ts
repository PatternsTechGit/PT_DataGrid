
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
