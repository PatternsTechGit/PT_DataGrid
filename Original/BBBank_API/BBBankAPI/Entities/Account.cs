﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities
{
    public class Account : BaseEntity // Inheriting from Base Entity class
    {
        // String that uniquely identifies the account
        public string AccountNumber { get; set; }

        //Title of teh account
        public string AccountTitle { get; set; }

        //Available Balance of the account
        public decimal CurrentBalance { get; set; }

        //Account's status
        public AccountStatus AccountStatus { get; set; }
        
        [ForeignKey("UserId")]
        public string UserId { get; set; }
        // User associated with this account
        public User User { get; set; }

        // One Account might have 0 or more Transactions (1:Many relationship)
        public ICollection<Transaction> Transactions { get; set; }
    }

    // Two posible statuses of an account
    public enum AccountStatus
    {
        Active = 0,     // When an account can perform transactions
        InActive = 1    // When an account cannot perform transaction
    }
}