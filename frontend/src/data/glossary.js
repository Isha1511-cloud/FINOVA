// Banking glossary (mirrors server/ai/glossary.json). Plain JS so it also loads under Node scripts.
export default [
 {
  "key": "fraud_alert",
  "term": "Fraud alert",
  "aliases": [
   "fraud alerts",
   "suspicious activity alert",
   "fraud detection"
  ],
  "def": "A notification FINOVA raises when a transaction looks unusual compared with your normal activity, for example a large payment, a new location, or many payments in a short time. An alert is a warning to review, not proof of fraud.",
  "example": "If you see a ₹45,000 payment you did not make, open the alert and choose Report. If it was you, choose Acknowledge.",
  "page": "fraud_alerts"
 },
 {
  "key": "fraud",
  "term": "Fraud",
  "aliases": [
   "scam",
   "phishing"
  ],
  "def": "Any attempt to take your money or details by deception, such as fake calls, links or messages pretending to be your bank. Banks never ask for your PIN, OTP, CVV or password.",
  "example": "A caller asking for your OTP 'to cancel a charge' is a scam. Hang up and use the official app or number.",
  "page": "fraud_alerts"
 },
 {
  "key": "account_balance",
  "term": "Account balance",
  "aliases": [
   "balance",
   "current balance",
   "ledger balance"
  ],
  "def": "The total amount of money in your account right now, including funds that may not yet be usable."
 },
 {
  "key": "available_balance",
  "term": "Available balance",
  "aliases": [
   "available funds",
   "usable balance"
  ],
  "def": "The part of your balance you can spend right now. It can be lower than the account balance when payments or cheques are pending or funds are on hold.",
  "example": "Balance ₹10,000 with a ₹2,000 hold gives an available balance of ₹8,000.",
  "page": "accounts"
 },
 {
  "key": "savings_account",
  "term": "Savings account",
  "aliases": [
   "savings"
  ],
  "def": "A deposit account for keeping money safely while earning interest. It is meant for everyday saving, not for business turnover.",
  "page": "accounts"
 },
 {
  "key": "current_account",
  "term": "Current account",
  "aliases": [
   "business account"
  ],
  "def": "An account for businesses and frequent transactions. It usually pays no interest and may need a minimum balance.",
  "page": "accounts"
 },
 {
  "key": "fixed_deposit",
  "term": "Fixed deposit",
  "aliases": [
   "fd",
   "term deposit",
   "fixed deposits"
  ],
  "def": "You lock a lump sum with the bank for a chosen period at a fixed interest rate. Withdrawing early usually costs a penalty.",
  "example": "₹1,00,000 for 1 year at 7% earns about ₹7,000 interest."
 },
 {
  "key": "recurring_deposit",
  "term": "Recurring deposit",
  "aliases": [
   "rd",
   "recurring deposits"
  ],
  "def": "You deposit a fixed amount every month for a set period and earn interest, like a fixed deposit built up in instalments."
 },
 {
  "key": "interest_rate",
  "term": "Interest rate",
  "aliases": [
   "rate of interest",
   "interest"
  ],
  "def": "The percentage a bank pays you on deposits or charges you on loans, usually stated per year."
 },
 {
  "key": "apy",
  "term": "APY",
  "aliases": [
   "annual percentage yield",
   "effective yield"
  ],
  "def": "The real yearly return on a deposit once compounding is included. It is slightly higher than the stated interest rate."
 },
 {
  "key": "compound_interest",
  "term": "Compound interest",
  "aliases": [
   "compounding"
  ],
  "def": "Interest earned on both your original money and the interest already added, so growth speeds up over time."
 },
 {
  "key": "transaction",
  "term": "Transaction",
  "aliases": [
   "transactions",
   "txn"
  ],
  "def": "Any movement of money in or out of your account, such as a purchase, transfer, deposit or fee.",
  "page": "transactions"
 },
 {
  "key": "debit",
  "term": "Debit",
  "aliases": [
   "debits",
   "debit transaction"
  ],
  "def": "Money leaving your account, such as a payment or withdrawal.",
  "page": "transactions"
 },
 {
  "key": "credit",
  "term": "Credit",
  "aliases": [
   "credits",
   "credit transaction"
  ],
  "def": "Money coming into your account, such as salary or a received transfer.",
  "page": "transactions"
 },
 {
  "key": "debit_card",
  "term": "Debit card",
  "aliases": [
   "atm card"
  ],
  "def": "A card linked to your savings or current account. Payments are taken straight from your balance."
 },
 {
  "key": "credit_card",
  "term": "Credit card",
  "aliases": [
   "credit cards"
  ],
  "def": "A card that lets you spend the bank's money up to a limit and repay later. Unpaid dues attract interest and fees."
 },
 {
  "key": "credit_limit",
  "term": "Credit limit",
  "aliases": [
   "card limit"
  ],
  "def": "The maximum amount you can spend on a credit card before repaying."
 },
 {
  "key": "credit_score",
  "term": "Credit score",
  "aliases": [
   "cibil",
   "cibil score",
   "credit rating"
  ],
  "def": "A three-digit number (in India commonly 300 to 900) that shows how reliably you repay loans and cards. Higher scores help you get loans at better rates."
 },
 {
  "key": "neft",
  "term": "NEFT",
  "aliases": [
   "national electronic funds transfer"
  ],
  "def": "A bank-to-bank transfer system that runs round the clock in batches, so money can take a short while to arrive. Suitable for most routine transfers.",
  "page": "transfer"
 },
 {
  "key": "rtgs",
  "term": "RTGS",
  "aliases": [
   "real time gross settlement"
  ],
  "def": "A system for large, urgent transfers that settle one by one in real time. It is generally meant for high values, with a minimum of ₹2 lakh.",
  "page": "transfer"
 },
 {
  "key": "imps",
  "term": "IMPS",
  "aliases": [
   "immediate payment service"
  ],
  "def": "An instant transfer service available 24x7, including holidays, using an account number and IFSC or a mobile number.",
  "page": "transfer"
 },
 {
  "key": "upi",
  "term": "UPI",
  "aliases": [
   "unified payments interface",
   "upi id",
   "vpa"
  ],
  "def": "An instant payment system where you pay or receive money using a UPI ID (like name@bank), mobile number or QR code, confirmed with your UPI PIN."
 },
 {
  "key": "upi_pin",
  "term": "UPI PIN",
  "aliases": [
   "upi pin"
  ],
  "def": "A secret 4 or 6 digit code you enter to approve a UPI payment. You enter it only to send money, never to receive money."
 },
 {
  "key": "ifsc",
  "term": "IFSC",
  "aliases": [
   "ifsc code",
   "ifs code"
  ],
  "def": "An 11-character code that identifies a bank branch, needed to send money to an account number. The first four letters are the bank, the fifth is 0, the last six are the branch.",
  "example": "SBIN0001234",
  "page": "beneficiaries"
 },
 {
  "key": "micr",
  "term": "MICR",
  "aliases": [
   "micr code"
  ],
  "def": "A 9-digit code printed on cheques that identifies the bank branch so machines can process the cheque."
 },
 {
  "key": "swift_code",
  "term": "SWIFT code",
  "aliases": [
   "swift",
   "bic"
  ],
  "def": "An 8 or 11 character code identifying a bank for international transfers."
 },
 {
  "key": "beneficiary",
  "term": "Beneficiary",
  "aliases": [
   "beneficiaries",
   "payee"
  ],
  "def": "A person or business you have saved so you can send them money. Adding a new one often has a short waiting period for security.",
  "page": "beneficiaries"
 },
 {
  "key": "remitter",
  "term": "Remitter",
  "aliases": [
   "sender"
  ],
  "def": "The person sending the money."
 },
 {
  "key": "account_number",
  "term": "Account number",
  "aliases": [
   "account no"
  ],
  "def": "The unique number of your bank account. Share it only to receive money, never together with your PIN or OTP.",
  "page": "accounts"
 },
 {
  "key": "transfer",
  "term": "Transfer",
  "aliases": [
   "fund transfer",
   "money transfer",
   "transfers"
  ],
  "def": "Moving money from your account to another account. In FINOVA the assistant can prepare a transfer, but you review and confirm it yourself.",
  "page": "transfer"
 },
 {
  "key": "transfer_limit",
  "term": "Transfer limit",
  "aliases": [
   "daily limit",
   "per transaction limit"
  ],
  "def": "The maximum amount you can send in one payment or in one day. It protects you from large losses if your account is misused.",
  "page": "transfer"
 },
 {
  "key": "transaction_fee",
  "term": "Transaction fee",
  "aliases": [
   "fee",
   "charges",
   "service charge"
  ],
  "def": "A charge a bank may apply for a service, for example some transfers. FINOVA shows a fee only when the bank provides one.",
  "page": "transfer"
 },
 {
  "key": "statement",
  "term": "Statement",
  "aliases": [
   "account statement",
   "bank statement",
   "statements"
  ],
  "def": "A record of all transactions on your account for a period, with opening and closing balance. Used as proof of income or address and for tax filing.",
  "page": "statements"
 },
 {
  "key": "opening_balance",
  "term": "Opening balance",
  "aliases": [
   "closing balance"
  ],
  "def": "The balance at the start (opening) or end (closing) of a statement period.",
  "page": "statements"
 },
 {
  "key": "overdraft",
  "term": "Overdraft",
  "aliases": [
   "overdrawn"
  ],
  "def": "Spending more than your balance. Where the bank allows it, you pay interest and sometimes a fee on the extra amount."
 },
 {
  "key": "minimum_balance",
  "term": "Minimum balance",
  "aliases": [
   "mab",
   "average monthly balance"
  ],
  "def": "The lowest balance some accounts require you to keep. Falling below it can attract a penalty."
 },
 {
  "key": "kyc",
  "term": "KYC",
  "aliases": [
   "know your customer",
   "kyc verification"
  ],
  "def": "Identity and address verification banks must do before opening an account, using documents such as Aadhaar, PAN or passport."
 },
 {
  "key": "pan",
  "term": "PAN",
  "aliases": [
   "permanent account number",
   "pan card"
  ],
  "def": "A 10-character tax ID issued by the Income Tax Department. Banks ask for it for tax reporting on larger transactions."
 },
 {
  "key": "aadhaar",
  "term": "Aadhaar",
  "aliases": [
   "aadhaar card"
  ],
  "def": "A 12-digit national identity number. Share it only with trusted institutions."
 },
 {
  "key": "otp",
  "term": "OTP",
  "aliases": [
   "one time password",
   "one-time password"
  ],
  "def": "A single-use code sent to your phone or email to confirm it is really you. Never share it with anyone, including bank staff."
 },
 {
  "key": "2fa",
  "term": "2FA",
  "aliases": [
   "two factor authentication",
   "two-factor authentication",
   "mfa"
  ],
  "def": "A second check on top of your password, such as an OTP or app approval, so a stolen password alone cannot access your account.",
  "page": "settings"
 },
 {
  "key": "cvv",
  "term": "CVV",
  "aliases": [
   "cvc",
   "card verification value"
  ],
  "def": "The 3-digit security code on a card used for online payments. Never share it."
 },
 {
  "key": "atm",
  "term": "ATM",
  "aliases": [
   "automated teller machine"
  ],
  "def": "A machine where you withdraw cash, check balance and do basic services with your debit card and PIN."
 },
 {
  "key": "net_banking",
  "term": "Net banking",
  "aliases": [
   "internet banking",
   "online banking"
  ],
  "def": "Using your bank's website or app to manage your account, pay bills and transfer money."
 },
 {
  "key": "emi",
  "term": "EMI",
  "aliases": [
   "equated monthly installment",
   "equated monthly instalment"
  ],
  "def": "A fixed amount you repay every month on a loan, made up of part principal and part interest."
 },
 {
  "key": "loan",
  "term": "Loan",
  "aliases": [
   "loans",
   "borrowing"
  ],
  "def": "Money you borrow and repay over time with interest."
 },
 {
  "key": "principal",
  "term": "Principal",
  "aliases": [
   "principal amount"
  ],
  "def": "The original amount borrowed or deposited, before interest."
 },
 {
  "key": "tenure",
  "term": "Tenure",
  "aliases": [
   "loan tenure"
  ],
  "def": "The length of time of a loan or deposit."
 },
 {
  "key": "collateral",
  "term": "Collateral",
  "aliases": [
   "secured loan"
  ],
  "def": "An asset, such as a house or gold, pledged to the lender. If you do not repay, the lender can claim it."
 },
 {
  "key": "standing_instruction",
  "term": "Standing instruction",
  "aliases": [
   "auto debit",
   "autopay"
  ],
  "def": "A fixed order you give the bank to move a set amount on a set date, for example a monthly SIP or rent."
 },
 {
  "key": "nach",
  "term": "NACH",
  "aliases": [
   "ecs",
   "mandate",
   "e-mandate"
  ],
  "def": "A system for recurring automatic debits and credits such as EMIs, premiums and subscriptions, based on a mandate you approve."
 },
 {
  "key": "cheque",
  "term": "Cheque",
  "aliases": [
   "cheques"
  ],
  "def": "A written order telling your bank to pay a named person a stated amount from your account."
 },
 {
  "key": "cheque_bounce",
  "term": "Cheque bounce",
  "aliases": [
   "dishonoured cheque",
   "bounced cheque"
  ],
  "def": "When a cheque is returned unpaid, most often because of insufficient balance. It can bring penalties and legal action."
 },
 {
  "key": "demand_draft",
  "term": "Demand draft",
  "aliases": [
   "dd",
   "bank draft"
  ],
  "def": "A prepaid instrument issued by a bank that guarantees payment to the named person."
 },
 {
  "key": "chargeback",
  "term": "Chargeback",
  "aliases": [
   "dispute",
   "disputed transaction"
  ],
  "def": "A request to reverse a card payment because it was unauthorised, faulty or not delivered."
 },
 {
  "key": "refund",
  "term": "Refund",
  "aliases": [
   "reversal"
  ],
  "def": "Money returned to your account after a cancelled or failed payment."
 },
 {
  "key": "pending_transaction",
  "term": "Pending transaction",
  "aliases": [
   "pending",
   "processing"
  ],
  "def": "A payment that has been started but not finished. It may still be completed or reversed.",
  "page": "transactions"
 },
 {
  "key": "failed_transaction",
  "term": "Failed transaction",
  "aliases": [
   "failed payment"
  ],
  "def": "A payment that did not go through. If money was deducted, it is normally returned automatically within a few working days.",
  "page": "transactions"
 },
 {
  "key": "budget",
  "term": "Budget",
  "aliases": [
   "budgets"
  ],
  "def": "A spending limit you set for a category such as food or travel over a period. FINOVA warns you as you approach it.",
  "page": "budgets"
 },
 {
  "key": "savings_goal",
  "term": "Savings goal",
  "aliases": [
   "financial goal",
   "goals",
   "financial goals"
  ],
  "def": "A target amount and date you track for something you are saving toward. In FINOVA a goal is a record only and does not move money.",
  "page": "goals"
 },
 {
  "key": "savings_rate",
  "term": "Savings rate",
  "aliases": [
   "saving rate"
  ],
  "def": "The share of your income you keep instead of spending, calculated as (income minus expenses) divided by income.",
  "page": "insights"
 },
 {
  "key": "net_cash_flow",
  "term": "Net cash flow",
  "aliases": [
   "cash flow",
   "cashflow"
  ],
  "def": "Money in minus money out over a period. Positive means you saved, negative means you spent more than you earned.",
  "page": "insights"
 },
 {
  "key": "forecast",
  "term": "Forecast",
  "aliases": [
   "projection",
   "spending forecast"
  ],
  "def": "An estimate of future balances based on your past activity. It is a projection, not a guarantee.",
  "page": "forecast"
 },
 {
  "key": "insights",
  "term": "Insights",
  "aliases": [
   "insight",
   "financial insights"
  ],
  "def": "Patterns FINOVA finds in your spending, such as trends, comparisons and category changes.",
  "page": "insights"
 },
 {
  "key": "category",
  "term": "Category",
  "aliases": [
   "categories",
   "spending category"
  ],
  "def": "A label that groups transactions, such as Food or Bills, so you can see where your money goes.",
  "page": "categories"
 },
 {
  "key": "inflation",
  "term": "Inflation",
  "aliases": [
   "price rise"
  ],
  "def": "The general rise in prices over time, which reduces what the same money can buy."
 },
 {
  "key": "mutual_fund",
  "term": "Mutual fund",
  "aliases": [
   "mutual funds"
  ],
  "def": "A pool of money from many investors managed by professionals and invested in shares, bonds or both. Returns are not guaranteed."
 },
 {
  "key": "sip",
  "term": "SIP",
  "aliases": [
   "systematic investment plan"
  ],
  "def": "Investing a fixed amount in a mutual fund at regular intervals, such as monthly."
 },
 {
  "key": "dividend",
  "term": "Dividend",
  "aliases": [
   "dividends"
  ],
  "def": "A share of a company's profit paid to its shareholders."
 },
 {
  "key": "tds",
  "term": "TDS",
  "aliases": [
   "tax deducted at source"
  ],
  "def": "Tax a bank or payer deducts before paying you, for example on interest above a limit. It is credited to your tax account."
 },
 {
  "key": "gst",
  "term": "GST",
  "aliases": [
   "goods and services tax"
  ],
  "def": "An indirect tax on most goods and services. It is added to many bank fees."
 },
 {
  "key": "notification",
  "term": "Notification",
  "aliases": [
   "notifications"
  ],
  "def": "A message from FINOVA about activity on your account, such as payments, security events or budget warnings.",
  "page": "notifications"
 },
 {
  "key": "joint_account",
  "term": "Joint account",
  "aliases": [
   "joint holder"
  ],
  "def": "An account held by two or more people who can all operate it, depending on the mandate."
 },
 {
  "key": "nominee",
  "term": "Nominee",
  "aliases": [
   "nomination"
  ],
  "def": "The person you name to receive your account money if something happens to you."
 },
 {
  "key": "dormant_account",
  "term": "Dormant account",
  "aliases": [
   "inactive account"
  ],
  "def": "An account with no customer-initiated transactions for a long period, often two years. It may need KYC to reactivate."
 },
 {
  "key": "lien",
  "term": "Lien",
  "aliases": [],
  "def": "A hold the bank places on funds, for example against a loan, so they cannot be withdrawn."
 },
 {
  "key": "biometric",
  "term": "Biometric",
  "aliases": [
   "fingerprint login",
   "face login"
  ],
  "def": "Using your fingerprint or face to sign in or approve a payment.",
  "page": "settings"
 },
 {
  "key": "encryption",
  "term": "Encryption",
  "aliases": [
   "encrypted"
  ],
  "def": "Scrambling data so only the right party can read it, which protects your information in transit and storage."
 },
 {
  "key": "session",
  "term": "Session",
  "aliases": [
   "session timeout"
  ],
  "def": "The period you stay signed in. FINOVA signs you out after inactivity to protect your account.",
  "page": "settings"
 }
];
