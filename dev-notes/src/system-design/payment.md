# Payment system

Design e-commerce platform.

## Background Knowledge

See [Apache Seata](https://seata.apache.org/blog/seata-at-tcc-saga/).

### Payin and Payout

When we call a third-party payment service provider to deduct money from the
buyer's credit card, the money is not directly transferred to the seller.
Instead, the money is transferred to the e-commerce website's bank account.
This process is called pay-in. Most common payin service providers include
PayPal, Square and Stripe.

When the payout condition is satisfied, such as when the products are
delivered, the seller initiates a pay-out. Only then is the money transferred
from the e-commerce website's bank account to the seller's bank account.
Tipalti is a popular payout service provider.

### Ledger

## Design Amazon

### Payment Schemas

- checkout: `buyer_id`, `checkout_id`, `payment_info`.
- order: `order_id`, `checkout_id`, `seller_id`, `amount`, `currency`. Here
  `checkout_id` is a foreign key.
- wallet: `seller_id`, `amount`, `current`.

We need the `checkout` concept because a single checkout can contain multiple
merchandises.

## Idempotent payout

"Alex Xu Vol II" talks about this in more details. Below is my rough idea. The
key is to separate the payment process in multiple stages, or put it in another
way: separate intention and execution.

1. When the user enters a payment page, we creates a `payout` object. The
   `payout` table has columns `pkid`, `semantic_key`, `status` and etc.
   `semantic_key` is a unique column, and it is the idempotent key.

   `status` can be `initialized`, `in_process`, `failed`, and `succeeded`.
   Right now, set it to `initialized`.

2. When the user hits the `confirm payment` button, change the status to
   `in_process`, and send the request to the 3rd party payment system using the
   idempotent key. Here I am assuming the 3rd party payment system support
   passing in a semantic key.

   If not, then we can assume the 3rd party payment system can support
   multi-stage payment. First, one http call to get a payment id, and then a
   second http call to pay using this payment id. If this is the case, we need
   a column `extern_payment_id` in our `payout` table. Most payment platforms
   such as stripe support this 2-stage payment method.

   If anything bad happens, we can use this `extern_payment_id` to check if the
   payment went through or not.

3. Mark the `payout` record `succeeded` or `failed`.

After I paste above content to chatgpt. It gives me a few suggestions.

1. The transition to `in_process` must be atomic. We can do it by
   `select ... for update` or use below `test-and-set` style.

   ```sql
   update payout set stats = 'in_process' where status = `initialized`
   ```

## Design Digit Wallet

Use cases:

- Balance transfer between two wallets.
-
