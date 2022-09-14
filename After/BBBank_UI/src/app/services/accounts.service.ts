import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccountListsResponse } from '../models/account';

@Injectable({
  providedIn: 'root'
})
export default class AccountsService {
  constructor(private httpClient: HttpClient) { }

  getAllAccountsPaginated(pageIndex: number, pageSize: number): Observable<AccountListsResponse> {
    return this.httpClient.get<AccountListsResponse>(`${environment.apiUrlBase}Accounts/GetAllAccountsPaginated?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  }
}
