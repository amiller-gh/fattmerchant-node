FORMAT: 1A
HOST: https://apiprod.fattlabs.com/

# Fattmerchant Omni API

Fattmerchant's Omni API is a RESTful API allowing integration with the Fattmerchant platform
for making one-time and recurring payments, invoicing, and managing customers. This guide has code samples that can
be generated in the language of your choice. Omni API supports tokenization, online transactions, as well 
as our line of physical credit card terminals (see terminals resource at bottom).

Please carefully digest the information at the top of this documentation.

## Current Status

Please check our api status and subscribe to updates and scheduled maintenance here:

[https://status.paywithomni.com/](https://status.paywithomni.com/)

## Sandbox Vs Live Account

For a free sandbox please use our [api sandbox signup form](https://fattmerchant.com/omni-sandbox-signup/) which will yield a sandbox for you with an api key.

_Note: this will also add your email into our marketing funnel. (You can opt out later)_

This account will then be listed in your merchant switcher in the upper right hand corner within [Omni](https://omni.fattmerchant.com).

Find the [api key here](https://omni.fattmerchant.com/#/apps/apikeys/recvPQ4yrUbXEMu1B) (omni -> apps -> Api Keys)

For api access, when using a live or sandbox api key, you'll still use the same production URL: `https://apiprod.fattlabs.com/`
The only difference will be that your sandbox will be linked to a test gateway and will not use real money.

There are specific card numbers you can use when on a sandbox account - documented in the <a href="#reference/0/payment-methods">payment methods resource</a>. 

### Go Live

Pre Req: You have a live account from [signup/registration](https://fattmerchant.com/signupnow/) and onboarding/underwriting is complete.
Alternatively to signup, you can log into your sandbox and in the upper right hand corner use the "Add Location" button in the merchant switcher to begin the sign up process.

To go live, you'll simply begin using an api key corresponding to your production account with the live gateway. The same applies for using a webpayments token - if using Fattmerchant.js

## Quickstart

[**ARTICLE: Getting started with Fattmerchant API**](https://fattmerchant.zendesk.com/hc/en-us/articles/360009746834-Developers-Getting-started-with-Fattmerchant-API)

Accepting payments through Fattmerchant is a two step process.
* Creating a tokenized payment method through `fattmerchant.js` or one of our mobile SDKs
* Processing a payment using the tokenized payment method

Tokenization is required as it ensures that your website doesn't directly touch credit card numbers and that your application or website
remains PCI compliant. In this example we will be processing a website payment using `fattmerchant.js` and the Fattmerchant API.

In this example, we'll go over explaining how to create a shopping cart using `fattmerchant.js` and the Fattmerchant API to store
and charge multiple payment methods.

_When using our Mobile SDK, the process is for creating and charging payment methods is very similar. Please read our Mobile SDK docs for more details_

### Getting a Tokenized Payment Method
In order to create a payment method through `fattmerchant.js` you must use a website payments token. You can view your website payments token by going to
the [Omni apps page](https://omni.fattmerchant.com/#/apps) and clicking on the "Website Payments" app.  At the bottom of the page is your
web payments token. This allows our API to link
payment methods tokenized by `fattmerchant.js` to your Fattmerchant Omni account.

**NOTE**:`fattmerchant.js` will always return a *new* tokenized payment method.

To add `fattmerchant.js` to your website. Add this script tag to your website:
```html
<script src="https://fattjs.fattpay.com/js/fattmerchant.js"></script>
```

And to initialize `fattmerchant.js` you can use the following code:
```javascript
var fattjs = new FattJs("YOUR_WEBPAYMENTS_TOKEN", {
  number: {
    id: "card-num-id",          // HTML div for containing the card number
    placeholder: "Card Number", // The placeholder for the div
    style: "MY CSS STYLE"       // The CSS styling to apply to the card number div
  },
  cvv: {
    id: "cvv-id",         // The HTML div for the cvv
    placeholder: "CVV",   // The placeholder for the div
    style: "MY CSS STYLE" // The CSS styling to apply to the cvvdiv
  }
});
```

Once you have `fattmerchant.js` setup to use your webpayments token, you can use start using it to
tokenize payment methods. This allows you to save cards securely without your code passing card information
directly.

For our shopping cart we want to save multiple credit cards for customers. If a customer adds a card, we can store cards
using the `fattjs.tokenize()` function. After tokenizing the data, we can save the `id` from the result to our customer's
profile.

```javascript
var customer = {
  firstname: "Benji",
  lastname: "Man",
  month: "12",
  year: "2020",
  address_state: "FL"
};

fattjs
  .tokenize(customerDetails)
  .then(function (result) {
    // Success
    console.log(result.id); // Payment Method ID that we can attach to Customer's profile
  })
  .catch(function (err) {
    // Failure
  });
```

Now our customer has a PCI compliant card stored! You can take `result.id` in the above example and store it in your own database
safely and allow us to handle security.

#### One time pay
You can also use `fattmerchant.js` to take one time payments easily as well. Instead of using the `.tokenize()` function, you can
use the `.pay()` function. This will instantly tokenize and charge the new payment method in one function rather than two. This is
recommended for one time payments or if you are not using our API to charge customers. For more details, please see the documentation
on `fattmerchant.js` on the sidebar.

### Charging a Tokenized Payment Method
Before we can charge a Tokenized Payment Method let's setup our API Key. To create an API Key, go to the
[Omni apps page](https://omni.fattmerchant.com/#/apps) and go to the API Key section. To use an API Key, make an API
request with an authorization header like so: `Authorization: Bearer YOUR_API_KEY`.

For more details on our API, you can use the sidebar to navigate through our available API resources.

Now our API Keys have been setup and our customer is ready to checkout. They have a total of exactly $100.00 (how convenient!).
To charge a card, we can just make a request to `POST /charge`.

For our shopping cart customer, our request body will look something like this:
```json
{
  "payment_method_id": "VALUE_FROM_RESULT_ID",
  "total": 100.00,
  "meta": {
    "tax": 0, 
  }
}
```

And your customer is now charged $100.00 for their order. For more information and details please see the sidebar items for more in-depth
documentation and resources.


## Throttling - Rate Limiting

All api routes are throttled to 150 requests per minute per IP.

You are only allowed 10 failed transactions per minute.

Fattmerchant.js routes are different. When you call the `.pay()` or the `.tokenize()` method, Fattmerchant.js hits the Fattmerchant API with the defined Webpayments token. This resource is throttled to 10 requests per minute per IP.

**Note** _if you need to process a higher number of requests, please reach out to us to have your IP whitelisted_

## Verification Checks

### Address Verification (AVS)

AVS checks are used to verify that the address information provided matches the billing address on file with the card issuer. 
There are different levels and combinations of AVS:

- Based on zip code
- Based on the street address

Whether you use Fattmerchant.js or a direct POST to create a payment method and based on your preferred AVS configuration, you need to pass in the appropriate address fields: `address_zip` and/or `address_1`

If you wish to add AVS support to your live account or for more information, please reach out to your account manager. 

**NOTE:** AVS checks can only be tested on a live account.


## Fattmerchant.js

If you need to tokenize payment methods like credit cards or bank account and routing numbers from a customer's browser, then Fattmerchant.js is what you want. Every time you use Fattmerchant.js to tokenize a payment method or make a one time payment, a new payment method is generated and stored on a customer.

Fattmerchant.js is a Javascript library that allows you to easily take payments using our API while staying PCI compliant.

Fattmerchant.js works by safely embedding a credit card field iframe within your existing payment form. This approach alleviates you of the burden of PCI compliance since the credit card number never once touches your website.

Fattmerchant.js relies on your public Webpayments token [which can be found here.](https://omni.fattmerchant.com/#/apps/webpayments/recekTHUNxwvdlN9G)

* [Javascript Credit Card Example on Codepen](https://codepen.io/FattLabs/pen/XqwONK/)
    * Shows Basic Tokenization and Paying with a Card
    * Creates a customer and payment_method record also with a Card
* [Javascript ACH(Bank) Example on Codepen](https://codepen.io/FattLabs/pen/OKWGaX/)
    * Shows Basic Tokenization and Paying with ACH
    * Creates a customer and payment_method record also with a Bank
* [React.Js Example on Codepen](https://codepen.io/FattLabs/pen/YLbbBJ)
    * Shows Basic Tokenization and Paying
    * Creates a customer and payment_method record also
* [Travel Agency Demo w/ React.Js](https://codepen.io/FattLabs/full/MBMGLV/)
    * shows using Fattmerchant.js AND normal API access
    * [example backend is on Runkit](https://runkit.com/lasergoat/myviptoursitems).

### Adding Fattmerchant.js To Your Site

Adding `fattmerchant.js` to your website is easy! Firstly, just add the script to your index.html:

```html
<head>
  <script src="https://fattjs.fattpay.com/js/fattmerchant.js"></script>
</head>
```

Now that Fattmerchant.js has been added to your project, we need to initialize it -- preferably in the same file as your payment form.

Initialize your `fattjs` instance with the `FattJs` class, like in the examples below.

**NOTE:** _You will use your Webpayments token(public key) here to set up the SDK. This is different than the api key(secret key) that you will use if you plan to process payments from server-side. For more details on server-side, please see the documentation on `Process payments from server-side with api key` on the sidebar._

**Javascript:**

```javascript
// making our instance of fattjs
var fattjs = new FattJs( "YOUR_WEBPAYMENTS_TOKEN" , {
  // attributes for the credit card number field
  number: {
    // the html id of the div you want to contain the credit card number field
    id: 'card-number',
    // the placeholder the field should contain
    placeholder: '0000 0000 0000 0000',
    // the style to apply to the field
    style: 'height: 30px; width: 100%; font-size: 15px;'
  },
  // attributes for the cvv field
  cvv: {
    // the html id of the div you want to contain the cvv field
    id: 'card-cvv',
    // the placeholder the field should contain
    placeholder: 'CVV',
    // the style to apply to the field
    style: 'height: 30px; width: 100%; font-size: 15px;'
  }
});
```

And then, in your payment form, make some fields with the id's you specified while making your instance of FattJs. Let's throw in a pay button while we're at it!

**Javascript:**

```html
<form onsubmit="return false;">
  <div id="card-number" style="width:200px; height:30px;"></div>
  <div id="card-cvv" style="width:50px; height:30px;"></div>

  <button id="paybutton">
    Pay
  </button>
</form>
```

### Loading the Credit Card Fields

Now that we've initialized our instance of FattJs and made the elements that will contain the credit card fields, we can tell FattJs to load in those credit card fields.

The `showCardForm` function returns a Promise which lets us handle the completion of the credit card fields loading in.

**Javascript:**

```javascript
fattJs
  .showCardForm()
  .then(handler => {
    console.log('form was loaded');
    // for quick testing, you can set a test number and test cvv here
    // handler.setTestPan("4111111111111111");
    // handler.setTestCvv("123");
  })
  .catch(err => {
    console.log('there was an error loading the form: ', err);
  });
```

### Handling Form Completion

Success! We have the fields in our form -- but the customer has just filled in their info, and still can't submit the form! What gives?

Luckily for you, we've thought of that! We've included some handy handlers to help you handle the validity of the fields.

Firstly, we'll handle the `card_form_uncomplete` event, which means that the input within the fields isn't valid (yet!).

**Javascript:**

```javascript
merchant.on('card_form_uncomplete', (message) => {
  // the customer hasn't quite finished filling in the fields
  // or the input in the fields are invalid
  console.log(message);
  // activate pay button
  var payButton = document.querySelector('#paybutton');
  payButton.disabled = true;
});
```

Next, we'll handle the `card_form_complete` event, which means that the input within the fields is complete and valid.

**Javascript:**

```javascript
merchant.on('card_form_complete', (message) => {
  // the customer has finished filling in the fields, and they're valid!
  // Nice!
  console.log(message);
  // activate pay button
  var payButton = document.querySelector('#paybutton');
  payButton.disabled = false;
});
```

### Paying (via Card)

Alright, now we're ready to finish up this transaction. Let's handle when the user presses that Pay button we made earlier.

**NOTE**: The .pay() method will always return a *new* tokenized payment method along with the payment

**Javascript:**

```javascript 
document.querySelector('#paybutton').onclick = () => {
  // extra details to be saved into this transaction
  var extraDetails = {
    total: 10, // $10.00
    firstname: "David", // customer first name
    lastname: "Johnson", // customer last name
    company: "", // customer company
    email: "", // customer email - receipt will be sent automatically
    month: "10", // credit card expiration month
    year: "2020", // credit card expiration year
    phone: "5555555555", // customer phone number
    address_1: "100 S Orange Ave", // customer address line 1. This is also stored on the payment_method for AVS
    address_2: "Suite 400", // customer address line 2
    address_city: "Orlando", // customer address city
    address_state: "FL", // customer address state
    address_zip: "32811", // customer address zip. This is also stored on the payment_method for AVS
    address_country: "USA", // customer address country (alpha-3 country code)
    customer_id: "CUSTOMER_ID_HERE", // OPTIONAL customer_id - 
    // please pass this if you have previously created a customer (using POST customer) and don't want
    // to create a new customer OR match an existing customer. Passing this will disregard the other 
    // customer fields such as firstname, lastname, phone, all address fields etc. 
    // In this case address_zip will still be stored on the payment method though
    url: "https://omni.fattmerchant.com/#/bill/", // url -- just keep this as is unless you're testing
    // send_receipt determines whether or not to immediately send a receipt
    // it is optional and defaults to true
    send_receipt: true,
    // validate is optional and can be true or false. 
    // determines whether or not fattmerchant.js does client-side validation.
    // the validation follows the sames rules as the api.
    // check the Validation section for more details.
    validate: false,
    // meta is optional and each field within it is optional
    meta: {
      reference: 'invoice-reference-num',// optional - will show up in emailed receipts
      memo: 'notes about this transaction',// optional - will show up in emailed receipts
      otherField1: 'other-value-1', // optional - we don't care
      otherField2: 'other-value-2', // optional - we don't care
      subtotal: 1, // optional - will show up in emailed receipts
      tax: 0, // optional - will show up in emailed receipts
      lineItems: [ // optional - will show up in emailed receipts
        {
            "id": "optional-fm-catalog-item-id"
            "item":"Demo Item",
            "details":"this is a regular demo item",
            "quantity":10,
            "price": .1
        }
      ]
    }
  };

  // call pay api
  fattjs
    .pay(extraDetails)
    .then((completedTransaction) => {
      // completedTransaction is the successful transaction record
      console.log('successful payment:', completedTransaction);
    })
    .catch(err => {
      // handle errors here
      console.log('unsuccessful payment:', err);
    });
}
```

### Paying (via Bank)

If your account supports ACH, you can also process payments using bank accounts, like so:

**NOTE**: The .pay() method will always return a *new* tokenized payment method along with the payment

**Javascript:**

```javascript 
document.querySelector('#paybutton').onclick = () => {
  // extra details to be saved into this transaction
  var extraDetails = {
    /* Start Bank Details */
    method: "bank", // very important to set this as "bank" for ACH payments
    bank_name: "Chase", // bank name, e.g. "Chase"
    bank_account: "BANK_ACCOUNT_NUMBER_HERE", // bank account number
    bank_routing: "BANK_ROUTING_NUMBER_HERE", // bank routing number
    bank_type: "checking", // "checking" or "savings"
    bank_holder_type: "personal" // "personal" or "business"
    /* End Bank Details */
  
    total: 10, // $10.00
    firstname: "David", // customer first name
    lastname: "Johnson", // customer last name
    company: "", // customer company
    email: "", // customer email - receipt will be sent automatically
    month: "10", // credit card expiration month
    year: "2020", // credit card expiration year
    phone: "5555555555", // customer phone number
    address_1: "100 S Orange Ave", // customer address line 1. This is also stored on the payment_method for AVS
    address_2: "Suite 400", // customer address line 2
    address_city: "Orlando", // customer address city
    address_state: "FL", // customer address state
    address_zip: "32811", // customer address zip. This is also stored on the payment_method for AVS
    address_country: "USA", // customer address country (alpha-3 country code)
    customer_id: "CUSTOMER_ID_HERE", // OPTIONAL customer_id - 
    // please pass this if you have previously created a customer (using POST customer) and don't want
    // to create a new customer OR match an existing customer. Passing this will disregard the other 
    // customer fields such as firstname, lastname, phone, all address fields etc. 
    url: "https://omni.fattmerchant.com/#/bill/", // url -- just keep this as is unless you're testing
    // send_receipt determines whether or not to immediately send a receipt
    // it is optional and defaults to true
    send_receipt: true,
    // validate is optional and can be true or false. 
    // determines whether or not fattmerchant.js does client-side validation.
    // the validation follows the sames rules as the api.
    // check the Validation section for more details.
    validate: false,
    // meta is optional and each field within it is optional
    meta: {
      reference: 'invoice-reference-num',// optional - will show up in emailed receipts
      memo: 'notes about this transaction',// optional - will show up in emailed receipts
      otherField1: 'other-value-1', // optional - we don't care
      otherField2: 'other-value-2', // optional - we don't care
      subtotal: 1, // optional - will show up in emailed receipts
      tax: 0, // optional - will show up in emailed receipts
      lineItems: [ // optional - will show up in emailed receipts
        {
            "id": "optional-fm-catalog-item-id"
            "item":"Demo Item",
            "details":"this is a regular demo item",
            "quantity":10,
            "price": .1
        }
      ]
    }
  };

  // call pay api
  fattjs
    .pay(extraDetails)
    .then((completedTransaction) => {
      // completedTransaction is the successful transaction record
      console.log('successful payment:', completedTransaction);
    })
    .catch(err => {
      // handle errors here
      console.log('unsuccessful payment:', err);
    });
}
```

### Tokenizing (Card)

Alternatively, instead of having our customer pay us right away, we can **Tokenize** their payment information for future payments.

**NOTE**: The .tokenize() method will always return a *new* tokenized payment method.

**Javascript:**

```javascript 
document.querySelector('#tokenizebutton').onclick = () => {
  // extra details to be saved into this transaction
  var extraDetails = {
    firstname: "David", // customer first name
    lastname: "Johnson", // customer last name
    month: "10", // credit card expiration month
    year: "2020", // credit card expiration year
    phone: "5555555555", // customer phone number
    address_1: "100 S Orange Ave", // customer address line 1. This is also stored on the payment_method for AVS
    address_2: "Suite 400", // customer address line 2
    address_city: "Orlando", // customer address city
    address_state: "FL", // customer address state
    address_zip: "32811", // customer address zip. This is also stored on the payment_method for AVS
    address_country: "USA", // customer address country (alpha-3 country code)
    customer_id: "CUSTOMER_ID_HERE", // OPTIONAL customer_id - 
    // please pass this if you have previously created a customer (using POST customer) and don't want
    // to create a new customer OR match an existing customer. Passing this will disregard the other 
    // customer fields such as firstname, lastname, phone, all address fields etc. 
    // In this case address_zip will still be stored on the payment method though
    url: "https://omni.fattmerchant.com/#/bill/" // url -- just keep this as is unless you're testing
    // validate is optional and can be true or false. 
    // determines whether or not fattmerchant.js does client-side validation.
    // the validation follows the sames rules as the api.
    // check the Validation section for more details.
    validate: false,
  };

  // call pay api
  fattjs
    .tokenize(extraDetails)
    .then((tokenizedPaymentMethod) => {
      // tokenizedPaymentMethod is the tokenized payment record
      console.log('successful tokenization:', tokenizedPaymentMethod);
    })
    .catch(err => {
      // handle errors here
      console.log('unsuccessful tokenization:', err);
    });
}
```

### Tokenizing (Bank Account)

If your account supports ACH, you can also tokenize bank accounts, like so:

**NOTE**: The .tokenize() method will always return a *new* tokenized payment method.

**Javascript:**

```javascript 
document.querySelector('#tokenizebutton').onclick = () => {
  // extra details to be saved into this transaction
  var extraDetails = {
    /* Start Bank Details */
    method: "bank", // very important to set this as "bank" for ACH payments
    bank_name: "Chase", // bank name, e.g. "Chase"
    bank_account: "BANK_ACCOUNT_NUMBER_HERE", // bank account number
    bank_routing: "BANK_ROUTING_NUMBER_HERE", // bank routing number
    bank_type: "checking", // "checking" or "savings"
    bank_holder_type: "personal" // "personal" or "business"
    /* End Bank Details */
  
    firstname: "David", // customer first name
    lastname: "Johnson", // customer last name
    month: "10", // credit card expiration month
    year: "2020", // credit card expiration year
    phone: "5555555555", // customer phone number
    address_1: "100 S Orange Ave", // customer address line 1. This is also stored on the payment_method for AVS
    address_2: "Suite 400", // customer address line 2
    address_city: "Orlando", // customer address city
    address_state: "FL", // customer address state
    address_zip: "32811", // customer address zip. This is also stored on the payment_method for AVS
    address_country: "USA", // customer address country (alpha-3 country code)
    customer_id: "CUSTOMER_ID_HERE", // OPTIONAL customer_id - 
    // please pass this if you have previously created a customer (using POST customer) and don't want
    // to create a new customer OR match an existing customer. Passing this will disregard the other 
    // customer fields such as firstname, lastname, phone, all address fields etc. 
    // In this case address_zip will still be stored on the payment method though
    url: "https://omni.fattmerchant.com/#/bill/" // url -- just keep this as is unless you're testing
    // validate is optional and can be true or false. 
    // determines whether or not fattmerchant.js does client-side validation.
    // the validation follows the sames rules as the api.
    // check the Validation section for more details.
    validate: false,
  };

  // call pay api
  fattjs
    .tokenize(extraDetails)
    .then((tokenizedPaymentMethod) => {
      // tokenizedPaymentMethod is the tokenized payment record
      console.log('successful tokenization:', tokenizedPaymentMethod);
    })
    .catch(err => {
      // handle errors here
      console.log('unsuccessful tokenization:', err);
    });
}
```

### Validation

If the `validate` flag is passed into the `tokenize` or `pay` methods, FattJs will attempt to validate the details with the following rules:

- `method` - required, must be 'bank' or 'card'
- `firstname` - required if customer_id is not passed into details, max of 50 characters
- `lastname` - required if customer_id is not passed into details, max of 50 characters
- `phone` - required if customer_id is not passed into details, must be at least 10 characters
- `email` - not required, must be a valid email
- `address_1`: required if customer_id is not passed into details, max of 255 characters
- `address_2`: not required, max of 255 characters
- `address_city`: required if customer_id is not passed into details, max of 255 characters
- `address_state`: required if customer_id is not passed into details, max of 2 characters (e.g. FL)
- `card_exp`: required if method === 'card',
- `bank_account`: required if method === 'bank'
- `bank_routing`: required if method === 'bank'
- `bank_type`: required if method === 'bank', must be 'checking' or 'savings'
- `bank_holder_type`: required if method === 'bank', must be 'personal' or 'business'
- `total`: not required, must be a number 
- `customer_id`: not required, must be a string matching a valid customer_id which belongs to your merchant account. If supplied, a new customer will not be created or matched based on values. Instead, the supplied ID will be assigned this new payment method (and transaciton if using .pay())


### Fattmerchant.JS Important Notes

#### Trigger a Success/Failure

Do you want to trigger a success or failure in your Sandbox account? If so, please see the [table of test cards and bank accounts in the payment methods section](#reference/0/payment-methods).

#### Throttling

Fattmerchant.js routes are different. When you call the `.pay()` or the `.tokenize()` method, Fattmerchant.js hits the Fattmerchant API with the defined Webpayments token. This resource is throttled to 10 requests per minute per IP.

#### Status Column

The `.pay()` returns an `Invoice` object with a status of either `PAID` or `ATTEMPTED` depending on whether the charge was successful. Please learn more about statuses in the <a href="#reference/0/invoices">Invoice section below</a>.

#### Automated Receipt

This method will automatically send a receipt to the email provided (which is the customer's email). This receipt will also show whether the chage was a success or a fail.

#### Customer Matching

When you use `.tokenize()` OR `.pay()` the API will attempt to find matching customer information according to these groups of demographics:

- customer_id
- email
- company, address_1, address_city
- firstname, phone
- firstname, lastname, address_1, address_zip
- lastname, phone

A match is found when each field exists is passed and an exact match is found. For example: Bob Smith at 123 North Way 32801 would not match to Bobby Smith at 123 Noth. Way 32801
If a match is found based on the provided demographics, the existing customer will be linked to the new payment method and transaction and any additional demographics will not be stored.

For example: if a Match is found for Bob.Smith@test.com but you also passed data like Address Line 1 and the existing Bob Smith didn't have an address, then the new address will not be saved.

If the matched customer has an email, that email address will receive the receipt. 

**to disable matching** pass `match_customer: false` (as boolean false) with the rest of the fields when calling `.pay() _or_ `.tokenize()`

#### Using an existing `customer_id`

You are welcome to create a customer first using [`POST customer`](https://fattmerchant.docs.apiary.io/#reference/0/customers/create-customer) and then use the resuling `customer_id` in your Fattmerchant.js integration. 

Both `.pay()` and `.tokenize()` accept a `customer_id`. When this value is passed, the customer will not be created, but instead the existing customer with the specified id will be used for the new payment method (and invoice, payment if using .pay())

This also provides you with the ability to implement your own customer matching and then specify the exact id.

#### Use a Billing Address

The address fields available in Fattmerchant.js are stored on the customer and not sent to the payment gateway. There is no way to add a billing address with Fattmerchant.js alone. However, once you have the `payment_method_id` you can do a [PUT payment-method](https://fattmerchant.docs.apiary.io/#reference/0/payment-methods/update-a-payment-method) call to add a billing address using your api key.

Please see the [PUT payment-method](https://fattmerchant.docs.apiary.io/#reference/0/payment-methods/update-a-payment-method) for detailed information.

Billing addresses are sent along with the payment if supplied.

## Process payments from server-side with api key.

Before you can successfully run a charge from a server-side call you need to generate an API key from the [fattmerchant api keys page](https://omni.fattmerchant.com/#/apps/apikeys).

Then, create a customer using `POST /customer` to yield a `customer_id`. Next, you'll need to create a payment method using [Fattmerchant.js](https://fattmerchant.docs.apiary.io/#introduction/fattmerchant.js) `.tokenize()`
This will give you the `payment_method_id` to be used within the charge. 

With these two resources, you'll have all the requirements to run a transaction using `POST /charge`.

In summary, to run a charge, you'll need to implement the following resources:

* [POST customer](https://fattmerchant.docs.apiary.io/#reference/0/customers/create-customer) -> `customer id` (just called `id` in the response)
* [Fattmerchant.js::tokenize()](https://fattmerchant.docs.apiary.io/#introduction/fattmerchant.js/tokenizing-(card)) -> `payment_method_id` (just called `id` in the response)
* [POST charge](https://fattmerchant.docs.apiary.io/#reference/0/charge/charge-a-payment-method) -> `transaction_id` (just called `id` in the response)

To see a list of all transactions, you'll need to call `GET transaction` which will return any and all transactions regardless of type including `charge`, `void`, `refund` and `credit`.

To run a refund, please see the [`POST transaction/id/refund`](https://fattmerchant.docs.apiary.io/#reference/0/transactions/refund-transaction).

NOTE: _If you don't want to run one-off charges, but would rather implement invoicing, you'll use the [`POST invoice` resource](https://fattmerchant.docs.apiary.io/#reference/0/invoices/create-an-invoice)._

### Pre Authorizations

**Most users DO NOT need to implement PRE AUTHORIZATIONS.** The POST charge resource (and POST invoice/id/pay) will AUTOMAGICALLY run a pre auth and capture simultaneously.

This is mostly beneficial for use cases where the final amount could change OVER TIME. Eg. a hotel where the final amount is captured on checkout.
th
To create a pre-auth you will use the [POST charge](https://fattmerchant.docs.apiary.io/#reference/0/charge/charge-a-payment-method) as described above in the section titled "Process payments from server-side with api key."

This route allows a flag `pre_auth` = true (boolean literal value). When `pre_auth` is set to true, the card will be authorized for the total amount supplied, but not captured.

If you are creating and paying [invoice records with POST invoice](https://fattmerchant.docs.apiary.io/#reference/0/invoices/create-an-invoice) you will still use the [POST charge](https://fattmerchant.docs.apiary.io/#reference/0/charge/charge-a-payment-method) resource but pass in your `invoice_id`.

[POST charge](https://fattmerchant.docs.apiary.io/#reference/0/charge/charge-a-payment-method) is the only way to create pre auths. After the pre_auth exists, you can [capture](https://fattmerchant.docs.apiary.io/#reference/0/transactions/capture-a-transaction) or [void](https://fattmerchant.docs.apiary.io/#reference/0/transactions/void-transaction) it using the `transaction_id`.

Another option is the [POST verify](https://fattmerchant.docs.apiary.io/#reference/0/charge/verify-a-payment-method) route (most people should NOT use this route). The verify route performs a pre-auth, and then a void and *does not accept an `invoice_id`*. So the resulting transaction cannot be captured.

_keywords for searching: pre auth, pre authorization, preauth, preauthorization_

### Capture a Pre-Auth Transaction

To capture an existing `pre_auth` transaction (created with POST charge with `pre_auth`=`true`) please use [/transaction/{id}/capture](https://fattmerchant.docs.apiary.io/#reference/0/transactions/capture-a-transaction)
This route is in the transactions collection but linked here for your convenience.

### Refund a Transaction

For refunding OR voiding an existing transaction please use [transaction/{id}/void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/transactions/void-or-refund-transaction).
This route is in the transactions collection but linked here for your convenience.

For terminal transactions please use the terminals resource [POST terminals/void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/terminals/void-or-refund-(omni-picks-for-you))

### Void a Transaction

For refunding OR voiding an existing transaction please use [transaction/{id}/void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/transactions/void-or-refund-transaction).
This route is in the transactions collection but linked here for your convenience.

For terminal transactions please use the terminals resource [POST terminals/void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/terminals/void-or-refund-(omni-picks-for-you))

### Run a Credit Transaction

For creating a credit transaction please use [/credit](https://fattmerchant.docs.apiary.io/#reference/0/credit/credit-a-payment-method).

For terminal Credit transactions please use the terminals resource [POST terminals/credit](https://fattmerchant.docs.apiary.io/#reference/0/terminals/credit)


## Mobile SDKs

Fattmerchant's Mobile SDKs are available for Android and iOS. The SDKs work similarly to `fattmerchant.js` where they securely tokenize
credit card information to maintain PCI compliance for your mobile app. Our mobile specific documentation can be found here:

* [iOS SDK Documentation](https://fattmerchantorg.github.io/Fattmerchant-iOS-SDK/)
* [Android SDK Documentation](https://fattmerchantorg.github.io/fattmerchant-android-sdk/)

For hardware integrations, Dejavoo terminals are our preferred card reader solutions. For more options specific to mobile (such as small bluetooth
readers), you can reach out to your account manager.

## Onboarding Sub-Merchants

Fattmerchant makes it easy to register sub-merchants if you are an ISV or developer. For ISVs or brand partners, please use [our official partnership channel here](https://fattmerchant.com/partners/).
An ISV partner gets to use Omni Connect which allows you to fully support your merchants operationally.

**Creating a sub-merchant account**
- Create the merchant with [POST merchant](https://fattmerchant.docs.apiary.io/#reference/0/teams/create-a-merchant) and your jwt token

- Then, upsert the merchant's registration: [PUT merchant/{id}/registration](https://fattmerchant.docs.apiary.io/#reference/0/teams/update-merchant-registration-data) 
    - This adds additional business information used in underwriting

- To add supporting documents to the merchant's registration(optional): [POST merchant/{id}/registration/file](https://fattmerchant.docs.apiary.io/#reference/0/teams/add-file-to-merchant-registration)
    - This adds supporting documents to the merchant's registration which help facilitate the underwriting process.
    
    **Examples**: Voided checks, past processing statements, additional requested documents

**Generating an API key**
- Create a permanent api key for this merchant with [POST merchant/{id}/apikey](https://fattmerchant.docs.apiary.io/#reference/0/teams/create-a-new-api-key-for-merchant)
    - This key will allow your sub-merchants to process payments using your solution.
    - This private key must be kept secure

## Troubleshooting
_These are some common issues that you may run into while setting up an integration with Fattmerchant.js_

**Invalid Credentials / Token not provided Error Message**

Confirm that your headers are set up correctly. Ensure there are no brackets or quotes around your api key. 
`Authorization: Bearer insert_api_key_here`
Make sure that you are using the correct API Key (Sandbox vs Live Account)

**Not seeing your Invoice or Customer?**

Check to see that your token has the correct merchant associated. Visit [jwt.io](https://jwt.io) and paste your token in the Debugger. You can view the merchant in the **Decoded** Payload section.



## Frequently Asked Questions

**Do I need to change the URL when I change from my Sandbox account to Production?**

No. The URL will always be `https://apiprod.fattlabs.com`  whether in Testing or Production.

**What is the difference between the webpayments token and api keys?**

In Fattmerchant.js, the webpayments token is a public key that is used to enable your account to accept payments only. The api key is a secret key that allows you to hit all API routes (ex. charges, refunds, voids)

**Since the webpayments token is public, does that pose any security risk to me?**

No. Using your web payments token enables your account to accept payments, but never transactions issued on your behalf that would result in funds coming out of your account. All secure information goes through Fattmerchant.js so that no sensitive information is ever stored or exposed, keeping you PCI compliant.

**Does Fattmerchant.js support using multiple credit cards for a split transaction?**

Yes, but each credit card will have to be tokenized one at a time. You can then set up partial payments using those tokenized payment methods. 

**Can I save any information from the form that is generated with an instance of FattJs?**

No. In order to stay PCI compliant, FattJs utilizes an iFrame which will not allow you to pull out any of the values that are entered in the form.

## Authentication Tokens [/ephemeral]

Ephemeral tokens are used in conjunction with our mobile SDKs

### Generate an Ephemeral Token [GET /ephemeral]


**NOTE: This route assumes you have generated an api key within your production OR sandbox OMNI account.**

Passing this api key as your Bearer token (Authorization header), this route will exchange your permanent api key with a short lived ephemeral token to be used for subsequent calls. This route is especially useful for passing the short lived token to a mobile client if you are storing the real api key on your server. 

You should never expose an api key to a browser or client.

+ Request (application/json)

    **Headers**
     
    * `Authorization` (required, string) "Bearer token" (without the quotes)
    
    This method requires no body or url query parameters.
    The resulting ephemeral token lasts 24-hours before the user has to re-authenticate.
    The result is a JSON object containing one key `token`.

    + Headers
 
            Accept: application/json
            Authorization: Bearer token


+ Response 200 (application/json)

        {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudCI6IjI3ZmFkNWU0LTAyMTAtNGM5MS05NTk2LTQxN2IwZWEwZGJiMSIsInN1YiI6IjZiNWUwMzM3LTgxN2QtNDAyNS04NzI5LTYzNzAxNzMyOTVhOSIsImlzcyI6Imh0dHBzOlwvXC9hcGlkZXYwMS5mYXR0bGFicy5jb21cL2F1dGhlbnRpY2F0ZSIsImlhdCI6MTQ2Mjk4NzI0OSwiZXhwIjoxNDYzMDczNjQ5LCJuYmYiOjE0NjI5ODcyNDksImp0aSI6ImIyMDFjNmNlYWMwNzQyNGUxZGFlZmI2YmUyZjA0MDNkIn0.BUYP6rVs5ylmLM524eA7gY50ECT4reZSO6aZVijLNrM"
        }
        
+ Response 401 (application/json)

        {
            "error": "invalid_token"
        }

## Bills [/bill/{id}]

**MOST USERS WILL NOT NEED TO IMPLEMENT THE BILL RESOURCE.** We have fully implemented a hosted solution, so if you are generating invoice records with POST invoice you can allow your customers to pay the invoices within our hosted solution. You can specify the default payment url to the api knows to send the customer the link to our hosted bill page.

A bill is the customer-side version of an invoice, a transaction that is awaiting payment.
Even though bills are found under invoices, they should be treated as separate entities.
Bills contain roughly the same information as an invoice, but it leaves out a few security-sensitive details that protect the merchant.

### Get a Bill's Information [GET /bill/{id}]
_(please click this box ^^ for more information)_

**Note: Valid Bill ID Required**

Retrieves the bill matching the given bill id.
This will list any information about the bill which can be seen in the 200 response below.
This function will also show the merchant whether or not it has been viewed and when. 
The bill id can be found in the URL.

**Changes to Responses:**
* Merchant, schedule and customer information is now stored under `merchant[]`, `schedule[]` and `customer[]` objects respectively.
* If an invoice doesn't have a `payment-method`, the `schedule.payment_method` will be `null`.
* When a bill belongs to an inactive schedule, `schedule.active` will be `false`. Making `future_occurrences` an empty set and `next_run_at` is null. 
* When inactive, the invoice generator is put on hold. If invoice is `deleted_at`, it will not run or generate future occurrences.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "id": "a2823496-03b4-459c-80de-3a80b0b3fd22",
          "status": "PARTIALLY APPLIED",
          "total": 12,
          "meta": {
            "tax": 2,
            "subtotal": 10
          },
          "created_at": "2017-01-11 21:27:24",
          "sent_at": null,
          "viewed_at": "2017-05-05 19:08:11",
          "paid_at": null,
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "balance_due": 12,
          "total_paid": 0,
          "url": "https://omni.fattmerchant.com/#/bill/",
          "merchant": {
            "company_name": "Here",
            "contact_phone": "8555503288",
            "address_1": "25 Wall Street",
            "address_2": "Suite 1",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "branding": {
              "id": "af82b215-6081-42b0-b494-fbda189ce8f9",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "name": "",
              "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/branding/af82b215-6081-42b0-b494-fbda189ce8f9.png",
              "tag": "branding",
              "meta": {
                "filesize_bytes": 3938556,
                "filesize": "3.94 MB",
                "extension": "png",
                "size": {
                  "width": 3072,
                  "height": 1728
                },
                "mime": "image/png"
              },
              "created_at": "2017-04-19 15:50:41",
              "updated_at": "2017-04-19 15:50:52",
              "deleted_at": null
            },
            "options": {
              "social": {
                "website_url": "http://google.com",
                "facebook_url": "http://google.com",
                "instagram_url": "http://google.com",
                "twitter_url": "http://google.com",
                "linkedin_url": "http://google.com"
              }
            },
            "allow_ach": true
          },
          "customer": {
            "email": "john@abc.com",
            "firstname": "Jesus",
            "lastname": "Christmas3",
            "company": "ABC INC"
          },
          "payment_method": null,
          "schedule": null,
          "transactions": [],
          "files": []
        }
        
+ Response 422 (application/json)

        {
          "id": ["Invalid bill id."]
        }

### Create a Payment Method for a Bill [POST /bill/{id}/payment-method]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Sets the `payment_method` to be the selected bill. 
The two choice are `card` or `bank`. 
This function will generated a `payment_method_id` to be passed into the body of `[POST /bill/{id}/pay]'.
This sets up the credit card or banking information needed for processing the bill. 
Can only create a `payment_method` and, for security purposes, will not be able to view them.
`card_type` is not required, but must be less than 10 characters. 
If not supplied, will auto-detect one of the following: amex, dinersclub, discover, jcb, mastercard, visa or null.

+ Request (application/json)

    **Attributes**
    
    * `save_for_future` (boolean) ... Indicates the bill's payment method should be saved for upcoming scheduled invoices to prevent re-entering payment info. This applies to invoices that belong to a `schedule_id`.
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
             "method": "bank", 
             "is_default": "1",
             "person_name": "Bob Smith",
             "card_type": "visa",
             "card_number": "4111111111111111",
             "card_exp": "0417",
             "card_cvv": "4444",
             "address_zip": "34112"
            }
        
+ Response 200 (application/json)
 
        {
          "id": "a2823496-03b4-459c-80de-3a80b0b3fd22",
          "status": "PARTIALLY APPLIED",
          "total": 12,
          "meta": {
            "tax": 2,
            "subtotal": 10
          },
          "created_at": "2017-01-11 21:27:24",
          "sent_at": null,
          "viewed_at": "2017-05-05 19:08:11",
          "paid_at": null,
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "balance_due": 12,
          "total_paid": 0,
          "url": "https://omni.fattmerchant.com/#/bill/",
          "merchant": {
            "company_name": "Here",
            "contact_phone": "8555503288",
            "address_1": "25 Wall Street",
            "address_2": "Suite 1",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "branding": {
              "id": "af82b215-6081-42b0-b494-fbda189ce8f9",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "name": "",
              "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/branding/af82b215-6081-42b0-b494-fbda189ce8f9.png",
              "tag": "branding",
              "meta": {
                "filesize_bytes": 3938556,
                "filesize": "3.94 MB",
                "extension": "png",
                "size": {
                  "width": 3072,
                  "height": 1728
                },
                "mime": "image/png"
              },
              "created_at": "2017-04-19 15:50:41",
              "updated_at": "2017-04-19 15:50:52",
              "deleted_at": null
            },
            "options": {
              "social": {
                "website_url": "http://google.com",
                "facebook_url": "http://google.com",
                "instagram_url": "http://google.com",
                "twitter_url": "http://google.com",
                "linkedin_url": "http://google.com"
              }
            },
            "allow_ach": true
          },
          "customer": {
            "email": "john@abc.com",
            "firstname": "Jesus",
            "lastname": "Christmas3",
            "company": "ABC INC"
          },
          "payment_method": {
            "id": "56429605-c218-45c5-8993-324bea3c5ba8",
            "method": "card",
            "card_type": "mastercard",
            "card_last_four": "4444",
            "card_exp": "042018",
            "nickname": "MASTERCARD: Daniel Walker (ending in: 4444)",
            "created_at": "2017-05-05 19:20:30"
          },
          "schedule": null,
          "transactions": [],
          "files": []
        }
        
+ Response 422 (application/json)

        {
          "errors": [
            "Year is expired"
          ]
        }

### Pay a Bill [POST /bill/{id}/pay]
_(please click this box ^^ for more information)_

**Note: Unpaid Bill ID Required**

This processes the bill and sends the money from the customer to the merchant. 
The payment method charged is given in the `[POST /bill/{id}/payment-method]` call and passed into this call.
The invoice tied to the bill will be updated to a `paid` status.
Once fully paided off, the bill can no longer be edited and cannot be charged again.
It is possible for a customer to partially pay a bill and pay the rest later.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
             "payment_method_id": "d907e172-78a5-49ae-b233-f525c8a7e5bc",
             "email_receipt": "1"
            }

+ Response 200 (application/json)
 
        {
          "id": "a2823496-03b4-459c-80de-3a80b0b3fd22",
          "status": "PAID",
          "total": 12,
          "meta": {
            "tax": 2,
            "subtotal": 10
          },
          "created_at": "2017-01-11 21:27:24",
          "sent_at": null,
          "viewed_at": "2017-05-05 19:41:54",
          "paid_at": "2017-05-05 19:42:04",
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "balance_due": 0,
          "total_paid": 12,
          "url": "https://omni.fattmerchant.com/#/bill/",
          "merchant": {
            "company_name": "Here",
            "contact_phone": "8555503288",
            "address_1": "25 Wall Street",
            "address_2": "Suite 1",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "branding": {
              "id": "af82b215-6081-42b0-b494-fbda189ce8f9",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "name": "",
              "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/branding/af82b215-6081-42b0-b494-fbda189ce8f9.png",
              "tag": "branding",
              "meta": {
                "filesize_bytes": 3938556,
                "filesize": "3.94 MB",
                "extension": "png",
                "size": {
                  "width": 3072,
                  "height": 1728
                },
                "mime": "image/png"
              },
              "created_at": "2017-04-19 15:50:41",
              "updated_at": "2017-04-19 15:50:52",
              "deleted_at": null
            },
            "options": {
              "social": {
                "website_url": "http://google.com",
                "facebook_url": "http://google.com",
                "instagram_url": "http://google.com",
                "twitter_url": "http://google.com",
                "linkedin_url": "http://google.com"
              }
            },
            "allow_ach": true
          },
          "customer": {
            "email": "john@abc.com",
            "firstname": "Jesus",
            "lastname": "Christmas3",
            "company": "ABC INC"
          },
          "payment_method": {
            "id": "0e0c52f9-4988-4bcc-ac27-6fc463279259",
            "method": "card",
            "card_type": "mastercard",
            "card_last_four": "4444",
            "card_exp": "042018",
            "nickname": "MASTERCARD: Daniel Walker (ending in: 4444)",
            "created_at": "2017-05-05 19:41:55"
          },
          "schedule": null,
          "transactions": [
            {
              "id": "5f38f04f-dc2f-44c4-ba3a-385c90dfeb0b",
              "invoice_id": "a2823496-03b4-459c-80de-3a80b0b3fd22",
              "success": true,
              "message": null,
              "type": "charge",
              "created_at": "2017-05-05 19:42:03",
              "last_four": "4444",
              "total": 12,
              "method": "card",
              "total_refunded": null,
              "is_voided": false,
              "schedule_id": null,
              "customer": null,
              "child_transactions": [],
              "files": [],
              "payment_method": null,
              "user": null
            }
          ],
          "files": []
        }
        
+ Response 422 (application/json)

        
        {
         "paid_at": [
           "The bill is already paid."]
        }

## Catalog [/item]

Catalogs are a static inventory of items that a merchant may wish to store.
Each merchant only gets one catalog and is used as a generic item list.
Items in a catalog are to used to quickly fill out a transaction or invoice and keep track of inventory.
In the future, multiple catalogs per merchant may be implemented.

### Retrieve All Catalog Items [GET /item]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Retrieves all the items saved under a merchant's catalog.
The items may be searched using keywords to find specific items, such as using `keywords[]=red`.
The items may also be filtered and sorted using certain parameters found below.
Name and description fields will be deprecated on 07/01/17.

+ Request (application/json)
    
    **`filter` Parameters Below.**
    
    * `code` (exact) ... filter by items of the exact code.
    * `price` (exact) ... filters by items of the exact price.
    * `quantity` (string) ... filters by items of the exact quantity.
    * `is_service` (boolean) ... filters for services.
    * `is_active` (boolean) ... filters for active items.
    * `is_taxable` (boolean) ... filters for taxable items.
    * `is_discount` (boolean) ... filters if the item is discounted or not.
    * `user_id` (exact) ... filters by user id.
    * `name` (LIKE) ... filters out any items that don't share the inputted name. Does not have to be exact.
    * `description` (LIKE) ... filters by part of description.
    * `meta` (LIKE) ... filters by meta. Does not have to be exact.
    
    **`sort` Parameters Below.**
    
    * `name` ... sorts the items alphabetically by name
    * `code` ... sorts by items code numerically
    * `description` ... sorts by items alphabetically by description
    * `price` ... sorts the items numerically by price
    * `quantity` ... sorts the items numerically by quantity
    * `is_service` ... sorts the items between those that are a service and those that aren't.
    * `is_active` ... sorts the items between those that are active and those that aren't.
    * `is_taxable` ... sorts the items between those that are taxable and those that aren't.
    * `is_discount` ... sorts the items between those that are a discount and those that aren't.
    * `created_at` ... sorts chronologically based on the times items were created.
    * `updated_at` ... sorts chronologically based on the last time items were updated.


    **`order` Parameters Below.**
    
    + `DESC` ... Descending order.
    + `ASC` ... Ascending order.
    
    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "total": 2,
          "per_page": 25,
          "current_page": 1,
          "last_page": 1,
          "next_page_url": null,
          "prev_page_url": null,
          "from": 1,
          "to": 2,
          "data": [
            {
              "id": "79256d84-3930-4e4b-bc71-9c6587cfc65c",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "thumbnail_id": null,
              "item": "meeseeks",
              "code": "aaaa",
              "details": "just a test item",
              "is_active": true,
              "is_taxable": false,
              "is_service": false,
              "is_discount": false,
              "price": 7.11,
              "in_stock": 0,
              "meta": [],
              "created_at": "2017-05-05 19:49:21",
              "updated_at": "2017-05-05 19:49:21",
              "deleted_at": null,
              "deprecation_warning": "The name and decription fiels will be deprecated on 7/1/17",
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Test Guy",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              },
              "files": [],
              "thumbnail": null
            },
            {
              "id": "62c6c812-36e6-4037-9569-caa1dfe968de",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "thumbnail_id": null,
              "item": "Meeseeks Box",
              "code": null,
              "details": null,
              "is_active": true,
              "is_taxable": false,
              "is_service": true,
              "is_discount": true,
              "price": 55,
              "in_stock": 0,
              "meta": [],
              "created_at": "2017-05-05 19:55:05",
              "updated_at": "2017-05-05 19:55:06",
              "deleted_at": null,
              "deprecation_warning": "The name and decription fiels will be deprecated on 7/1/17",
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "test guy",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              },
              "files": [
                {
                  "id": "cc5d4376-8a76-4de1-8fc1-b9135be5f26f",
                  "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                  "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                  "name": "meeseeks.png",
                  "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/cc5d4376-8a76-4de1-8fc1-b9135be5f26f.png",
                  "tag": null,
                  "meta": {
                    "filesize_bytes": 14181,
                    "filesize": "0.14 kB",
                    "extension": "png",
                    "size": {
                      "width": 128,
                      "height": 128
                    },
                    "mime": "image/png"
                  },
                  "created_at": "2017-05-05 19:55:00",
                  "updated_at": "2017-05-05 19:55:01",
                  "deleted_at": null
                }
              ],
              "thumbnail": null
            }
          ]
        }
        
+ Response 422 (application/json)

        {
          "sort": [
            "The selected sort is invalid."
          ],
          "order": [
            "The selected order is invalid."
          ],
          "is_active": [
            "The is active field must be true or false."
          ]
        }

### Retrieve an Item by ID [GET /item/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Retrieves the merchant's item matching the given id and then returns details about the item found in the 200 response below.
This can be used in conjunction with `PUT /item/{id}` to edit the item.
Name and description fields will be deprecated on 07/01/17.

+ Request (application/json)

 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
        
+ Response 200 (application/json)

        {
          "id": "79256d84-3930-4e4b-bc71-9c6587cfc65c",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "thumbnail_id": null,
          "item": "meeseeks",
          "code": "aaaa",
          "details": "just a test item",
          "is_active": true,
          "is_taxable": false,
          "is_service": false,
          "is_discount": false,
          "price": 7.11,
          "in_stock": 0,
          "meta": [],
          "created_at": "2017-05-05 19:49:21",
          "updated_at": "2017-05-05 19:49:21",
          "deleted_at": null,
          "deprecation_warning": "The name and decription fiels will be deprecated on 7/1/17",
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Test Guy",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null
          },
          "files": [],
          "thumbnail": null
        }
        
+ Response 422 (application/json)

        {
          "id": [
            "The item was not found"
          ]
        }

### Retrieve All Item Codes [GET /item/code]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

The item code is merchant-side code used for business to keep track of their items.
This will retrieve all the different codes used by catalog items in a list.
Any items without a code will return a `null`.

+ Request (application/json)

 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

        
+ Response 200 (application/json)

        [
          "aaaa",
          "bbbb",
          null,
          "cccc",
          "fdaf"
        ]

### Create a Catalog Item [POST /item]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Creates an item to be stored in a merchant's catalog.
Doesn't require any fields, but is recommended to give it a name and code.
The item uses `is_active`, `is_taxable`, `is_service` or `is_discount` to denote whether the item is actively sold, taxable, a service or discounted respectively.

+ Request (application/json)

 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
              "item": "test item",
              "code": "aaaa",
              "category": "essential items",
              "details": "just a test item",
              "is_active": true,
              "is_taxable": false,
              "is_service": false,
              "is_discount": false,
              "price": 7.11,
              "in_stock": 0,
              "low_stock_alert": 3,
              "meta": {}
            }

+ Response 200 (application/json)

        {
            "id": "9cf3bd88-da1b-4f35-a5a1-74153c8e7f28",
            "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
            "merchant_id": "a61d78cc-cde9-44ac-8a18-30c39be05879",
            "thumbnail_id": null,
            "item": "test item",
            "code": "aaaa",
            "category": "essential items",
            "details": "just a test item",
            "is_active": true,
            "is_taxable": false,
            "is_service": false,
            "is_subscription": false,
            "is_discount": false,
            "price": 7.11,
            "in_stock": 0,
            "low_stock_alert": 3,
            "meta": [],
            "created_at": "2018-10-02 14:28:50",
            "updated_at": "2018-10-02 14:28:50",
            "deleted_at": null,
            "user": {
                "id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
                "system_admin": true,
                "name": "Morty Junior",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2018-09-26 18:24:21",
                "email_verified_at": "2016-05-11 17:13:33",
                "is_api_key": false,
                "acknowledgments": {
                    "signedApplication": true,
                    "editedOnboardingInformation": false,
                    "tutorial": true,
                    "godviewWelcome": true
                },
                "created_at": "2016-05-18 14:11:46",
                "updated_at": "2018-09-26 18:24:21",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_default": false
            },
            "files": [],
            "thumbnail": null
        }
        
+ Response 422 (application/json)

        {
            "item": [
                "The item field is required."
            ]
        }
        
### Update an Item [PUT /item/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Updates/edits any existing catalog item that matches the given id.
Has the same inputted body as `[POST /item]`.
None of the given parameters are required, but name and code are at least recommended.

+ Request (application/json)

 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
              "item": "test item",
              "code": "aaaa",
              "category": "essential items",
              "details": "just a test item",
              "is_active": true,
              "is_taxable": false,
              "is_service": false,
              "is_discount": false,
              "price": 7.11,
              "in_stock": 0,
              "low_stock_alert": 3,
              "meta": {}
            }


+ Response 200 (application/json)

        {
            "id": "4cddf784-55d4-4dcb-a266-1eb5af051e01",
            "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
            "merchant_id": "a61d78cc-cde9-44ac-8a18-30c39be05879",
            "thumbnail_id": null,
            "item": "test item",
            "code": "aaaa",
            "category": "essential items",
            "details": "just a test item",
            "is_active": true,
            "is_taxable": false,
            "is_service": false,
            "is_subscription": false,
            "is_discount": false,
            "price": 7.11,
            "in_stock": 0,
            "low_stock_alert": 3,
            "meta": [],
            "created_at": "2018-10-02 14:30:48",
            "updated_at": "2018-10-02 14:30:48",
            "deleted_at": null,
            "user": {
                "id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
                "system_admin": true,
                "name": "Morty Junior",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2018-09-26 18:24:21",
                "email_verified_at": "2016-05-11 17:13:33",
                "is_api_key": false,
                "acknowledgments": {
                    "signedApplication": true,
                    "editedOnboardingInformation": false,
                    "tutorial": true,
                    "godviewWelcome": true
                },
                "created_at": "2016-05-18 14:11:46",
                "updated_at": "2018-09-26 18:24:21",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_default": false
            },
            "files": [],
            "thumbnail": null
        }
        
+ Response 422 (application/json)

        {
            "item": [
                "The item field is required."
            ]
        }
        
### Increment Item's Stock [PUT /item/{id}/increment]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Increases the stock of an item.
This increases `in_stock` by quantity given in the body.
Called anytime the merchant wants to add more of an item to their inventory.
Could only fail if no item is found.

+ Request (application/json)

 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
              "quantity": 1
            }

+ Response 200 (application/json)

        {
          "id": "0a6c966c-6a70-44eb-aa26-673310ca65c0",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "thumbnail_id": null,
          "item": "Soap 2.0",
          "code": "aaaa",
          "details": "Even cleaner time",
          "is_active": true,
          "is_taxable": false,
          "is_service": false,
          "is_discount": false,
          "price": 7.11,
          "in_stock": 1,
          "meta": [],
          "created_at": "2017-05-05 20:13:12",
          "updated_at": "2017-05-05 20:15:55",
          "deleted_at": null,
          "deprecation_warning": "The name and decription fiels will be deprecated on 7/1/17",
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Test guy",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null
          },
          "files": [],
          "thumbnail": null
        }
        
+ Response 422 (application/json)

        {
          "id": [
            "The item was not found"
          ]
        }

### Decrement Item's Stock [PUT /item/{id}/decrement]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Decreases the stock of an item.
Decreases `in_stock` by quantity given in the body.
This is to be called whenever less of an item is available, such as a customer purchasing the item.
Could only fail if no item is found.

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
              "quantity": 1
            }



+ Response 200 (application/json)

        {
          "id": "0a6c966c-6a70-44eb-aa26-673310ca65c0",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "thumbnail_id": null,
          "item": "Soap 2.0",
          "code": "aaaa",
          "details": "Even cleaner time",
          "is_active": true,
          "is_taxable": false,
          "is_service": false,
          "is_discount": false,
          "price": 7.11,
          "in_stock": -9,
          "meta": [],
          "created_at": "2017-05-05 20:13:12",
          "updated_at": "2017-05-05 20:16:21",
          "deleted_at": null,
          "deprecation_warning": "The name and decription fiels will be deprecated on 7/1/17",
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Test Guy",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null
          },
          "files": [],
          "thumbnail": null
        }
        
+ Response 422 (application/json)

        {
          "id": [
            "The item was not found"
          ]
        }

## Charge [/charge]

### Charge a Payment Method [POST /charge]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Charge is a primary action of the API which posts to a backend processor for the merchant. 
A transaction record with type charge is created within the Fattmerchant database as a record of the charge.
Using the `payment_method_ID` and `total_cost`, a charge is processed under the merchant's account.

From a processor standpoint, this operation is an auth and a capture represented by one transaction record (also called a purchase).

**Chart of response statuses:**

- Status 200 - transaction object (success = 1)
- Status 422 - validation errors object. The transaction didn't reach a gateway
- Status 400 - transaction object (success = 0). This was a gateway error
    - The transaction didn't reach a gateway but there weren't validation errors
    - `message` will have a cause (string)
- Status 500 - unknown issue - please contact Fattmerchant
    - an error we aren't accounting for

Please see the payment methods section for triggering success/fail based on card and bank account numbers.

<a href="https://omni.fattmerchant.com/#/settings?initialTab=Webhooks">This call will fire the `create_transaction` webhook.</a>. 

**Note about pre authorizations: [please see the guide here](https://fattmerchant.docs.apiary.io/#introduction/process-payments-from-server-side-with-api-key./pre-authorizations)**

+ Request (application/json)

    **Attributes**
    
    * `total` (required, float, min:. .01) this float is required and will be the amount a customer is charged.
    * `payment_method_id` (required, string) an existing payment\_method id within Fattmerchant. This function will give the perimeter the used customer_id.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        * within this JSON object, some fields are respected by the Fattmerchant OMNI web platform and emailed receipts
        * `subtotal`, `tax`, `lineItems`, `memo`, `reference`
        * will be blindly stored and returned during a `GET` operation. 
        * `meta.lineItems` if supplied must be an array and can contain:
            * `price`, `quantity`, `item` (name), `details` (description), `id` 
            * `id` is optional and corresponds to the Fattmerchant Catalog Item Id (see <a href="#reference/0/catalog/create-a-catalog-item">`POST /item`</a>)
    * `pre_auth` (required, boolean) `1`, `0`, `true`, `false` 
        * tells the API to create a pre authorization which you can capture later with POST /transaction/id/capture
    * `invoice_id` if you have created an invoice record with POST invoice, this is where you can pass in the invoice_id so the resulting transaction will be a child of the invoice. You can also use POST invoice/id/pay to create a charge on the invoice.

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
             "payment_method_id": "853c9aa3-e321-4194-97eb-03a268a832e0",
             "meta": {
                "tax":2,
                "subtotal":10
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id"
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":10,
                        "price": .1
                    }
                ]
             },
             "total": 12.00,
             "pre_auth": 0
            }

+ Response 200 (application/json)

    + Attributes
    
        * `id` (string) - The `id` of this transaction.
        * `invoice_id` (string) - The id of the Invoice associated with this transaction (if any).
        * `reference_id` (string) - The id of the parent transaction. Will only be filled if this transaction is a child refund or void of a tranasction.
        * `schedule_id` (string) - The id of the associated Schedule for this transaction (if any).
        * `auth_id` (string) - The if of the associated pre-auth transaction for this transaction (if this transaction is a `capture`).
        * `recurring_transaction_id` (string) - Deprecated. Do not use.
        * `type` (string) - The `type` of this transaction. Possible values are `"charge", "void", "refund", "credit", "pre_auth", "capture"`.
        * `source` (string) - The `source` of this transaction. Will be empty if this transaction originated in Omni, but will have a value if this transaction came from an external source such as a Terminal or Mobile Reader.
        * `merchant_id` (string) - The id of the Merchant that owns this transaction.
        * `user_id` (string) - The id of the User who made this transaction.
        * `customer_id` (string) - The id of the Customer associated with this transaction.
        * `payment_method_id` (string) - The id of the Payment Method associated with this transaction.
        * `success` (boolean) - Whether or not this transaction was successful.
        * `message` (string) - The error message if this transaction was unsuccessful.
        * `meta` (object) - Metadata for this transaction (if any). Usually will only contain what you place into it when running POST /charge or similar calls.
        * `total` (number) - The `total` of this transaction.
        * `method` (string) - The `method` of this transaction. Possible values are `"card", "bank", "cash", "check", "giftcard"`.
        * `pre_auth` (boolean) - Whether or not this transaction is a pre-authorization.
        * `last_four` (string) - The `last_four` of the Payment Method card number for this transaction (if any).
        * `receipt_email_at` (string) - When the email receipt was sent for this transaction.
        * `receipt_sms_at` (string) - When the sms receipt was sent for this transaction.
        * `settled_at` (string) - When this transaction was settled. 
        * `created_at` (string) - When this transaction was created.
        * `updated_at` (string) - When this transaction was last modified.
        * `issuer_auth_code` (string) - The gateway authorization code for this transactions. Transactions originating outside of Omni may not have an `issuer_auth_code`.
        * `total_refunded` (string) - The total amount of any refunds for this transaction (if any).
        * `is_manual` (boolean) - Whether or not this transaction was made for accounting purposes, such as a cash transaction.
        * `is_refundable` (string) - Whether or not this transaction is refundable.
        * `is_voidable` (string) - Whether or not this transaction is voidable.
        * `is_voided` (string) - Whether or not this transaction is voided. (To see if a transaction is refunded, check that `total_refunded > 0`)
        * `is_settling` (boolean) - Whether or not this transaction is still settling. Will always be `null` for non-ACH transactions. May have a boolean value if this transaction was made on an ACH Gateway.
        * `child_transactions` (array) - Any child Transactions for this transaction. Examples of child transactions include refunds, voids, and captures (if this transaction is a pre-auth).
        * `files` (array) - The Files attached to this transaction (if any).
        * `customer` (object) - The Customer for this transaction.
        * `payment_method` (object) - The Payment Method for this transaction.
        * `user` (object) - The User for this transaction.

    + Body
        
            {
                "id": "ad107d1a-819b-45f8-9f46-0260a3b05d26",
                "invoice_id": "",
                "reference_id": "",
                "recurring_transaction_id": "",
                "type": "charge",
                "source": null,
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "customer_id": "d1e9fdca-52e8-4b8a-9dd6-5ae8b0b03178",
                "payment_method_id": "b5f8729c-93ee-4bbb-9bfe-4a71f7b0e126",
                "is_manual": null,
                "success": true,
                "message": null,
                "meta": {
                  "tax":2,
                  "subtotal":10,
                  "lineItems": [
                      {
                          "id": "optional-fm-catalog-item-id",
                          "item":"Demo Item",
                          "details":"this is a regular demo item",
                          "quantity":10,
                          "price": .1
                      }
                  ]
                },
                "total": 1,
                "method": "card",
                "pre_auth": false,
                "last_four": "1111",
                "receipt_email_at": null,
                "receipt_sms_at": null,
                "settled_at": null,
                "created_at": "2017-05-08 17:59:32",
                "updated_at": "2017-05-08 17:59:32",
                "total_refunded": null,
                "issuer_auth_code": "06782D"
                "is_refundable": false,
                "is_voided": false,
                "is_voidable": true,
                "is_settling": null,
                "schedule_id": null,
                "customer": {
                  "id": "d1e9fdca-52e8-4b8a-9dd6-5ae8b0b03178",
                  "firstname": "Jfdfddohn",
                  "lastname": "Smith",
                  "company": "ABC INC",
                  "email": "demo@fattmerchant.com",
                  "cc_emails": [
                    "demo@abc.com"
                  ],
                  "phone": "1234567898",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": null,
                  "reference": "BARTLE",
                  "options": "",
                  "created_at": "2017-04-17 15:16:28",
                  "updated_at": "2017-04-17 15:16:28",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
                },
                "child_transactions": [],
                "files": [],
                "payment_method": {
                  "id": "b5f8729c-93ee-4bbb-9bfe-4a71f7b0e126",
                  "customer_id": "d1e9fdca-52e8-4b8a-9dd6-5ae8b0b03178",
                  "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                  "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                  "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
                  "is_default": 1,
                  "method": "card",
                  "person_name": "Steven Smith Jr.",
                  "card_type": "visa",
                  "card_last_four": "1111",
                  "card_exp": "042019",
                  "bank_name": null,
                  "bank_type": null,
                  "bank_holder_type": null,
                  "address_1": null,
                  "address_2": null,
                  "address_city": null,
                  "address_state": null,
                  "address_zip": "32944",
                  "address_country": "USA",
                  "purged_at": null,
                  "deleted_at": null,
                  "created_at": "2017-05-08 17:59:19",
                  "updated_at": "2017-05-08 17:59:19",
                  "card_exp_datetime": "2019-04-30 23:59:59",
                  "customer": {
                    "id": "d1e9fdca-52e8-4b8a-9dd6-5ae8b0b03178",
                    "firstname": "Jfdfddohn",
                    "lastname": "Smith",
                    "company": "ABC INC",
                    "email": "demo@fattmerchant.com",
                    "cc_emails": [
                      "demo@abc.com"
                    ],
                    "phone": "1234567898",
                    "address_1": "123 Rite Way",
                    "address_2": "Unit 12",
                    "address_city": "Orlando",
                    "address_state": "FL",
                    "address_zip": "32801",
                    "address_country": "USA",
                    "notes": null,
                    "reference": "BARTLE",
                    "options": "",
                    "created_at": "2017-04-17 15:16:28",
                    "updated_at": "2017-04-17 15:16:28",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
                  }
                },
                "user": {
                  "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                  "system_admin": false,
                  "name": "Demo",
                  "email": "demo@fattmerchant.com",
                  "email_verification_sent_at": "2017-03-29 15:27:19",
                  "email_verified_at": "2017-03-29 15:27:21",
                  "is_api_key": false,
                  "created_at": "2017-01-11 21:44:02",
                  "updated_at": "2017-04-24 15:41:58",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                  "team_admin": null,
                  "team_enabled": null,
                  "team_role": null
                }
              }
        
+ Response 422 (application/json)

        {
          "payment_method_id": [
            "The payment method id field is required."
          ],
          "meta": [
            "The meta field is required."
          ],
          "total": [
            "The total field is required."
          ],
          "files.0": [
            "The selected files.0 is invalid."
          ]
        }

+ Response 400 (application/json)

    + Attributes
    
        * `id` (string) - The `id` of this transaction.
        * `invoice_id` (string) - The id of the Invoice associated with this transaction (if any).
        * `reference_id` (string) - The id of the parent transaction. Will only be filled if this transaction is a child refund or void of a tranasction.
        * `schedule_id` (string) - The id of the associated Schedule for this transaction (if any).
        * `auth_id` (string) - The if of the associated pre-auth transaction for this transaction (if this transaction is a `capture`).
        * `recurring_transaction_id` (string) - Deprecated. Do not use.
        * `type` (string) - The `type` of this transaction. Possible values are `"charge", "void", "refund", "credit", "pre_auth", "capture"`.
        * `source` (string) - The `source` of this transaction. Will be empty if this transaction originated in Omni, but will have a value if this transaction came from an external source such as a Terminal or Mobile Reader.
        * `merchant_id` (string) - The id of the Merchant that owns this transaction.
        * `user_id` (string) - The id of the User who made this transaction.
        * `customer_id` (string) - The id of the Customer associated with this transaction.
        * `payment_method_id` (string) - The id of the Payment Method associated with this transaction.
        * `success` (boolean) - Whether or not this transaction was successful.
        * `message` (string) - The error message if this transaction was unsuccessful.
        * `meta` (object) - Metadata for this transaction (if any). Usually will only contain what you place into it when running POST /charge or similar calls.
        * `total` (number) - The `total` of this transaction.
        * `method` (string) - The `method` of this transaction. Possible values are `"card", "bank", "cash", "check", "giftcard"`.
        * `pre_auth` (boolean) - Whether or not this transaction is a pre-authorization.
        * `last_four` (string) - The `last_four` of the Payment Method card number for this transaction (if any).
        * `receipt_email_at` (string) - When the email receipt was sent for this transaction.
        * `receipt_sms_at` (string) - When the sms receipt was sent for this transaction.
        * `settled_at` (string) - When this transaction was settled. 
        * `created_at` (string) - When this transaction was created.
        * `updated_at` (string) - When this transaction was last modified.
        * `issuer_auth_code` (string) - The gateway authorization code for this transactions. Transactions originating outside of Omni may not have an `issuer_auth_code`.
        * `total_refunded` (string) - The total amount of any refunds for this transaction (if any).
        * `is_manual` (boolean) - Whether or not this transaction was made for accounting purposes, such as a cash transaction.
        * `is_refundable` (string) - Whether or not this transaction is refundable.
        * `is_voidable` (string) - Whether or not this transaction is voidable.
        * `is_voided` (string) - Whether or not this transaction is voided. (To see if a transaction is refunded, check that `total_refunded > 0`)
        * `is_settling` (boolean) - Whether or not this transaction is still settling. Will always be `null` for non-ACH transactions. May have a boolean value if this transaction was made on an ACH Gateway.
        * `child_transactions` (array) - Any child Transactions for this transaction. Examples of child transactions include refunds, voids, and captures (if this transaction is a pre-auth).
        * `files` (array) - The Files attached to this transaction (if any).
        * `customer` (object) - The Customer for this transaction.
        * `payment_method` (object) - The Payment Method for this transaction.
        * `user` (object) - The User for this transaction.

    + Body
        
            {
              "id": "566704dd-416a-4ae0-93a8-e81df7f79ba1",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "auth_id": null,
              "type": "charge",
              "source": null,
              "source_ip": "127.0.0.1",
              "is_merchant_present": true,
              "merchant_id": "6eed6a43-fba3-4aeb-8f53-94df81e82be3",
              "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
              "customer_id": "78caa49b-3e57-440a-afbb-4c7965297624",
              "payment_method_id": "c22c93fd-a5c3-4feb-b7d2-6950e53fdd99",
              "is_manual": null,
              "success": false,
              "message": "Unable to process the purchase transaction.",
              "meta": {
                "tax": 2,
                "subtotal": 10
              },
              "total": 1,
              "method": "card",
              "pre_auth": false,
              "is_captured": 0,
              "last_four": "1881",
              "interchange_code": "",
              "interchange_fee": null,
              "batch_id": "",
              "batched_at": "2019-07-25 13:13:43",
              "emv_response": "",
              "avs_response": "",
              "cvv_response": "",
              "pos_entry": "",
              "pos_salesperson": "",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "settled_at": null,
              "created_at": "2019-07-25 18:13:43",
              "updated_at": "2019-07-25 18:13:43",
              "gateway_id": "231af4e4-e5a0-4cba-98f8-2bfb7badc0b8",
              "issuer_auth_code": null,
              "total_refunded": 0,
              "is_refundable": false,
              "is_voided": false,
              "is_voidable": false,
              "schedule_id": null,
              "child_captures": [],
              "parent_auth": null,
              "gateway_name": "test",
              "response": {
                "on_test_gateway": true,
                "created_at": "2019-07-25T18:13:43Z",
                "updated_at": "2019-07-25T18:13:43Z",
                "succeeded": false,
                "state": "gateway_processing_failed",
                "token": "aNZRAwf2v7814VIloNNgMzOJ8TU",
                "transaction_type": "Purchase",
                "order_id": "566704dd-416a-4ae0-93a8-e81df7f79ba1",
                "ip": null,
                "description": "",
                "email": null,
                "merchant_name_descriptor": "Other company",
                "merchant_location_descriptor": "https://omni.fattmerchant.com",
                "gateway_specific_fields": null,
                "gateway_specific_response_fields": [],
                "gateway_transaction_id": null,
                "gateway_latency_ms": 22,
                "amount": 100,
                "currency_code": "USD",
                "retain_on_success": true,
                "payment_method_added": false,
                "message": "Unable to process the purchase transaction.",
                "gateway_token": "EtmNQvmL1MUipNNB6RKgY0fTtci",
                "gateway_type": "test",
                "response": {
                  "success": false,
                  "message": "Unable to process the purchase transaction.",
                  "avs_code": null,
                  "avs_message": null,
                  "cvv_code": null,
                  "cvv_message": null,
                  "pending": false,
                  "result_unknown": false,
                  "error_code": null,
                  "error_detail": null,
                  "cancelled": false,
                  "fraud_review": null,
                  "created_at": "2019-07-25T18:13:43Z",
                  "updated_at": "2019-07-25T18:13:43Z"
                },
                "shipping_address": {
                  "name": "Steven Smith Jr.",
                  "address1": null,
                  "address2": null,
                  "city": null,
                  "state": null,
                  "zip": null,
                  "country": null,
                  "phone_number": null
                },
                "api_urls": [
                  {
                    "referencing_transaction": []
                  }
                ],
                "payment_method": {
                  "token": "ONBwUMjQ0gIzXOsEQg8MX3bxQwd",
                  "created_at": "2019-07-25T18:13:32Z",
                  "updated_at": "2019-07-25T18:13:32Z",
                  "email": "demo@abc.com",
                  "data": {
                    "customer": "78caa49b-3e57-440a-afbb-4c7965297624",
                    "nickname": "VISA: Steven Smith Jr. (ending in: 1881)"
                  },
                  "storage_state": "retained",
                  "test": true,
                  "metadata": null,
                  "callback_url": null,
                  "last_four_digits": "1881",
                  "first_six_digits": "401288",
                  "card_type": "visa",
                  "first_name": "Steven Smith",
                  "last_name": "Jr.",
                  "month": 4,
                  "year": 2027,
                  "address1": null,
                  "address2": null,
                  "city": null,
                  "state": null,
                  "zip": "32944",
                  "country": "USA",
                  "phone_number": "9049626353",
                  "company": "ABC INC",
                  "full_name": "Steven Smith Jr.",
                  "eligible_for_card_updater": true,
                  "shipping_address1": null,
                  "shipping_address2": null,
                  "shipping_city": null,
                  "shipping_state": null,
                  "shipping_zip": null,
                  "shipping_country": null,
                  "shipping_phone_number": null,
                  "payment_method_type": "credit_card",
                  "errors": [],
                  "fingerprint": "73ae2e51e8f7f5177842661cc5451ef74328",
                  "verification_value": "XXX",
                  "number": "XXXX-XXXX-XXXX-1881"
                }
              },
              "customer": {
                "id": "78caa49b-3e57-440a-afbb-4c7965297624",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "cc_sms": [
                  "9202856700"
                ],
                "phone": "9049626353",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": "Reference:402320 Code:CCSM Zone:NWBC",
                "reference": "BARTLE",
                "options": null,
                "created_at": "2019-05-15 14:06:29",
                "updated_at": "2019-05-20 15:21:14",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "c22c93fd-a5c3-4feb-b7d2-6950e53fdd99",
                "customer_id": "78caa49b-3e57-440a-afbb-4c7965297624",
                "merchant_id": "6eed6a43-fba3-4aeb-8f53-94df81e82be3",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "nickname": "VISA: Steven Smith Jr. (ending in: 1881)",
                "has_cvv": 1,
                "is_default": 1,
                "method": "card",
                "person_name": "Steven Smith Jr.",
                "card_type": "visa",
                "card_last_four": "1881",
                "card_exp": "042027",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2019-07-25 18:13:32",
                "updated_at": "2019-07-25 18:13:32",
                "meta": null,
                "bin_type": null,
                "card_exp_datetime": "2027-04-30 23:59:59",
                "is_usable_in_vt": true,
                "customer": {
                  "id": "78caa49b-3e57-440a-afbb-4c7965297624",
                  "firstname": "John",
                  "lastname": "Smith",
                  "company": "ABC INC",
                  "email": "demo@abc.com",
                  "cc_emails": [
                    "demo1@abc.com",
                    "demo2@abc.com"
                  ],
                  "cc_sms": [
                    "9202856700"
                  ],
                  "phone": "9049626353",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": "Reference:402320 Code:CCSM Zone:NWBC",
                  "reference": "BARTLE",
                  "options": null,
                  "created_at": "2019-05-15 14:06:29",
                  "updated_at": "2019-05-20 15:21:14",
                  "deleted_at": null,
                  "allow_invoice_credit_card_payments": true,
                  "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                }
              },
              "user": {
                "id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "system_admin": true,
                "name": "Daniel Walker",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2018-05-31 20:22:05",
                "email_verified_at": "2017-12-14 17:34:57",
                "is_api_key": false,
                "acknowledgments": {
                  "tutorial": true,
                  "editedOnboardingInformation": true,
                  "signedApplicationPowerform": true,
                  "godviewOmniSearchTooltip": true,
                  "godviewWelcome": true
                },
                "created_at": "2017-12-14 17:34:57",
                "updated_at": "2018-07-02 21:51:45",
                "deleted_at": null,
                "brand": "fattmerchant",
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_default": false
              }
            }
        

### Verify A Payment Method [POST /verify]
_(please click this box ^^ for more information)_

**ADVANCED, not recommended to most users**

**NOTE:** If you are ONLY looking to create a pre authorization please see [the guide here](https://fattmerchant.docs.apiary.io/#introduction/process-payments-from-server-side-with-api-key./pre-authorizations). This is the verify route which creates a pre auth, **AND VOIDS IT.**

Similar to the charge resource, the verify resource will create a new transaction record within Fattmerchant's database; 
However, the transaction will be type = `pre_auth` and if the `pre_auth` is successful, a child
Transaction with type = `void` will also be created. The verify route simply authorizes that a card has the funds for a purchase. 
A successful call to the verify resource means that both the `pre_auth` and subsequent `void` transactions were successful.
A 400 is where there were no validation errors, but either the `pre_auth` or `void` transaction was unsuccessful. 
Perhaps the owner of the card has a hold on it.
This will result in success = 0 and an error in the `message` field.

+ Request (application/json)

    **Attributes**
 
    * `total` (required, number, min: .01): A float that is required and will be the amount a customer is charged
    * `payment_method_id` (required, string): An existing payment\_method\_id within Fattmerchant. The customer\_id is derived from this automatically.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        * within this JSON object, some fields are respected by the Fattmerchant OMNI web platform and emailed receipts
        * `subtotal`, `tax`, `lineItems`, `memo`, `reference`
        * will be blindly stored and returned during a `GET` operation. 
        * `meta.lineItems` if supplied must be an array and can contain:
            * `price`, `quantity`, `item` (name), `details` (description), `id` 
            * `id` is optional and corresponds to the Fattmerchant Catalog Item Id (see <a href="#reference/0/catalog/create-a-catalog-item">`POST /item`</a>)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
             "payment_method_id": "853c9aa3-e321-4194-97eb-03a268a832e0",
             "meta": {"tax":2,"subtotal":10},
             "total": "12.00",
             "pre_auth": "0"
            }

+ Response 200 (application/json)

    + Attributes
    
        * `id` (string) - The `id` of this transaction.
        * `invoice_id` (string) - The id of the Invoice associated with this transaction (if any).
        * `reference_id` (string) - The id of the parent transaction. Will only be filled if this transaction is a child refund or void of a tranasction.
        * `schedule_id` (string) - The id of the associated Schedule for this transaction (if any).
        * `auth_id` (string) - The if of the associated pre-auth transaction for this transaction (if this transaction is a `capture`).
        * `recurring_transaction_id` (string) - Deprecated. Do not use.
        * `type` (string) - The `type` of this transaction. Possible values are `"charge", "void", "refund", "credit", "pre_auth", "capture"`.
        * `source` (string) - The `source` of this transaction. Will be empty if this transaction originated in Omni, but will have a value if this transaction came from an external source such as a Terminal or Mobile Reader.
        * `merchant_id` (string) - The id of the Merchant that owns this transaction.
        * `user_id` (string) - The id of the User who made this transaction.
        * `customer_id` (string) - The id of the Customer associated with this transaction.
        * `payment_method_id` (string) - The id of the Payment Method associated with this transaction.
        * `success` (boolean) - Whether or not this transaction was successful.
        * `message` (string) - The error message if this transaction was unsuccessful.
        * `meta` (object) - Metadata for this transaction (if any). Usually will only contain what you place into it when running POST /charge or similar calls.
        * `total` (number) - The `total` of this transaction.
        * `method` (string) - The `method` of this transaction. Possible values are `"card", "bank", "cash", "check", "giftcard"`.
        * `pre_auth` (boolean) - Whether or not this transaction is a pre-authorization.
        * `last_four` (string) - The `last_four` of the Payment Method card number for this transaction (if any).
        * `receipt_email_at` (string) - When the email receipt was sent for this transaction.
        * `receipt_sms_at` (string) - When the sms receipt was sent for this transaction.
        * `settled_at` (string) - When this transaction was settled. 
        * `created_at` (string) - When this transaction was created.
        * `updated_at` (string) - When this transaction was last modified.
        * `issuer_auth_code` (string) - The gateway authorization code for this transactions. Transactions originating outside of Omni may not have an `issuer_auth_code`.
        * `total_refunded` (string) - The total amount of any refunds for this transaction (if any).
        * `is_manual` (boolean) - Whether or not this transaction was made for accounting purposes, such as a cash transaction.
        * `is_refundable` (string) - Whether or not this transaction is refundable.
        * `is_voidable` (string) - Whether or not this transaction is voidable.
        * `is_voided` (string) - Whether or not this transaction is voided. (To see if a transaction is refunded, check that `total_refunded > 0`)
        * `is_settling` (boolean) - Whether or not this transaction is still settling. Will always be `null` for non-ACH transactions. May have a boolean value if this transaction was made on an ACH Gateway.
        * `child_transactions` (array) - Any child Transactions for this transaction. Examples of child transactions include refunds, voids, and captures (if this transaction is a pre-auth).
        * `files` (array) - The Files attached to this transaction (if any).
        * `customer` (object) - The Customer for this transaction.
        * `payment_method` (object) - The Payment Method for this transaction.
        * `user` (object) - The User for this transaction.

    + Body 

            {
              "id": "2f2c2b7f-ae85-45af-8120-f05c242cedfe",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "type": "pre_auth",
              "source": null,
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
              "is_manual": null,
              "success": true,
              "message": null,
              "meta": {
                "tax": 2,
                "subtotal": 10
              },
              "total": 1,
              "method": "card",
              "pre_auth": true,
              "last_four": "1111",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2017-05-08 20:24:28",
              "updated_at": "2017-05-08 20:24:28",
              "total_refunded": null,
              "is_refundable": false,
              "is_voided": true,
              "is_voidable": false,
              "schedule_id": null,
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "child_transactions": [
                {
                  "id": "612bc846-39b2-4e83-9795-34cd0c6abcff",
                  "invoice_id": "",
                  "reference_id": "2f2c2b7f-ae85-45af-8120-f05c242cedfe",
                  "recurring_transaction_id": "",
                  "type": "void",
                  "source": null,
                  "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                  "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                  "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                  "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
                  "is_manual": null,
                  "success": true,
                  "message": null,
                  "meta": {
                    "tax": 2,
                    "subtotal": 10
                  },
                  "total": 1,
                  "method": "card",
                  "pre_auth": false,
                  "last_four": "1111",
                  "receipt_email_at": null,
                  "receipt_sms_at": null,
                  "created_at": "2017-05-08 20:24:29",
                  "updated_at": "2017-05-08 20:24:29",
                  "total_refunded": null,
                  "is_refundable": false,
                  "is_voided": null,
                  "is_voidable": false,
                  "schedule_id": null,
                  "customer": {
                    "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                    "firstname": "John",
                    "lastname": "Smith",
                    "company": "ABC INC",
                    "email": "demo@abc.com",
                    "cc_emails": [
                      "demo1@abc.com",
                      "demo2@abc.com"
                    ],
                    "phone": "1234567898",
                    "address_1": "123 Rite Way",
                    "address_2": "Unit 12",
                    "address_city": "Orlando",
                    "address_state": "FL",
                    "address_zip": "32801",
                    "address_country": "USA",
                    "notes": null,
                    "reference": "BARTLE",
                    "options": "",
                    "created_at": "2017-05-08 19:22:51",
                    "updated_at": "2017-05-08 19:23:46",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                  },
                  "child_transactions": [],
                  "files": [],
                  "payment_method": {
                    "id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
                    "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                    "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                    "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                    "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
                    "is_default": 1,
                    "method": "card",
                    "person_name": "Steven Smith Jr.",
                    "card_type": "visa",
                    "card_last_four": "1111",
                    "card_exp": "042019",
                    "bank_name": null,
                    "bank_type": null,
                    "bank_holder_type": null,
                    "address_1": null,
                    "address_2": null,
                    "address_city": null,
                    "address_state": null,
                    "address_zip": "32944",
                    "address_country": "USA",
                    "purged_at": null,
                    "deleted_at": null,
                    "created_at": "2017-05-08 19:41:03",
                    "updated_at": "2017-05-08 19:41:03",
                    "card_exp_datetime": "2019-04-30 23:59:59",
                    "customer": {
                      "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                      "firstname": "John",
                      "lastname": "Smith",
                      "company": "ABC INC",
                      "email": "demo@abc.com",
                      "cc_emails": [
                        "demo1@abc.com",
                        "demo2@abc.com"
                      ],
                      "phone": "1234567898",
                      "address_1": "123 Rite Way",
                      "address_2": "Unit 12",
                      "address_city": "Orlando",
                      "address_state": "FL",
                      "address_zip": "32801",
                      "address_country": "USA",
                      "notes": null,
                      "reference": "BARTLE",
                      "options": "",
                      "created_at": "2017-05-08 19:22:51",
                      "updated_at": "2017-05-08 19:23:46",
                      "deleted_at": null,
                      "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                    }
                  },
                  "user": {
                    "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                    "system_admin": false,
                    "name": "Demo",
                    "email": "demo@fattmerchant.com",
                    "email_verification_sent_at": "2017-03-29 15:27:19",
                    "email_verified_at": "2017-03-29 15:27:21",
                    "is_api_key": false,
                    "created_at": "2017-01-11 21:44:02",
                    "updated_at": "2017-04-24 15:41:58",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                    "team_admin": null,
                    "team_enabled": null,
                    "team_role": null
                  }
                }
              ],
              "files": [],
              "payment_method": {
                "id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
                "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
                "is_default": 1,
                "method": "card",
                "person_name": "Steven Smith Jr.",
                "card_type": "visa",
                "card_last_four": "1111",
                "card_exp": "042019",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2017-05-08 19:41:03",
                "updated_at": "2017-05-08 19:41:03",
                "card_exp_datetime": "2019-04-30 23:59:59",
                "customer": {
                  "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                  "firstname": "John",
                  "lastname": "Smith",
                  "company": "ABC INC",
                  "email": "demo@abc.com",
                  "cc_emails": [
                    "demo1@abc.com",
                    "demo2@abc.com"
                  ],
                  "phone": "1234567898",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": null,
                  "reference": "BARTLE",
                  "options": "",
                  "created_at": "2017-05-08 19:22:51",
                  "updated_at": "2017-05-08 19:23:46",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                }
              },
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              }
            }
        
+ Response 422 (application/json)

        {
         "payment_method_id": [
          "The selected payment method id is invalid."
         ],
         "total": [
          "The total field is required."
         ],
         "meta": [
          "The meta field is required."
         ]
        }
        
+ Response 400 (application/json)


    + Attributes
    
        * `id` (string) - The `id` of this transaction.
        * `invoice_id` (string) - The id of the Invoice associated with this transaction (if any).
        * `reference_id` (string) - The id of the parent transaction. Will only be filled if this transaction is a child refund or void of a tranasction.
        * `schedule_id` (string) - The id of the associated Schedule for this transaction (if any).
        * `auth_id` (string) - The if of the associated pre-auth transaction for this transaction (if this transaction is a `capture`).
        * `recurring_transaction_id` (string) - Deprecated. Do not use.
        * `type` (string) - The `type` of this transaction. Possible values are `"charge", "void", "refund", "credit", "pre_auth", "capture"`.
        * `source` (string) - The `source` of this transaction. Will be empty if this transaction originated in Omni, but will have a value if this transaction came from an external source such as a Terminal or Mobile Reader.
        * `merchant_id` (string) - The id of the Merchant that owns this transaction.
        * `user_id` (string) - The id of the User who made this transaction.
        * `customer_id` (string) - The id of the Customer associated with this transaction.
        * `payment_method_id` (string) - The id of the Payment Method associated with this transaction.
        * `success` (boolean) - Whether or not this transaction was successful.
        * `message` (string) - The error message if this transaction was unsuccessful.
        * `meta` (object) - Metadata for this transaction (if any). Usually will only contain what you place into it when running POST /charge or similar calls.
        * `total` (number) - The `total` of this transaction.
        * `method` (string) - The `method` of this transaction. Possible values are `"card", "bank", "cash", "check", "giftcard"`.
        * `pre_auth` (boolean) - Whether or not this transaction is a pre-authorization.
        * `last_four` (string) - The `last_four` of the Payment Method card number for this transaction (if any).
        * `receipt_email_at` (string) - When the email receipt was sent for this transaction.
        * `receipt_sms_at` (string) - When the sms receipt was sent for this transaction.
        * `settled_at` (string) - When this transaction was settled. 
        * `created_at` (string) - When this transaction was created.
        * `updated_at` (string) - When this transaction was last modified.
        * `issuer_auth_code` (string) - The gateway authorization code for this transactions. Transactions originating outside of Omni may not have an `issuer_auth_code`.
        * `total_refunded` (string) - The total amount of any refunds for this transaction (if any).
        * `is_manual` (boolean) - Whether or not this transaction was made for accounting purposes, such as a cash transaction.
        * `is_refundable` (string) - Whether or not this transaction is refundable.
        * `is_voidable` (string) - Whether or not this transaction is voidable.
        * `is_voided` (string) - Whether or not this transaction is voided. (To see if a transaction is refunded, check that `total_refunded > 0`)
        * `is_settling` (boolean) - Whether or not this transaction is still settling. Will always be `null` for non-ACH transactions. May have a boolean value if this transaction was made on an ACH Gateway.
        * `child_transactions` (array) - Any child Transactions for this transaction. Examples of child transactions include refunds, voids, and captures (if this transaction is a pre-auth).
        * `files` (array) - The Files attached to this transaction (if any).
        * `customer` (object) - The Customer for this transaction.
        * `payment_method` (object) - The Payment Method for this transaction.
        * `user` (object) - The User for this transaction.

    + Body 

            {
              "id": "11cff7fc-49fb-4fb4-9053-b3e10dcb6393",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "type": "pre_auth",
              "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
              "user_id": "d1309183-a491-450b-996c-a8502fe02375",
              "customer_id": "b1757304-1bfb-4224-aab6-b8cc2aaccacf",
              "payment_method_id": "958d8452-f07b-4aa7-b109-1be36bf5f93f",
              "is_manual": null,
              "success": 0,
              "message": "Unable to process the authorize transaction.",
              "meta": {
                "tax": 2,
                "subtotal": 10
              },
              "total": 1,
              "method": "card",
              "pre_auth": 1,
              "last_four": "1881",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2016-06-06 14:32:52",
              "updated_at": "2016-06-06 14:32:53",
              "total_refunded": null,
              "is_voided": null,
              "customer": {
                "id": "b1757304-1bfb-4224-aab6-b8cc2aaccacf",
                "firstname": "Duff",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "john@abc.com",
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "options": "",
                "created_at": "2016-06-06 13:55:15",
                "updated_at": "2016-06-06 13:55:15",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
              },
              "child_transactions": [],
              "payment_method": {
                "id": "958d8452-f07b-4aa7-b109-1be36bf5f93f",
                "customer_id": "b1757304-1bfb-4224-aab6-b8cc2aaccacf",
                "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
                "user_id": "d1309183-a491-450b-996c-a8502fe02375",
                "nickname": "VISA: Daniel Walker (ending in: 1881)",
                "is_default": 1,
                "method": "card",
                "person_name": "Daniel Walker",
                "card_type": "visa",
                "card_last_four": "1881",
                "card_exp": "042017",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "deleted_at": null,
                "created_at": "2016-06-06 14:31:32",
                "updated_at": "2016-06-06 14:31:32",
                "card_exp_datetime": "2017-04-01 00:00:00"
              }
            }


## Credit [/credit]

Allows a merchant to give credit, or money, to a previous customer.
This works similar to the refund function, but doesn't require a previous purchase transaction to refund.

### Credit A Payment Method [POST /credit]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

**Note: Only works for merchants that belong to a gateway that supports the "general credit" feature**.

Will return a 400 response if a merchant that doesn't belong to a qualified gateway.
a 400 is, also, where there weren't validation error, but the charge wasn't successful. 
Perhaps the owner of the card has a hold on it.
This will result in success = 0 and an error in the `message` field.

+ Request (application/json)

        **Attributes**
 
    * `total` (required, number, min: .01): A float that is required and will be the amount a customer is charged
    * `payment_method_id` (required, string): An existing payment\_method id within Fattmerchant. Customer\_id will be found using this.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        * within this JSON object, some fields are respected by the Fattmerchant OMNI web platform and emailed receipts
        * `subtotal`, `tax`, `lineItems`, `memo`, `reference`
        * will be blindly stored and returned during a `GET` operation. 
        * `meta.lineItems` if supplied must be an array and can contain:
            * `price`, `quantity`, `item` (name), `details` (description), `id` 
            * `id` is optional and corresponds to the Fattmerchant Catalog Item Id (see <a href="#reference/0/catalog/create-a-catalog-item">`POST /item`</a>)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
             "payment_method_id": "1c5836d2-5443-482d-9a4e-a0cca356ee26",
             "meta": {"memo":"Refund for Subscription", "subtotal": "1.00", "tax": "0"},
             "total": "1.00"
            }
        
+ Response 200 (application/json)

    + Attributes
    
        * `id` (string) - The `id` of this transaction.
        * `invoice_id` (string) - The id of the Invoice associated with this transaction (if any).
        * `reference_id` (string) - The id of the parent transaction. Will only be filled if this transaction is a child refund or void of a tranasction.
        * `schedule_id` (string) - The id of the associated Schedule for this transaction (if any).
        * `auth_id` (string) - The if of the associated pre-auth transaction for this transaction (if this transaction is a `capture`).
        * `recurring_transaction_id` (string) - Deprecated. Do not use.
        * `type` (string) - The `type` of this transaction. Possible values are `"charge", "void", "refund", "credit", "pre_auth", "capture"`.
        * `source` (string) - The `source` of this transaction. Will be empty if this transaction originated in Omni, but will have a value if this transaction came from an external source such as a Terminal or Mobile Reader.
        * `merchant_id` (string) - The id of the Merchant that owns this transaction.
        * `user_id` (string) - The id of the User who made this transaction.
        * `customer_id` (string) - The id of the Customer associated with this transaction.
        * `payment_method_id` (string) - The id of the Payment Method associated with this transaction.
        * `success` (boolean) - Whether or not this transaction was successful.
        * `message` (string) - The error message if this transaction was unsuccessful.
        * `meta` (object) - Metadata for this transaction (if any). Usually will only contain what you place into it when running POST /charge or similar calls.
        * `total` (number) - The `total` of this transaction.
        * `method` (string) - The `method` of this transaction. Possible values are `"card", "bank", "cash", "check", "giftcard"`.
        * `pre_auth` (boolean) - Whether or not this transaction is a pre-authorization.
        * `last_four` (string) - The `last_four` of the Payment Method card number for this transaction (if any).
        * `receipt_email_at` (string) - When the email receipt was sent for this transaction.
        * `receipt_sms_at` (string) - When the sms receipt was sent for this transaction.
        * `settled_at` (string) - When this transaction was settled. 
        * `created_at` (string) - When this transaction was created.
        * `updated_at` (string) - When this transaction was last modified.
        * `issuer_auth_code` (string) - The gateway authorization code for this transactions. Transactions originating outside of Omni may not have an `issuer_auth_code`.
        * `total_refunded` (string) - The total amount of any refunds for this transaction (if any).
        * `is_manual` (boolean) - Whether or not this transaction was made for accounting purposes, such as a cash transaction.
        * `is_refundable` (string) - Whether or not this transaction is refundable.
        * `is_voidable` (string) - Whether or not this transaction is voidable.
        * `is_voided` (string) - Whether or not this transaction is voided. (To see if a transaction is refunded, check that `total_refunded > 0`)
        * `is_settling` (boolean) - Whether or not this transaction is still settling. Will always be `null` for non-ACH transactions. May have a boolean value if this transaction was made on an ACH Gateway.
        * `child_transactions` (array) - Any child Transactions for this transaction. Examples of child transactions include refunds, voids, and captures (if this transaction is a pre-auth).
        * `files` (array) - The Files attached to this transaction (if any).
        * `customer` (object) - The Customer for this transaction.
        * `payment_method` (object) - The Payment Method for this transaction.
        * `user` (object) - The User for this transaction.

    + Body 
 
            {
              "id": "85f59225-9a58-4b6e-8aae-f0ffe625e486",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "type": "credit",
              "source": null,
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
              "is_manual": null,
              "success": true,
              "message": null,
              "meta": {
                "memo": "Refund for Subscription",
                "subtotal": "1.00",
                "tax": "0"
              },
              "total": 1,
              "method": "card",
              "pre_auth": false,
              "last_four": "1111",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2017-05-08 20:25:28",
              "updated_at": "2017-05-08 20:25:28",
              "total_refunded": null,
              "is_refundable": false,
              "is_voided": null,
              "is_voidable": false,
              "schedule_id": null,
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
                "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
                "is_default": 1,
                "method": "card",
                "person_name": "Steven Smith Jr.",
                "card_type": "visa",
                "card_last_four": "1111",
                "card_exp": "042019",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2017-05-08 19:41:03",
                "updated_at": "2017-05-08 19:41:03",
                "card_exp_datetime": "2019-04-30 23:59:59",
                "customer": {
                  "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                  "firstname": "John",
                  "lastname": "Smith",
                  "company": "ABC INC",
                  "email": "demo@abc.com",
                  "cc_emails": [
                    "demo1@abc.com",
                    "demo2@abc.com"
                  ],
                  "phone": "1234567898",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": null,
                  "reference": "BARTLE",
                  "options": "",
                  "created_at": "2017-05-08 19:22:51",
                  "updated_at": "2017-05-08 19:23:46",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                }
              },
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              }
            }
        
+ Response 422 (application/json)

        {
         "payment_method_id": [
         "The selected payment method id is invalid."
         ]
        }
        
+ Response 400 (application/json)

    + Attributes
    
        * `id` (string) - The `id` of this transaction.
        * `invoice_id` (string) - The id of the Invoice associated with this transaction (if any).
        * `reference_id` (string) - The id of the parent transaction. Will only be filled if this transaction is a child refund or void of a tranasction.
        * `schedule_id` (string) - The id of the associated Schedule for this transaction (if any).
        * `auth_id` (string) - The if of the associated pre-auth transaction for this transaction (if this transaction is a `capture`).
        * `recurring_transaction_id` (string) - Deprecated. Do not use.
        * `type` (string) - The `type` of this transaction. Possible values are `"charge", "void", "refund", "credit", "pre_auth", "capture"`.
        * `source` (string) - The `source` of this transaction. Will be empty if this transaction originated in Omni, but will have a value if this transaction came from an external source such as a Terminal or Mobile Reader.
        * `merchant_id` (string) - The id of the Merchant that owns this transaction.
        * `user_id` (string) - The id of the User who made this transaction.
        * `customer_id` (string) - The id of the Customer associated with this transaction.
        * `payment_method_id` (string) - The id of the Payment Method associated with this transaction.
        * `success` (boolean) - Whether or not this transaction was successful.
        * `message` (string) - The error message if this transaction was unsuccessful.
        * `meta` (object) - Metadata for this transaction (if any). Usually will only contain what you place into it when running POST /charge or similar calls.
        * `total` (number) - The `total` of this transaction.
        * `method` (string) - The `method` of this transaction. Possible values are `"card", "bank", "cash", "check", "giftcard"`.
        * `pre_auth` (boolean) - Whether or not this transaction is a pre-authorization.
        * `last_four` (string) - The `last_four` of the Payment Method card number for this transaction (if any).
        * `receipt_email_at` (string) - When the email receipt was sent for this transaction.
        * `receipt_sms_at` (string) - When the sms receipt was sent for this transaction.
        * `settled_at` (string) - When this transaction was settled. 
        * `created_at` (string) - When this transaction was created.
        * `updated_at` (string) - When this transaction was last modified.
        * `issuer_auth_code` (string) - The gateway authorization code for this transactions. Transactions originating outside of Omni may not have an `issuer_auth_code`.
        * `total_refunded` (string) - The total amount of any refunds for this transaction (if any).
        * `is_manual` (boolean) - Whether or not this transaction was made for accounting purposes, such as a cash transaction.
        * `is_refundable` (string) - Whether or not this transaction is refundable.
        * `is_voidable` (string) - Whether or not this transaction is voidable.
        * `is_voided` (string) - Whether or not this transaction is voided. (To see if a transaction is refunded, check that `total_refunded > 0`)
        * `is_settling` (boolean) - Whether or not this transaction is still settling. Will always be `null` for non-ACH transactions. May have a boolean value if this transaction was made on an ACH Gateway.
        * `child_transactions` (array) - Any child Transactions for this transaction. Examples of child transactions include refunds, voids, and captures (if this transaction is a pre-auth).
        * `files` (array) - The Files attached to this transaction (if any).
        * `customer` (object) - The Customer for this transaction.
        * `payment_method` (object) - The Payment Method for this transaction.
        * `user` (object) - The User for this transaction.

    + Body 
    
            {
              "id": "8df52e5a-bf8f-46da-80a7-6ae5f9d17661",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "type": "credit",
              "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
              "user_id": "d1309183-a491-450b-996c-a8502fe02375",
              "customer_id": "b1757304-1bfb-4224-aab6-b8cc2aaccacf",
              "payment_method_id": "958d8452-f07b-4aa7-b109-1be36bf5f93f",
              "is_manual": null,
              "success": 1,
              "message": null,
              "meta": {
                "memo": "Refund for Subscription",
                "subtotal": "1.00",
                "tax": "0"
              },
              "total": 1,
              "method": "card",
              "pre_auth": 0,
              "last_four": "1881",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2016-06-06 14:40:31",
              "updated_at": "2016-06-06 14:40:32",
              "total_refunded": null,
              "is_voided": null,
              "customer": {
                "id": "b1757304-1bfb-4224-aab6-b8cc2aaccacf",
                "firstname": "Duff",
                "lastname": "Johnson",
                "company": "ABC INC",
                "email": "john@abc.com",
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "options": "",
                "created_at": "2016-06-06 13:55:15",
                "updated_at": "2016-06-06 13:55:15",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
              },
              "child_transactions": [],
              "payment_method": {
                "id": "958d8452-f07b-4aa7-b109-1be36bf5f93f",
                "customer_id": "b1757304-1bfb-4224-aab6-b8cc2aaccacf",
                "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
                "user_id": "d1309183-a491-450b-996c-a8502fe02375",
                "nickname": "VISA: Daniel Walker (ending in: 1881)",
                "is_default": 1,
                "method": "card",
                "person_name": "Daniel Walker",
                "card_type": "visa",
                "card_last_four": "1881",
                "card_exp": "042017",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "deleted_at": null,
                "created_at": "2016-06-06 14:31:32",
                "updated_at": "2016-06-06 14:31:32",
                "card_exp_datetime": "2017-04-01 00:00:00"
              }
            }

## Customers [/customer]

A customer is a client to the merchant that wishes to make a transaction through Fattmerchant.
Customers can be tied to one or more merchants, but don't require their own Fattmerchant account.
Customer processes are done through a merchant's account.
Once a customer makes a transaction, they will be automatically saved under a merchants account.

### Create Customer [POST /customer]
_(please click this box ^^ for more information)_

Allows the merchant to create a customer record tied to the merchant's account by inputting a customer's information.
This allows the merchant to access a customer of future transactions without having to register them over again.
The customer is given a `customer_id` using a UUID (Universally unique identifier) that the other functions need to use.
Customer requires at least one of the following: `firstname`, `lastname`, `email` or `company` in order to pass.
`address_country` is the ISO 3 code (3 characters) and it's optional.
If supplied it will be sent to the processing gateway.

+ Request (application/json)

    **More Info On Customer Fields**

    * `firstname` string (255) required if no `lastname`, `email`, `company` supplied
    * `lastname` string (255) required if no `firstname`, `email`, `company` supplied
    * `email` string (255), a valid email, required if no `firstname`, `lastname`, `company` supplied. A
    * `company` string (255) required if no `firstname`, `lastname`, `email` supplied
    * `phone` string matching regex: /[0-9]{10,15}/
    * `address_1` string (255)
    * `address_2` string (255)
    * `address_city` string (255)
    * `address_state` string (2)
    * `address_zip` string (16)
    * `address_country` string (3)
    * `notes` nullable, string (21844) this is a long string available for any internal notes about this customer. A customer will not see these notes in invoice emails or any other default behavior.
    * `reference` string (255) - this is any string for the merchant's own purposes
    * `files` array of strings(50) where each index is a valid file_id
    * `cc_emails` nullable, array of strings(255) where each index is a valid email address
    * `cc_sms` nullable, array of strings where each string matches this regex: /[0-9]{10,15}/
    * `allow_invoice_credit_card_payments` boolean
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
    
            {
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@fattmerchant.com",
              "cc_emails": ["demo@abc.com"],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "reference": "BARTLE"
            } 

+ Response 200 (application/json)

        {
          "id": "59327746-fbca-4fb6-adf0-e88c99245548",
          "firstname": "John",
          "lastname": "Smith",
          "company": "ABC INC",
          "email": "demo@fattmerchant.com",
          "cc_emails": [
            "demo@abc.com"
          ],
          "phone": "1234567898",
          "address_1": "123 Rite Way",
          "address_2": "Unit 12",
          "address_city": "Orlando",
          "address_state": "FL",
          "address_zip": "32801",
          "address_country": "USA",
          "notes": null,
          "reference": "BARTLE",
          "options": "",
          "created_at": "2017-05-08 19:13:41",
          "updated_at": "2017-05-08 19:13:41",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
        }
        
+ Response 422 (application/json)

        {
          "firstname": [
            "The firstname field is required when none of lastname / email / company are present."
          ],
          "lastname": [
            "The lastname field is required when none of firstname / email / company are present."
          ],
          "email": [
            "The email field is required when none of firstname / lastname / company are present."
          ],
          "company": [
            "The company field is required when none of firstname / lastname / email are present."
          ]
        }

### Find All Customers [GET /customer]
_(please click this box ^^ for more information)_

Shows all customers within a merchant's records or associated with a merchant.
Using the `[PUT /customer/{id}]` call, the merchant is able to edit any of their customers' information if necessary.

If no customers are found based on the filter query params, the `data` array will be empty.

Examples of filters:

- `/customer?firstname=james` to find a customer with a name of "James" OR "Mr. James"
- `/customer?email=james.wilson@abc.com` to find a customer whose email contains "james.wilson@abc.com"
- `/customer?lastname=wilson&email=@abc.com` to find a customer with a last name of "Wilson" AND and email ending in "@abc.com"
- `/customer?keywords[]=james` to find a customer named James or a customer with any field that contains the word "James" in it
- `/customer?keywords[]=123&keywords[]=james` to find a customer with a field that contains JAMES and a field that contains "123"

The `keywords[]` array within the parameter will search across most customers fields (see the editor for details). Warning, can be SLOW.

Customers may be sorted and filtered through using the parameters found below.
To sort, for example, use `customer?sort=firstname&order=ASC` to search first names alphabetically A->Z.

+ Request (application/json)

    **Filter Parameters:**

    + `firstname` (string, *) ... filters for customers by firstname
    + `lastname` (string, *) ... filters for customers by lastname
    + `company` (string, *) ... filters for customers by company
    + `phone` (string, *) ... filters for customers by phone
        + if an empty string is passed, we will return customers with no phone
    + `email` (string, *) ... filters for customers by email
    + `address_1` (string, *) ... filters for customers by address line 1
    + `address_2` (string, *) ... filters for customers by address line 2
    + `address_city` (string, *) ... filters for customers by address line 2
    + `address_state` (string, 2 characters only) ... filters for customers by address line 2
    + `address_zip` (string) ... filters for customers by address line 2
    + `keywords[]` (string, *) ... filters across the following fields:
        + (**WARNING: can be slow**)
        + `id`
        + `firstname`
        + `lastname`
        + `email`
        + `company`
        + `notes`
        + `reference`
        + `phone`
    + (string, *) = the Value you pass will be in a LIKE clause, eg. `LIKE %VALUE%`

    **Sort Parameters:**
    
    + `order` ... Rearranges the order of the customer by either ascending or descending order.
    + `firstname` ... Rearranges the sort of customers' first names alphabetically.
    + `lastname` ... Rearranges the sort of customers' last names alphabetically.
    + `email` ... Rearranges the sort of customers' emails alphabetically.
    + `company` ... Rearranges the sort of customers' companies alphabetically.
    + `address_1` ... rearranges the sort of the first part of customers' address alphabetically.
    + `address_city` ... rearranges the sort of the city part of customers' address alphabetically.
    + `address_state` ... rearranges the sort of the state part of customers' address alphabetically.
    + `reference` ... rearranges the sort by customers' reference info.
    + `created_at` ... rearranges customers based on the time they were created.
    + `updated_at` ... rearranges customers based on the last time they were updated.
    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json) 

        {
             "total": 2,
             "per_page": 50,
             "current_page": 1,
             "last_page": 1,
             "next_page_url": null,
             "prev_page_url": null,
             "from": 1,
             "to": 2,
             "data": [
                {
                 "id": "5ff4e048-c9f3-4993-81be-f7253d132c19",
                 "firstname": "John",
                 "lastname": "Smith",
                 "company": "ABC INC",
                 "email": "john@abc.com",
                 "cc_emails": null,
                 "phone": "1234567898",
                 "address_1": "123 Rite Way",
                 "address_2": "Unit 12",
                 "address_city": "Orlando",
                 "address_state": "FL",
                 "address_zip": "32801",
                 "address_country":"USA",
                 "notes": "",
                 "reference": "",
                 "options": "",
                 "created_at": "2016-04-26 13:52:10",
                 "updated_at": "2016-04-26 13:52:10",
                 "deleted_at": null,
                 "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                },
                {
                 "id": "c20db54e-4078-46d9-9c09-2287612c8840",
                 "firstname": "John",
                 "lastname": "Smith",
                 "company": "ABC INC",
                 "email": "john@abc.com",
                 "cc_emails": null,
                 "phone": "1234567898",
                 "address_1": "123 Rite Way",
                 "address_2": "Unit 12",
                 "address_city": "Orlando",
                 "address_state": "FL",
                 "address_zip": "32801",
                 "notes": "",
                 "reference": "",
                 "options": "",
                 "created_at": "2016-04-25 15:24:03",
                 "updated_at": "2016-04-25 15:24:03",
                 "deleted_at": null,
                 "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                }
             ]
        } 

### Get a Customer's Information [GET /customer/{id}]
_(please click this box ^^ for more information)_

After gathering all customers into a list, you can use this function to pull up more information on a specific customer.
Activated by clicking or calling the specified customer.
Uses the ID of the user to match the corresponding information found in the database.
Opens the opportunity to use the `PUT` and `DEL` functions to edit the customer.

To view a customer's payment methods, see `GET /customer/{customerId}/payment-method` under the `/payment-method` section.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "firstname": "John",
          "lastname": "Smith",
          "company": "ABC INC",
          "email": "demo@fattmerchant.com",
          "cc_emails": [
            "demo@abc.com"
          ],
          "phone": "1234567898",
          "address_1": "123 Rite Way",
          "address_2": "Unit 12",
          "address_city": "Orlando",
          "address_state": "FL",
          "address_zip": "32801",
          "address_country": "USA",
          "notes": null,
          "reference": "BARTLE",
          "options": "",
          "created_at": "2017-05-08 19:22:51",
          "updated_at": "2017-05-08 19:22:51",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
        }
        
+ Response 404 (application/json)

        {
         "id":"customer not found"
        }
 
### Update a Customer's Information [PUT /customer/{id}]
_(please click this box ^^ for more information)_

After using the `GET` function to pull up a customer's information, this function is what allows the merchant to update it.
This function gets in the same inputs as a newly created customer.
This will not fail if you enter no information.
Used for correcting any incorrect or outdated information the initial `POST` function entered.

+ Request (application/json)


    **More Info On Customer Fields**

    * `firstname` string (255) required if no `lastname`, `email`, `company` supplied
    * `lastname` string (255) required if no `firstname`, `email`, `company` supplied
    * `email` string (255), a valid email, required if no `firstname`, `lastname`, `company` supplied. A
    * `company` string (255) required if no `firstname`, `lastname`, `email` supplied
    * `phone` string matching regex: /[0-9]{10,15}/
    * `address_1` string (255)
    * `address_2` string (255)
    * `address_city` string (255)
    * `address_state` string (2)
    * `address_zip` string (16)
    * `address_country` string (3)
    * `notes` nullable, string (21844) this is a long string available for any internal notes about this customer. A customer will not see these notes in invoice emails or any other default behavior.
    * `reference` string (255) - this is any string for the merchant's own purposes
    * `files` array of strings(50) where each index is a valid file_id
    * `cc_emails` nullable, array of strings(255) where each index is a valid email address
    * `cc_sms` nullable, array of strings where each string matches this regex: /[0-9]{10,15}/
    * `allow_invoice_credit_card_payments` boolean
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": ["demo1@abc.com", "demo2@abc.com"],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "reference": "BARTLE"
            } 

+ Response 200 (application/json)

        {
          "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "firstname": "John",
          "lastname": "Smith",
          "company": "ABC INC",
          "email": "demo@abc.com",
          "cc_emails": [
            "demo1@abc.com",
            "demo2@abc.com"
          ],
          "phone": "1234567898",
          "address_1": "123 Rite Way",
          "address_2": "Unit 12",
          "address_city": "Orlando",
          "address_state": "FL",
          "address_zip": "32801",
          "address_country": "USA",
          "notes": null,
          "reference": "BARTLE",
          "options": "",
          "created_at": "2017-05-08 19:22:51",
          "updated_at": "2017-05-08 19:23:46",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
        }
        
+ Response 404 (application/json)

        {
         "id":"customer not found"
        }

### Delete a Customer [DELETE /customer/{id}]
_(please click this box ^^ for more information)_

To soft delete a customer, and thus hide it from view when calling `GET customer`, simply change the http verb to `DELETE`.

You can only delete 1 customer at a time. The result will be a 200 response showing a non-null `deleted_at` value.

However, even though a customer is deleted, you can still request it later using `GET customer/customer_id`

+ Request (application/json)


    _this route takes no body, only a `customer_id` in the route.

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "firstname": "John",
          "lastname": "Smith",
          "company": "ABC INC",
          "email": "demo@abc.com",
          "cc_emails": [
            "demo1@abc.com",
            "demo2@abc.com"
          ],
          "phone": "1234567898",
          "address_1": "123 Rite Way",
          "address_2": "Unit 12",
          "address_city": "Orlando",
          "address_state": "FL",
          "address_zip": "32801",
          "address_country": "USA",
          "notes": null,
          "reference": "BARTLE",
          "options": "",
          "created_at": "2017-05-08 19:22:51",
          "updated_at": "2017-05-08 19:23:46",
          "deleted_at": "2020-03-29 15:46:00",
          "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
        }

+ Response 422 (application/json)

        {
         "id": "customer not found"
        }

## Dispute Management [/disputes]

### List Disputes [GET /underwriting/disputes/{merchantId}{?id,transaction_id,status,reason,filter,sort,order,page}]

_(please click this box ^^ for more information)_

This route handles requests for a list of disputes for the currently authenticated merchant.

+ Parameters

    + merchantId (string, optional) - The merchant ID value.

    + id (string, optional) - **Filter**: filters results by the dispute id.

    + transaction_id (string, optional) - **Filter**: filters results by the id of the dispute's associated transaction.

    + status (enum, optional) - **Filter**: filters results according to the dispute's status in the process.

        + Members
            + `INQUIRY`
            + `PENDING`
            + `WON`
            + `LOST`
            + `EVIDENCE_UPLOADED`
            + `UPLOAD_FAILED`

    + reason (enum, optional) - **Filter**: filters results according to the reason for the dispute's creation.

        + Members
            + `TECHNICAL`
            + `CLERICAL`
            + `QUALITY`
            + `FRAUD`
            + `INQUIRY`

    + sort (enum, optional) - The *property* by which the results are sorted.

        + Default: `respond_by`

        + Members
            + `respond_by`
            + `created_at`
            + `updated_at`
            + `status`

    + order (enum, optional) - The *order* in which the results are sorted.
    
        + Default: `ASC`

        + Members
            + `DESC`
            + `ASC`

    + page: `1` (number, optional) - Page number

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

    + Body
    
            {
                "total": 22,
                "per_page": 10,
                "current_page": 3,
                "last_page": 3,
                "next_page_url": null,
                "prev_page_url": "https://apiprod.fattlabs.com/underwriting/disputes/merchant1?page=2",
                "from": 21,
                "to": 22,
                "data": [
                    {
                        "id": "07ad9751-443c-11ea-8e3f-0242ac140002",
                        "transaction_id": "000e8694-d259-47ee-8fa1-bc0667e705a5",
                        "merchant_id": "merchant1",
                        "reason": "FRAUD",
                        "amount": 8888.88,
                        "status": "PENDING",
                        "respond_by": "2020-01-20T23:48:03.000Z",
                        "created_at": "2020-01-08T23:48:03.000Z",
                        "updated_at": "2020-01-08T23:48:03.000Z"
                    },
                    {
                        "id": "07dbfe08-443c-11ea-8e3f-0242ac140002",
                        "transaction_id": "aca21c84-d37e-4d47-ad32-579dfda74458",
                        "merchant_id": "merchant1",
                        "reason": "FRAUD",
                        "amount": 8888.88,
                        "status": "EVIDENCE_UPLOADED",
                        "respond_by": "2020-01-31T23:48:03.000Z",
                        "created_at": "2020-01-08T23:48:03.000Z",
                        "updated_at": "2020-01-08T23:48:03.000Z"
                    }
                ]
            }

### Upload Evidence for Dispute [POST /file/dispute]

_(please click this box ^^ for more information)_

This route handles requests to upload evidence files associated with a merchant's dispute.

+ Request (multipart/form-data; boundary=---BOUNDARY)

    The required elements within the `multipart/form-data` Request body:

    - `dispute_id`
        - The id of the dispute to associate with this evidence file.
        - Required, string.
    - `name`
        - The name value to assign to this evidence file.
        - Required, string, max of 255 characters.
    - `file`
        - The evidence file
        - Required, must be less than `10MB`, must have one of the following extensions: `.jpeg`, `.pdf`, `.png`, or `.tiff`.

    + Headers
            
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            -----BOUNDARY
            Content-Disposition: form-data; name="dispute_id"

            disputeId-1234-abcd-1234-1234
            -----BOUNDARY
            Content-Disposition: form-data; name="name"

            receipt evidence
            -----BOUNDARY
            Content-Disposition: form-data; name="file"; filename="image.png"
            Content-Type: image/png
            Content-Transfer-Encoding: base64
    
            /9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a
            HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy
            -----BOUNDARY


+ Response 201 (application/json)
    Responds with the evidence file entity that was created.

    + Body

            {
                "merchant_id": "merchant1",
                "user_id": "user1",
                "name": "receipt evidence",
                "tag": "dispute",
                "id": "b268c536-ba18-49da-83fa-914511f590f7",
                "updated_at": "2020-01-24 18:46:49",
                "created_at": "2020-01-24 18:46:48",
                "path": "dispute/b268c536-ba18-49da-83fa-914511f590f7.png",
                "public_url": "https://contractors-dev-bucket.s3.us-west-2.amazonaws.com/dispute/b268c536-ba18-49da-83fa-914511f590f7.png",
                "meta": {
                    "filesize_bytes": 7640,
                    "filesize": "0.08 kB",
                    "extension": "png",
                    "size": {
                        "width": 698,
                        "height": 165
                    },
                    "mime": "image/png"
                }
            }

### Delete Evidence for Dispute [DELETE /file/dispute/{evidenceFileId}]

_(please click this box ^^ for more information)_

This route handles requests to delete a given evidence file.

+ Parameters

    + evidenceFileId (string, required) - A unique identifier for an evidence file.

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)
    Responds with the evidence file entity that was deleted.

    + Body

            {
                "id": "b268c536-ba18-49da-83fa-914511f590f7",
                "merchant_id": "merchant1",
                "user_id": "user1",
                "name": "receipt evidence",
                "path": "dispute/b268c536-ba18-49da-83fa-914511f590f7.png",
                "public_url": "https://contractors-dev-bucket.s3.us-west-2.amazonaws.com/dispute/b268c536-ba18-49da-83fa-914511f590f7.png",
                "tag": "dispute",
                "meta": {
                    "filesize_bytes": 7640,
                    "filesize": "0.08 kB",
                    "extension": "png",
                    "size": {
                        "width": 698,
                        "height": 165
                    },
                    "mime": "image/png"
                },
                "created_at": "2020-01-24 18:46:49",
                "updated_at": "2020-02-11 17:31:03",
                "deleted_at": "2020-02-11 17:31:03"
            }

### Submit Dispute Evidence Files for Review [POST /underwriting/dispute/{disputeId}/submit]

_(please click this box ^^ for more information)_

This route handles requests to send all of a dispute's associated evidence files for review.

+ Parameters

    + disputeId (string, required) - A unique identifier of the dispute.

+ Request (application/json)

+ Response 200 (application/json)

    Responds with the dispute entity that was submitted with evidence.

    + Body

            {
                "id": "07ad9751-443c-11ea-8e3f-0242ac140002",
                "transaction_id": "000e8694-d259-47ee-8fa1-bc0667e705a5",
                "merchant_id": "merchant1",
                "reason": "FRAUD",
                "amount": 8888.88,
                "status": "EVIDENCE_UPLOADED",
                "respond_by": "2020-01-20T23:48:03.000Z",
                "created_at": "2020-01-08T23:48:03.000Z",
                "updated_at": "2020-01-08T23:48:03.000Z"
            }

+ Response 400 (application/json)

    Responds with `400` status if no evidence files have been uploaded, or if the given dispute ID cannot be found.

    + Body

            {
                "status": 400,
                "message": "No associated evidence files found for dispute 'disputeID1234'. Ensure your dispute ID value is correct, or please upload evidence files prior to submitting dispute."
            }

## Invoices [/invoice]

Generates a document that lists the contents and information behind a transaction or in other words, an invoice.
It includes information about the merchant and customer, as well as the monetary transaction.
The customer-side version of an invoice is known as a bill.

**Invoices and bills are different objects. A bill is the customer-side, while an invoice is merchant-side. Invoices contain the more security sensitive information.**

### Note About Invoice Statuses


Our invoice statuses are controlled by operations. You cannot use a route to modify a status. The statuses you may see are:

- `VOID`
- `DELETED` - invoice has a `deleted_at` date
- `DRAFT` - invoice has not been sent or viewed
- `SENT` - invoice has a `sent_at` date
- `VIEWED` - invoice has a `viewed_at` date
- `PAID` - one or more payments were applied and successful for at least the `total`
- `PARTIALLY APPLIED` - a payment was applied and succeeded for less than the `total`
- `ATTEMPTED` - a payment was attempted but failed

Example: You create an invoice with POST invoice. It is `DRAFT`. The invoice belongs to a customer with an email. Then you run PUT invoice/id/send/email - the invoice is sent via email, the current time is stored in `sent_at` and the status becomes `SENT`. 

### Create an Invoice [POST /invoice]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Creates an invoice.
Uses the `customer_id` and information about the transaction to do so, found in the body below.
Invoices from the perspective of the customer are known as a `bill`.
If `send_now` is equal to true, this invoices will send immediately along side an email to the customer.
This bill/invoice may be paid from the customer's email.
Omitting `send_now` or setting it to false will cause the invoice to be set as an unsent draft. 
Drafted invoices may be sent with `PUT invoice/{id}/send/email` or `PUT invoice/{id}/send/sms`.

+ Request (application/json)

    *More Info on Fields*
    
    * `payment_method_id` is the token of a customer's payment method.
        * Passing this will automatically pay the invoice with that payment method.
    * `files.0` in the `files` array is the id for any file, such as a picture or document from the POST file resource, which should be attached to the invoice.
    * `url` should be set to `https://omni.fattmerchant.com/#/bill/` if you want to allow the button in the invoice email sent out to be clickable and take the customer to our Fattmerchant bill pay page.
    * `invoice_date_at` is an optional field. If left blank, the value will default to the current timestamp. This field is used for the date the work was done, service was provided, or any other date the merchant wishes to track.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        * within this JSON object, some fields are respected by the Fattmerchant OMNI web platform and emailed receipts
        * `subtotal`, `tax`, `lineItems`, `memo`, `reference`
        * will be blindly stored and returned during a `GET` operation. 
        * `meta.lineItems` if supplied must be an array and can contain:
            * `price`, `quantity`, `item` (name), `details` (description), `id` 
            * `id` is optional and corresponds to the Fattmerchant Catalog Item Id (see <a href="#reference/0/catalog/create-a-catalog-item">`POST /item`</a>)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
                "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "payment_method_id":"d3050b19-77d9-44ac-9851-b1d1680a7684",
                "meta": {
                    "tax":2,
                    "subtotal":10
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id"
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":10,
                            "price": .1
                        }
                    ]
                },
                "total": "10.00",
                "url": "https://omni.fattmerchant.com/#/bill/",
                "send_now": false,
                "files": [
                    "e8ee8f1a-a5b2-11e8-88ce-7611f4940a74"
                ]
            }

+ Response 200 (application/json)

        {
            "id": "9ddcf02b-c2be-4f27-b758-dbc12b2aa924",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "total": 10,
            "meta": {
                "tax":2,
                "subtotal":10,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":10,
                        "price": .1
                    }
                ]
            },
            "status": "DRAFT",
            "sent_at": null,
            "viewed_at": null,
            "paid_at": null,
            "schedule_id": null,
            "reminder_id": null,
            "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
            "url": "https://omni.fattmerchant.com/#/bill/",
            "is_webpayment": false,
            "deleted_at": null,
            "created_at": "2017-05-08 21:32:51",
            "updated_at": "2017-05-08 21:32:51",
            "payment_attempt_failed": false,
            "payment_attempt_message": "",
            "balance_due": 10,
            "total_paid": 0,
            "payment_meta": [],
            "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            },
            "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
            },
            "files": [],
            "child_transactions": [],
            "reminder": null
        }
        
+ Response 422 (application/json)

        {
         "customer_id": [
          "The customer id field is required."
         ],
         "url": [
          "The url field is required."
         ],
         "meta": [
          "The meta field is required."
         ],
         "total": [
          "The total field is required."
         ],
         "files.0": [
          "The selected files.0 is invalid."
         ]
        }

### Pay an Invoice [POST /invoice/{id}/pay]
_(please click this box ^^ for more information)_

Once you've created an invoice you can post a payment against it. This is used if instead of using `POST /charge` for one time transactions you are implementing an invoicing flow. 
Invoices allow you to keep multiple payments grouped together with refunds and voids.
Invoice details can be edited through the PUT call but payments against the invoices are immutable.
If you need to mark an invoice paid with cash use the `POST /invoice/{id}/pay/{method}` below. 

+ Request (application/json)

    **Fields**
    
    * `apply_balance` - float, optional. default:  `invoice.total`. if supplied will create a partial payment for this invoice
    * `email_receipt` - boolean, optional default: `false`. If true will send the invoice to the `customer.email` if exists
        * if the invoice payment was successful then the email will show paid
        * if the invoice payment was not successful, the email will show the error
    * `payment_method_id` - string, optional. Override Payment Method. If supplied and valid `payment_method_id` then this will be used as the payment method for the payment.
        * If the invoice already has a payment method, it will be ignored if this value is supplied.
        * The `invoice.payment_method_id` will be changed to this value.

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
              "payment_method_id": "f27192f5-c170-451c-a45e-397acb870b15",
              "email_receipt": true,
              "apply_balance": 10
            }

+ Response 200 (application/json)

        {
            "id": "990117ce-b31f-4e76-b027-52e90b32e465",
            "merchant_id": "c8143a7b-11f0-43b9-9258-9b1f6459d0c3",
            "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
            "customer_id": "76e81366-a900-4fff-9f6b-5f30b06c2a1d",
            "total": 10,
            "meta": {
                "tax":0,
                "subtotal":10,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 10
                    }
                ]
            },
            "status": "PAID",
            "is_merchant_present": true,
            "sent_at": null,
            "viewed_at": null,
            "paid_at": "2018-08-22 01:48:27",
            "schedule_id": null,
            "reminder_id": null,
            "payment_method_id": "f27192f5-c170-451c-a45e-397acb870b15",
            "url": "http://127.0.0.1:5432/#/bill/",
            "is_webpayment": false,
            "deleted_at": null,
            "created_at": "2018-08-22 01:48:05",
            "updated_at": "2018-08-22 01:48:27",
            "due_at": null,
            "payment_attempt_failed": false,
            "payment_attempt_message": "",
            "balance_due": 0,
            "total_paid": 10,
            "payment_meta": {
                "tax": 0,
                "subtotal": 10
            },
            "customer": {
                "id": "76e81366-a900-4fff-9f6b-5f30b06c2a1d",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@fattmerchant.com",
                "cc_emails": [],
                "cc_sms": null,
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "",
                "options": null,
                "created_at": "2018-08-22 01:47:52",
                "updated_at": "2018-08-22 01:47:52",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            },
            "user": {
                "id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "system_admin": true,
                "name": "Bob Stevenson",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2018-05-31 21:22:05",
                "email_verified_at": "2017-12-14 18:34:57",
                "is_api_key": false,
                "acknowledgments": {
                    "tutorial": true,
                    "editedOnboardingInformation": true,
                    "signedApplicationPowerform": true,
                    "godviewOmniSearchTooltip": true,
                    "godviewWelcome": true
                },
                "created_at": "2017-12-14 18:34:57",
                "updated_at": "2018-07-02 22:51:45",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_default": false
            },
            "files": [],
            "child_transactions": [
                {
                    "id": "a4fb512c-55ee-49ef-bef9-ce45969d39c9",
                    "invoice_id": "990117ce-b31f-4e76-b027-52e90b32e465",
                    "reference_id": "",
                    "recurring_transaction_id": "",
                    "auth_id": null,
                    "type": "charge",
                    "source": null,
                    "is_merchant_present": true,
                    "merchant_id": "c8143a7b-11f0-43b9-9258-9b1f6459d0c3",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "customer_id": "76e81366-a900-4fff-9f6b-5f30b06c2a1d",
                    "payment_method_id": "f27192f5-c170-451c-a45e-397acb870b15",
                    "is_manual": false,
                    "success": true,
                    "message": null,
                    "meta": {
                        "tax":0,
                        "subtotal":10,
                        "lineItems": [
                            {
                                "id": "optional-fm-catalog-item-id",
                                "item":"Demo Item",
                                "details":"this is a regular demo item",
                                "quantity":1,
                                "price": 10
                            }
                        ]
                    },
                    "total": 10,
                    "method": "card",
                    "pre_auth": false,
                    "is_captured": 0,
                    "last_four": "8888",
                    "interchange_code": "",
                    "interchange_fee": null,
                    "batch_id": "",
                    "batched_at": "2018-08-21 21:48:27",
                    "emv_response": "",
                    "avs_response": "",
                    "cvv_response": "",
                    "pos_entry": "",
                    "pos_salesperson": "",
                    "receipt_email_at": "2018-08-22 01:48:27",
                    "receipt_sms_at": null,
                    "created_at": "2018-08-22 01:48:25",
                    "updated_at": "2018-08-22 01:48:27",
                    "total_refunded": 0,
                    "is_refundable": false,
                    "is_voided": false,
                    "is_voidable": true,
                    "schedule_id": null,
                    "child_captures": [],
                    "parent_auth": null,
                    "customer": {
                        "id": "76e81366-a900-4fff-9f6b-5f30b06c2a1d",
                        "firstname": "John",
                        "lastname": "Smith",
                        "company": "ABC INC",
                        "email": "demo@abc.com",
                        "cc_emails": [],
                        "cc_sms": null,
                        "phone": "1234567898",
                        "address_1": "123 Rite Way",
                        "address_2": "Unit 12",
                        "address_city": "Orlando",
                        "address_state": "FL",
                        "address_zip": "32801",
                        "address_country": "USA",
                        "notes": null,
                        "reference": "",
                        "options": null,
                        "created_at": "2018-08-22 01:47:52",
                        "updated_at": "2018-08-22 01:47:52",
                        "deleted_at": null,
                        "allow_invoice_credit_card_payments": true,
                        "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                    },
                    "child_transactions": [],
                    "files": [],
                    "payment_method": {
                        "id": "f27192f5-c170-451c-a45e-397acb870b15",
                        "customer_id": "76e81366-a900-4fff-9f6b-5f30b06c2a1d",
                        "merchant_id": "c8143a7b-11f0-43b9-9258-9b1f6459d0c3",
                        "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                        "nickname": "VISA: Steven Smith Jr. (ending in: 8888)",
                        "has_cvv": 1,
                        "is_default": 1,
                        "method": "card",
                        "person_name": "Steven Smith Jr.",
                        "card_type": "visa",
                        "card_last_four": "8888",
                        "card_exp": "042019",
                        "bank_name": null,
                        "bank_type": null,
                        "bank_holder_type": null,
                        "address_1": null,
                        "address_2": null,
                        "address_city": null,
                        "address_state": null,
                        "address_zip": "32944",
                        "address_country": "USA",
                        "purged_at": null,
                        "deleted_at": null,
                        "created_at": "2018-08-22 01:47:59",
                        "updated_at": "2018-08-22 01:47:59",
                        "card_exp_datetime": "2019-04-30 23:59:59",
                        "is_usable_in_vt": true,
                        "customer": {
                            "id": "76e81366-a900-4fff-9f6b-5f30b06c2a1d",
                            "firstname": "John",
                            "lastname": "Smith",
                            "company": "ABC INC",
                            "email": "demo@fattmerchant.com",
                            "cc_emails": [],
                            "cc_sms": null,
                            "phone": "1234567898",
                            "address_1": "123 Rite Way",
                            "address_2": "Unit 12",
                            "address_city": "Orlando",
                            "address_state": "FL",
                            "address_zip": "32801",
                            "address_country": "USA",
                            "notes": null,
                            "reference": "",
                            "options": null,
                            "created_at": "2018-08-22 01:47:52",
                            "updated_at": "2018-08-22 01:47:52",
                            "deleted_at": null,
                            "allow_invoice_credit_card_payments": true,
                            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                        }
                    },
                    "user": {
                        "id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                        "system_admin": true,
                        "name": "Bob Stevenson",
                        "email": "demo@fattmerchant.com",
                        "email_verification_sent_at": "2018-05-31 21:22:05",
                        "email_verified_at": "2017-12-14 18:34:57",
                        "is_api_key": false,
                        "acknowledgments": {
                            "tutorial": true,
                            "editedOnboardingInformation": true,
                            "signedApplicationPowerform": true,
                            "godviewOmniSearchTooltip": true,
                            "godviewWelcome": true
                        },
                        "created_at": "2017-12-14 18:34:57",
                        "updated_at": "2018-07-02 22:51:45",
                        "deleted_at": null,
                        "gravatar": "",
                        "team_admin": null,
                        "team_enabled": null,
                        "team_role": null,
                        "merchant_options": [],
                        "is_default": false
                    }
                }
            ],
            "reminder": null
        }

+ Response 422 (application/json)

        {
            "payment_method_id": [
                "The selected payment method id is invalid."
            ],
            "email_receipt": [
                "The email receipt field must be true or false."
            ],
            "apply_balance": [
                "The apply balance must be a number."
            ]
        }

### Get All Invoices [GET /invoice]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Gets the current users invoices for all customers and all transactions.
**this will only list all invoices, not all transactions.**
It will list them out in an invoice grid.
This function cannot fail. If the user has no invoices, it will just show zero invoices. `keywords[]` is a parameter that can be used to find invoice(s) based on their specific information.

+ Request (application/json)

    **`keywords[]` Parameters Below.**

    * `name` (string) ... a string of the user(s) to search for.
    For example: `invoice{?keywords[]=Troy,keywords[]=Baker}`
    * `ID` (string) ... a partial string of an ID to search for.
    * `company name` (string) ... a string of the company name(s) to search for.
    * `email` (string) ... a string of the email(s) to search for.
    * `address` (string) ... a string of the address(es) to search for.
    * `price` (string) ... a string of the price(s) to search for.
    * `schedule_id` (string) ... the ID of the schedule the invoice is associated with.
    * `payment_method` (string) ... a string of which type of payment-method the customer used. Either card or bank.

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "total": 2,
          "per_page": 25,
          "current_page": 1,
          "last_page": 4,
          "next_page_url": "http://fmapi.local/invoice?page=2",
          "prev_page_url": null,
          "from": 1,
          "to": 25,
          "data": [
            {
              "id": "8cbb929d-55d9-43b5-8d90-af3cab04ce17",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "customer_id": "17a51927-312e-47e3-9b23-412f298888e3",
              "total": 10,
                "meta": {
                    "tax":0,
                    "subtotal":10,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 10
                        }
                    ]
                },
              "status": "SENT",
              "sent_at": "2017-04-24 15:16:15",
              "viewed_at": null,
              "paid_at": null,
              "schedule_id": "e70c126c-f7b7-4673-a129-5b650f00f84a",
              "reminder_id": "a6411419-0e95-4380-9d4e-94bdaced9d14",
              "payment_method_id": "",
              "url": "http://localhost:5432/#/bill/",
              "is_webpayment": false,
              "deleted_at": null,
              "created_at": "2017-04-08 20:49:04",
              "updated_at": "2017-04-24 15:16:15",
              "payment_attempt_failed": false,
              "payment_attempt_message": "",
              "balance_due": 12,
              "total_paid": 0,
              "payment_meta": [],
              "customer": {
                "id": "17a51927-312e-47e3-9b23-412f298888e3",
                "firstname": "David",
                "lastname": "Bowie",
                "company": "ABC INC",
                "email": "john@abc.com",
                "cc_emails": null,
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "",
                "options": "",
                "created_at": "2016-12-01 16:44:33",
                "updated_at": "2016-12-01 16:44:33",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
              },
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              },
              "files": [],
              "child_transactions": [],
              "reminder": {
                "id": "a6411419-0e95-4380-9d4e-94bdaced9d14",
                "merchant_id": "",
                "user_id": "",
                "active": true,
                "count": 3,
                "rule": "FREQ=DAILY;COUNT=3;INTERVAL=5;WKST=MO;DTSTART=20170413T204904Z",
                "last_run_at": "2017-04-24 15:16:15",
                "next_run_at": null,
                "event": "InvoiceReminder",
                "meta": null,
                "payment_method_id": "",
                "customer_id": "17a51927-312e-47e3-9b23-412f298888e3",
                "created_at": "2017-04-08 20:49:04",
                "updated_at": "2017-04-24 15:16:15",
                "deleted_at": null,
                "rule_text": "every 5 days for 3 times",
                "future_occurrences": [],
                "max": 3,
                "end_at": null,
                "status": "COMPLETED"
              }
            },
            {
              "id": "2744a7fd-d354-47a0-a99e-f6f3e96bffe1",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
              "total": 77,
              "meta": {
                "lineItems": [
                  {
                    "item": "",
                    "details": "",
                    "quantity": 1,
                    "price": "77"
                  }
                ],
                "memo": "",
                "subtotal": 77,
                "tax": "",
                "type": "invoice/schedule"
              },
              "status": "VIEWED",
              "sent_at": "2017-04-08 20:49:03",
              "viewed_at": null,
              "paid_at": "2017-04-08 20:49:03",
              "schedule_id": "85211708-5995-4e2f-83c3-7017cdbee25f",
              "reminder_id": null,
              "payment_method_id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
              "url": "http://localhost:5432/#/bill/",
              "is_webpayment": false,
              "deleted_at": null,
              "created_at": "2017-04-08 20:49:02",
              "updated_at": "2017-04-24 19:38:42",
              "payment_attempt_failed": false,
              "payment_attempt_message": "",
              "balance_due": 77,
              "total_paid": 0,
              "payment_meta": {
                "lineItems": [
                  {
                    "item": "",
                    "details": "",
                    "quantity": 1,
                    "price": "77"
                  }
                ],
                "memo": "",
                "subtotal": 77,
                "tax": "",
                "type": "invoice/schedule"
              },
              "customer": {
                "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                "firstname": "BOND",
                "lastname": "BURGER",
                "company": "ABC INC",
                "email": "john@abc.com",
                "cc_emails": null,
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-03-31 17:04:27",
                "updated_at": "2017-03-31 17:04:27",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
              },
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              },
              "files": [],
              "child_transactions": [
                {
                  "id": "61b4a861-446f-45f8-b319-2ce98876751b",
                  "invoice_id": "2744a7fd-d354-47a0-a99e-f6f3e96bffe1",
                  "reference_id": "16427f4d-f33c-4e07-bfd3-beb2dfa55ca2",
                  "recurring_transaction_id": "",
                  "type": "refund",
                  "source": null,
                  "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                  "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                  "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                  "payment_method_id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
                  "is_manual": null,
                  "success": true,
                  "message": null,
                  "meta": {
                    "lineItems": [
                      {
                        "item": "",
                        "details": "",
                        "quantity": 1,
                        "price": "77"
                      }
                    ],
                    "memo": "",
                    "subtotal": 77,
                    "tax": "",
                    "type": "invoice/schedule"
                  },
                  "total": 77,
                  "method": "card",
                  "pre_auth": false,
                  "last_four": "1111",
                  "receipt_email_at": null,
                  "receipt_sms_at": null,
                  "created_at": "2017-04-24 19:38:41",
                  "updated_at": "2017-04-24 19:38:41",
                  "total_refunded": null,
                  "is_refundable": false,
                  "is_voided": null,
                  "is_voidable": false,
                  "schedule_id": "85211708-5995-4e2f-83c3-7017cdbee25f",
                  "customer": {
                    "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                    "firstname": "BOND",
                    "lastname": "BURGER",
                    "company": "ABC INC",
                    "email": "john@abc.com",
                    "cc_emails": null,
                    "phone": "1234567898",
                    "address_1": "123 Rite Way",
                    "address_2": "Unit 12",
                    "address_city": "Orlando",
                    "address_state": "FL",
                    "address_zip": "32801",
                    "address_country": "USA",
                    "notes": null,
                    "reference": "BARTLE",
                    "options": "",
                    "created_at": "2017-03-31 17:04:27",
                    "updated_at": "2017-03-31 17:04:27",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                  },
                  "child_transactions": [],
                  "files": [],
                  "payment_method": {
                    "id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
                    "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                    "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                    "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                    "nickname": "VISA: BOND BURGER (ending in: 1111)",
                    "is_default": 0,
                    "method": "card",
                    "person_name": "BOND BURGER",
                    "card_type": "visa",
                    "card_last_four": "1111",
                    "card_exp": "022020",
                    "bank_name": null,
                    "bank_type": null,
                    "bank_holder_type": null,
                    "address_1": null,
                    "address_2": null,
                    "address_city": null,
                    "address_state": null,
                    "address_zip": null,
                    "address_country": "USA",
                    "purged_at": null,
                    "deleted_at": null,
                    "created_at": "2017-04-05 15:30:05",
                    "updated_at": "2017-04-05 15:30:05",
                    "card_exp_datetime": "2020-02-29 23:59:59",
                    "customer": {
                      "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                      "firstname": "BOND",
                      "lastname": "BURGER",
                      "company": "ABC INC",
                      "email": "john@abc.com",
                      "cc_emails": null,
                      "phone": "1234567898",
                      "address_1": "123 Rite Way",
                      "address_2": "Unit 12",
                      "address_city": "Orlando",
                      "address_state": "FL",
                      "address_zip": "32801",
                      "address_country": "USA",
                      "notes": null,
                      "reference": "BARTLE",
                      "options": "",
                      "created_at": "2017-03-31 17:04:27",
                      "updated_at": "2017-03-31 17:04:27",
                      "deleted_at": null,
                      "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                    }
                  },
                  "user": {
                    "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                    "system_admin": false,
                    "name": "Demo",
                    "email": "demo@fattmerchant.com",
                    "email_verification_sent_at": "2017-03-29 15:27:19",
                    "email_verified_at": "2017-03-29 15:27:21",
                    "is_api_key": false,
                    "created_at": "2017-01-11 21:44:02",
                    "updated_at": "2017-04-24 15:41:58",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                    "team_admin": null,
                    "team_enabled": null,
                    "team_role": null
                  }
                },
                {
                  "id": "16427f4d-f33c-4e07-bfd3-beb2dfa55ca2",
                  "invoice_id": "2744a7fd-d354-47a0-a99e-f6f3e96bffe1",
                  "reference_id": "",
                  "recurring_transaction_id": "",
                  "type": "charge",
                  "source": null,
                  "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                  "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                  "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                  "payment_method_id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
                  "is_manual": null,
                  "success": true,
                  "message": null,
                  "meta": {
                    "lineItems": [
                      {
                        "item": "",
                        "details": "",
                        "quantity": 1,
                        "price": "77"
                      }
                    ],
                    "memo": "",
                    "subtotal": 77,
                    "tax": "",
                    "type": "invoice/schedule"
                  },
                  "total": 77,
                  "method": "card",
                  "pre_auth": false,
                  "last_four": "1111",
                  "receipt_email_at": null,
                  "receipt_sms_at": null,
                  "created_at": "2017-04-08 20:49:02",
                  "updated_at": "2017-04-08 20:49:02",
                  "total_refunded": 77,
                  "is_refundable": false,
                  "is_voided": false,
                  "is_voidable": false,
                  "schedule_id": "85211708-5995-4e2f-83c3-7017cdbee25f",
                  "customer": {
                    "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                    "firstname": "BOND",
                    "lastname": "BURGER",
                    "company": "ABC INC",
                    "email": "john@abc.com",
                    "cc_emails": null,
                    "phone": "1234567898",
                    "address_1": "123 Rite Way",
                    "address_2": "Unit 12",
                    "address_city": "Orlando",
                    "address_state": "FL",
                    "address_zip": "32801",
                    "address_country": "USA",
                    "notes": null,
                    "reference": "BARTLE",
                    "options": "",
                    "created_at": "2017-03-31 17:04:27",
                    "updated_at": "2017-03-31 17:04:27",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                  },
                  "child_transactions": [
                    {
                      "id": "61b4a861-446f-45f8-b319-2ce98876751b",
                      "invoice_id": "2744a7fd-d354-47a0-a99e-f6f3e96bffe1",
                      "reference_id": "16427f4d-f33c-4e07-bfd3-beb2dfa55ca2",
                      "recurring_transaction_id": "",
                      "type": "refund",
                      "source": null,
                      "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                      "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                      "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                      "payment_method_id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
                      "is_manual": null,
                      "success": true,
                      "message": null,
                      "meta": {
                        "lineItems": [
                          {
                            "item": "",
                            "details": "",
                            "quantity": 1,
                            "price": "77"
                          }
                        ],
                        "memo": "",
                        "subtotal": 77,
                        "tax": "",
                        "type": "invoice/schedule"
                      },
                      "total": 77,
                      "method": "card",
                      "pre_auth": false,
                      "last_four": "1111",
                      "receipt_email_at": null,
                      "receipt_sms_at": null,
                      "created_at": "2017-04-24 19:38:41",
                      "updated_at": "2017-04-24 19:38:41",
                      "total_refunded": null,
                      "is_refundable": false,
                      "is_voided": null,
                      "is_voidable": false,
                      "schedule_id": "85211708-5995-4e2f-83c3-7017cdbee25f",
                      "customer": {
                        "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                        "firstname": "BOND",
                        "lastname": "BURGER",
                        "company": "ABC INC",
                        "email": "john@abc.com",
                        "cc_emails": null,
                        "phone": "1234567898",
                        "address_1": "123 Rite Way",
                        "address_2": "Unit 12",
                        "address_city": "Orlando",
                        "address_state": "FL",
                        "address_zip": "32801",
                        "address_country": "USA",
                        "notes": null,
                        "reference": "BARTLE",
                        "options": "",
                        "created_at": "2017-03-31 17:04:27",
                        "updated_at": "2017-03-31 17:04:27",
                        "deleted_at": null,
                        "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                      },
                      "child_transactions": [],
                      "files": [],
                      "payment_method": {
                        "id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
                        "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                        "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                        "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                        "nickname": "VISA: BOND BURGER (ending in: 1111)",
                        "is_default": 0,
                        "method": "card",
                        "person_name": "BOND BURGER",
                        "card_type": "visa",
                        "card_last_four": "1111",
                        "card_exp": "022020",
                        "bank_name": null,
                        "bank_type": null,
                        "bank_holder_type": null,
                        "address_1": null,
                        "address_2": null,
                        "address_city": null,
                        "address_state": null,
                        "address_zip": null,
                        "address_country": "USA",
                        "purged_at": null,
                        "deleted_at": null,
                        "created_at": "2017-04-05 15:30:05",
                        "updated_at": "2017-04-05 15:30:05",
                        "card_exp_datetime": "2020-02-29 23:59:59",
                        "customer": {
                          "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                          "firstname": "BOND",
                          "lastname": "BURGER",
                          "company": "ABC INC",
                          "email": "john@abc.com",
                          "cc_emails": null,
                          "phone": "1234567898",
                          "address_1": "123 Rite Way",
                          "address_2": "Unit 12",
                          "address_city": "Orlando",
                          "address_state": "FL",
                          "address_zip": "32801",
                          "address_country": "USA",
                          "notes": null,
                          "reference": "BARTLE",
                          "options": "",
                          "created_at": "2017-03-31 17:04:27",
                          "updated_at": "2017-03-31 17:04:27",
                          "deleted_at": null,
                          "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                        }
                      },
                      "user": {
                        "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                        "system_admin": false,
                        "name": "Demo",
                        "email": "demo@fattmerchant.com",
                        "email_verification_sent_at": "2017-03-29 15:27:19",
                        "email_verified_at": "2017-03-29 15:27:21",
                        "is_api_key": false,
                        "created_at": "2017-01-11 21:44:02",
                        "updated_at": "2017-04-24 15:41:58",
                        "deleted_at": null,
                        "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                        "team_admin": null,
                        "team_enabled": null,
                        "team_role": null
                      }
                    }
                  ],
                  "files": [],
                  "payment_method": {
                    "id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
                    "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                    "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                    "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                    "nickname": "VISA: BOND BURGER (ending in: 1111)",
                    "is_default": 0,
                    "method": "card",
                    "person_name": "BOND BURGER",
                    "card_type": "visa",
                    "card_last_four": "1111",
                    "card_exp": "022020",
                    "bank_name": null,
                    "bank_type": null,
                    "bank_holder_type": null,
                    "address_1": null,
                    "address_2": null,
                    "address_city": null,
                    "address_state": null,
                    "address_zip": null,
                    "address_country": "USA",
                    "purged_at": null,
                    "deleted_at": null,
                    "created_at": "2017-04-05 15:30:05",
                    "updated_at": "2017-04-05 15:30:05",
                    "card_exp_datetime": "2020-02-29 23:59:59",
                    "customer": {
                      "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                      "firstname": "BOND",
                      "lastname": "BURGER",
                      "company": "ABC INC",
                      "email": "john@abc.com",
                      "cc_emails": null,
                      "phone": "1234567898",
                      "address_1": "123 Rite Way",
                      "address_2": "Unit 12",
                      "address_city": "Orlando",
                      "address_state": "FL",
                      "address_zip": "32801",
                      "address_country": "USA",
                      "notes": null,
                      "reference": "BARTLE",
                      "options": "",
                      "created_at": "2017-03-31 17:04:27",
                      "updated_at": "2017-03-31 17:04:27",
                      "deleted_at": null,
                      "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                    }
                  },
                  "user": {
                    "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                    "system_admin": false,
                    "name": "Demo",
                    "email": "demo@fattmerchant.com",
                    "email_verification_sent_at": "2017-03-29 15:27:19",
                    "email_verified_at": "2017-03-29 15:27:21",
                    "is_api_key": false,
                    "created_at": "2017-01-11 21:44:02",
                    "updated_at": "2017-04-24 15:41:58",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                    "team_admin": null,
                    "team_enabled": null,
                    "team_role": null
                  }
                }
              ],
              "reminder": null
            }
          ]
        }

### Find Invoice with Keywords [GET /invoice?keywords]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This function allows users reorganize, search or filter through all their invoices.
The function takes into a set of keywords selected by the user and finds all those invoices that correctly match it.
`Keywords` is an array of words that are sent into the sent URL to manipulate the search findings 
The function cannot fail; it'll just show all invoices.
Only the options below are available to be used as keywords.


+ Request (application/json)

    **`keywords[]` Parameters Below.**

    * 'sort' ... sorts the invoices => 'in:total,sent_at,viewed_at,paid_at,created_at,updated_at',
    * 'order' ... changes the invoice => 'in:ASC,DESC',
    * 'keywords' ... the array of words that alter the invoices => 'array',
    * 'startDate' ... finds invoices that begin on or after the start date entered => 'date_format:Y-m-d G:i:s',
    * 'endDate' ... finds invoices that begin before or on the end date entered => 'date_format:Y-m-d G:i:s', 
    * 'user_id' ... finds invoices of a user => 'string|max:50|exists:users,id',
    * 'customer_id' ... finds invoices belonging to a customer => 'string|max:50|exists:customers,id',
    * 'meta' ...  => 'string',
    * 'total' ... finds invoices an inputted total => 'numeric',
    * 'status' ... finds invoices with these specific statuses => 'in:DELETED,DRAFT,SENT,VIEWED,PAID,PARTIALLY APPLIED,UNPAID,ATTEMPTED'la

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "total": 2,
          "per_page": 25,
          "current_page": 1,
          "last_page": 1,
          "next_page_url": null,
          "prev_page_url": null,
          "from": 1,
          "to": 4,
          "data": [
            {
              "id": "d3189e3d-b54e-4939-b713-7fcd6d7110b1",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "customer_id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
              "total": 900,
              "meta": {
                "lineItems": [
                  {
                    "item": "",
                    "details": "",
                    "quantity": 1,
                    "price": "900"
                  }
                ],
                "memo": "",
                "subtotal": 900,
                "tax": "",
                "type": "invoice/schedule"
              },
              "status": "SENT",
              "sent_at": "2017-04-19 15:11:58",
              "viewed_at": null,
              "paid_at": null,
              "schedule_id": "604a74af-b079-4019-b99b-b7a177d88f8f",
              "reminder_id": "0d815004-11b5-411f-84bd-bcb6b796f4d7",
              "payment_method_id": "23c06bc1-7473-46fb-8d65-b8e9bde1fe75",
              "url": "http://localhost:5432/#/bill/",
              "is_webpayment": false,
              "deleted_at": null,
              "created_at": "2017-04-03 15:05:03",
              "updated_at": "2017-04-19 15:11:58",
              "payment_attempt_failed": true,
              "payment_attempt_message": "Max attempts exceeded. A previous charge was recently successful. Please review and if necessary you can try again in five minutes.",
              "balance_due": 900,
              "total_paid": 0,
              "payment_meta": [],
              "customer": {
                "id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                "firstname": "Mario",
                "lastname": "Mario",
                "company": "",
                "email": "fatttest737@gmail.com",
                "cc_emails": null,
                "phone": "5555555555",
                "address_1": "123 S ST.",
                "address_2": "",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "3222",
                "address_country": "USA",
                "notes": "",
                "reference": "",
                "options": "",
                "created_at": "2017-01-30 20:41:23",
                "updated_at": "2017-01-30 20:41:23",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a"
              },
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              },
              "files": [],
              "child_transactions": [
                {
                  "id": "05590898-079b-4fd1-b8a5-2241b3f7951c",
                  "invoice_id": "d3189e3d-b54e-4939-b713-7fcd6d7110b1",
                  "reference_id": "",
                  "recurring_transaction_id": "",
                  "type": "charge",
                  "source": null,
                  "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                  "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                  "customer_id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                  "payment_method_id": "23c06bc1-7473-46fb-8d65-b8e9bde1fe75",
                  "is_manual": null,
                  "success": false,
                  "message": "Max attempts exceeded. A previous charge was recently successful. Please review and if necessary you can try again in five minutes.",
                  "meta": {
                    "lineItems": [
                      {
                        "item": "",
                        "details": "",
                        "quantity": 1,
                        "price": "900"
                      }
                    ],
                    "memo": "",
                    "subtotal": 900,
                    "tax": "",
                    "type": "invoice/schedule"
                  },
                  "total": 900,
                  "method": "card",
                  "pre_auth": false,
                  "last_four": "1111",
                  "receipt_email_at": null,
                  "receipt_sms_at": null,
                  "created_at": "2017-04-03 15:05:03",
                  "updated_at": "2017-04-03 15:05:03",
                  "total_refunded": null,
                  "is_refundable": false,
                  "is_voided": false,
                  "is_voidable": false,
                  "schedule_id": "604a74af-b079-4019-b99b-b7a177d88f8f",
                  "customer": {
                    "id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                    "firstname": "Mario",
                    "lastname": "Mario",
                    "company": "",
                    "email": "fatttest737@gmail.com",
                    "cc_emails": null,
                    "phone": "5555555555",
                    "address_1": "123 S ST.",
                    "address_2": "",
                    "address_city": "Orlando",
                    "address_state": "FL",
                    "address_zip": "3222",
                    "address_country": "USA",
                    "notes": "",
                    "reference": "",
                    "options": "",
                    "created_at": "2017-01-30 20:41:23",
                    "updated_at": "2017-01-30 20:41:23",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a"
                  },
                  "child_transactions": [],
                  "files": [],
                  "payment_method": {
                    "id": "23c06bc1-7473-46fb-8d65-b8e9bde1fe75",
                    "customer_id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                    "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                    "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
                    "nickname": "VISA: Mario Mario (ending in: 1111)",
                    "is_default": 0,
                    "method": "card",
                    "person_name": "Mario Mario",
                    "card_type": "visa",
                    "card_last_four": "1111",
                    "card_exp": "022020",
                    "bank_name": null,
                    "bank_type": null,
                    "bank_holder_type": null,
                    "address_1": null,
                    "address_2": null,
                    "address_city": null,
                    "address_state": null,
                    "address_zip": null,
                    "address_country": "USA",
                    "purged_at": null,
                    "deleted_at": null,
                    "created_at": "2017-01-30 20:48:13",
                    "updated_at": "2017-01-30 20:48:13",
                    "card_exp_datetime": "2020-02-29 23:59:59",
                    "customer": {
                      "id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                      "firstname": "Mario",
                      "lastname": "Mario",
                      "company": "",
                      "email": "fatttest737@gmail.com",
                      "cc_emails": null,
                      "phone": "5555555555",
                      "address_1": "123 S ST.",
                      "address_2": "",
                      "address_city": "Orlando",
                      "address_state": "FL",
                      "address_zip": "3222",
                      "address_country": "USA",
                      "notes": "",
                      "reference": "",
                      "options": "",
                      "created_at": "2017-01-30 20:41:23",
                      "updated_at": "2017-01-30 20:41:23",
                      "deleted_at": null,
                      "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a"
                    }
                  },
                  "user": {
                    "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                    "system_admin": false,
                    "name": "Demo",
                    "email": "demo@fattmerchant.com",
                    "email_verification_sent_at": "2017-03-29 15:27:19",
                    "email_verified_at": "2017-03-29 15:27:21",
                    "is_api_key": false,
                    "created_at": "2017-01-11 21:44:02",
                    "updated_at": "2017-04-24 15:41:58",
                    "deleted_at": null,
                    "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                    "team_admin": null,
                    "team_enabled": null,
                    "team_role": null
                  }
                }
              ],
              "reminder": {
                "id": "0d815004-11b5-411f-84bd-bcb6b796f4d7",
                "merchant_id": "",
                "user_id": "",
                "active": true,
                "count": 3,
                "rule": "FREQ=DAILY;COUNT=3;INTERVAL=5;WKST=MO;DTSTART=20170408T150503Z",
                "last_run_at": "2017-04-19 15:11:57",
                "next_run_at": null,
                "event": "InvoiceReminder",
                "meta": null,
                "payment_method_id": "",
                "customer_id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                "created_at": "2017-04-03 15:05:03",
                "updated_at": "2017-04-19 15:11:57",
                "deleted_at": null,
                "rule_text": "every 5 days for 3 times",
                "future_occurrences": [],
                "max": 3,
                "end_at": null,
                "status": "COMPLETED"
              }
            },
            {
              "id": "a1190865-03a2-4854-8e1b-f3aa9ae7d0d8",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
              "customer_id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
              "total": 13,
              "meta": {
                "lineItems": [
                  {
                    "item": "fdas",
                    "description": "",
                    "quantity": 1,
                    "price": "13"
                  }
                ],
                "memo": "",
                "subtotal": 13,
                "tax": ""
              },
              "status": "PARTIALLY APPLIED",
              "sent_at": "2017-02-08 17:34:49",
              "viewed_at": "2017-02-08 21:20:15",
              "paid_at": null,
              "schedule_id": null,
              "reminder_id": null,
              "payment_method_id": null,
              "url": "http://localhost:5432/#/bill/",
              "is_webpayment": false,
              "deleted_at": null,
              "created_at": "2017-02-08 17:34:46",
              "updated_at": "2017-02-08 21:20:15",
              "payment_attempt_failed": false,
              "payment_attempt_message": "",
              "balance_due": 13,
              "total_paid": 0,
              "payment_meta": [],
              "customer": {
                "id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                "firstname": "Mario",
                "lastname": "Mario",
                "company": "",
                "email": "fatttest737@gmail.com",
                "cc_emails": null,
                "phone": "5555555555",
                "address_1": "123 S ST.",
                "address_2": "",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "3222",
                "address_country": "USA",
                "notes": "",
                "reference": "",
                "options": "",
                "created_at": "2017-01-30 20:41:23",
                "updated_at": "2017-01-30 20:41:23",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a"
              },
              "user": {
                "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
                "system_admin": true,
                "name": "Benji",
                "email": "boyoboy",
                "email_verification_sent_at": "2016-12-01 16:18:46",
                "email_verified_at": "2016-12-01 16:18:46",
                "is_api_key": false,
                "created_at": "2016-12-01 16:18:46",
                "updated_at": "2017-01-27 20:10:53",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/e3559808f1d54f8676e7a85227b2a6c7",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              },
              "files": [],
              "child_transactions": [],
              "reminder": null
            }
          ]
        }

### Get an invoice [GET /invoice/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Retrieves the invoice matching the given id.
Shows details about that invoice.
Can be used with the `[PUT /invoice/{id}]` call to edit en existing invoice.

+ Request (application/json)

    **`keywords[]` Parameters Below.**

    * `name` (string) ... a string of the user(s) to search for.
    For example: `invoice{?keywords[]=Troy,keywords[]=Baker}`
    * `company name` (string) ... a string of the company name(s) to search for.
    * `email` (string) ... a string of the email(s) to search for.
    * `address` (string) ... a string of the address(es) to search for.
    * `price` (string) ... a string of the price(s) to search for.
    * `schedule_id` (string) ... the ID of the schedule this invoice is attached to.
    * `payment_method` (string) ... a string of which payment method the customer used. Either card or bank. If an invoice is unpaid, `payment_method` will be null.
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "id": "9ddcf02b-c2be-4f27-b758-dbc12b2aa924",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "total": 10,
            "meta": {
                "tax":0,
                "subtotal":10,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 10
                    }
                ]
            },
          "status": "DRAFT",
          "sent_at": null,
          "viewed_at": null,
          "paid_at": null,
          "schedule_id": null,
          "reminder_id": null,
          "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
          "url": "https://omni.fattmerchant.com/#/bill/",
          "is_webpayment": false,
          "deleted_at": null,
          "created_at": "2017-05-08 21:32:51",
          "updated_at": "2017-05-08 21:32:51",
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "balance_due": 10,
          "total_paid": 0,
          "payment_meta": [],
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Demo",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null
          },
          "files": [],
          "child_transactions": [],
          "reminder": null,
          "payment_method": {
            "id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
            "is_default": 1,
            "method": "card",
            "person_name": "Steven Smith Jr.",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "042019",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "32944",
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-05-08 19:41:03",
            "updated_at": "2017-05-08 19:41:03",
            "card_exp_datetime": "2019-04-30 23:59:59",
            "customer": {
              "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": [
                "demo1@abc.com",
                "demo2@abc.com"
              ],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-05-08 19:22:51",
              "updated_at": "2017-05-08 19:23:46",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            }
          },
          "schedule": null
        }
        
+ Response 422 (application/json)

        {
         "id": [
         "The selected id is invalid."
         ]
        }

### Update an Invoice [PUT /invoice/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Once a specific invoice is pulled up, this function can alter and update that invoice.
The options of data to change are no different than when the invoice was created.
The data will then update the invoice matching the given id.
Certain changes that can be made are items, taxes, attached files, reference number and memo.
Invoices that are already fully paid may not be edited.

** Some things such as receipt emails, the invoice page, the payments page, and the Quickbooks Online integration rely on fields in some field in `meta` to correctly display or function.**

You may encounter unwanted or unusual behavior if you remove from or change these fields in `meta`.



+ Request (application/json)

    *More Info on Fields*
     * `invoice_date_at` is an optional field. If left blank when the invoice was created, the value will have defaulted to the current timestamp of creation. This field is used for the date the work was done, service was provided, or any other date the merchant wishes to track.
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
                "customer_id": "{{fmapicustomerid}}",
                "meta": {
                    "tax":0,
                    "subtotal":10,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 100
                        }
                    ]
                },
                "total": "100.00",
                "payment_method_id":"{{fmapipaymentmethodid}}",
                "url": "{{fmapipayurl}}",
                "files": []
            }
 
+ Response 200 (application/json)

        {
          "id": "9ddcf02b-c2be-4f27-b758-dbc12b2aa924",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "total": 100,
            "meta": {
                "tax":0,
                "subtotal":10,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 100
                    }
                ]
            },
          "status": "DRAFT",
          "sent_at": null,
          "viewed_at": null,
          "paid_at": null,
          "schedule_id": null,
          "reminder_id": null,
          "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
          "url": "https://omni.fattmerchant.com/#/bill/",
          "is_webpayment": false,
          "deleted_at": null,
          "created_at": "2017-05-08 21:32:51",
          "updated_at": "2017-05-08 21:42:50",
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "balance_due": 100,
          "total_paid": 0,
          "payment_meta": [],
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Demo",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null
          },
          "files": [],
          "child_transactions": [],
          "reminder": null
        }
        
+ Response 422 (application/json)

        {
         "id": [
         "The selected id is invalid."
         ]
        }

### Delete an Invoice [DELETE /invoice/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Does not delete the invoice record from the database, but rather just gives it a deleted status and updates the `deleted_at` field to the time of deletion.
In other words, this "soft" deletes an invoice making it inaccessible to the customer.
The invoice will still exist in the database with a `delete_at' set to the time of deletion.
Invoices with any value in the 'delete_at' column are inaccessible by merchants or customers.

**Cannot be undone without contacting the Fattmerchant dev team.**

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "id": "9ddcf02b-c2be-4f27-b758-dbc12b2aa924",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "total": 100,
            "meta": {
                "tax":0,
                "subtotal":10,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 100
                    }
                ]
            },
          "status": "DELETED",
          "sent_at": null,
          "viewed_at": null,
          "paid_at": null,
          "schedule_id": null,
          "reminder_id": null,
          "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
          "url": "https://omni.fattmerchant.com/#/bill/",
          "is_webpayment": false,
          "deleted_at": "2017-05-08 21:43:19",
          "created_at": "2017-05-08 21:32:51",
          "updated_at": "2017-05-08 21:43:19",
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "balance_due": 100,
          "total_paid": 0,
          "payment_meta": [],
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Demo",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null
          },
          "files": [],
          "child_transactions": [],
          "reminder": null
        }
        
+ Response 422 (application/json)

        {
         "deleted_at": [
          "The invoice is already deleted."
         ]
        }

### Send an Invoice via email [PUT /invoice/{id}/send/email]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Sends the invoice to the customer's e-mail and other CC e-mails.
To be called immediately after an invoice is created or updated.
Once an invoice is made, it won't be sent automatically, as it can be made as a draft for a future invoice.
The invoice id must exist for this method to pass.
A single invoice can be sent multiple times as a way to remind a customer of a charge.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)
 
        {
         "id": "4bbd1a64-7472-44ed-afef-02b82d3eae24",
         "merchant_id": "dee75215-b3bc-4e44-9bc5-75d0fb498b61",
         "user_id": "7c30a7f6-eabc-4355-b530-d351f8f0a4f1",
         "customer_id": "a41c93d0-e45d-4d41-b46c-f781a02019f5",
         "total": 12,
        "meta": {
            "tax":2,
            "subtotal":10,
            "lineItems": [
                {
                    "id": "optional-fm-catalog-item-id",
                    "item":"Demo Item",
                    "details":"this is a regular demo item",
                    "quantity":1,
                    "price": 10
                }
            ]
        },
         "status": "SENT",
         "sent_at": "2016-05-09 17:10:43",
         "viewed_at": null,
         "paid_at": null,
         "url": "http://127.0.0.1:5477/#/bill/",
         "deleted_at": null,
         "created_at": "2016-05-09 17:10:37",
         "updated_at": "2016-05-09 17:10:43",
         "customer": {
         "id": "a41c93d0-e45d-4d41-b46c-f781a02019f5",
         "firstname": "Jason",
         "lastname": "Mann",
         "company": "CIA",
         "email": "JasonGuy@CIA.com",
         "phone": "1234567898",
         "address_1": "123 Rite Way",
         "address_2": "Unit 12",
         "address_city": "Orlando",
         "address_state": "FL",
         "address_zip": "32801",
         "notes": "",
         "options": "",
         "created_at": "2016-04-26 13:55:21",
         "updated_at": "2016-04-26 13:55:21",
         "deleted_at": null,
         "payment_attempt_failed": false,
         "payment_attempt_message": "",
         "gravatar": "//www.gravatar.com/avatar/1b91155f027795b2d36a08b1e5e8e9df"
         },
         "user": {
         "id": "7c30a7f6-eabc-4355-b530-d351f8f0a4f1",
         "system_admin": true,
         "name": "DANIEL WALKER",
         "email": "demo@fattmerchant.com",
         "created_at": "2016-04-12 13:52:26",
         "updated_at": "2016-04-25 16:46:42",
         "deleted_at": null,
         "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8"
         },
         "child_transactions": [],
         "merchant": {
         "id": "dee75215-b3bc-4e44-9bc5-75d0fb498b61",
         "mid": "520000294774",
         "status": "ACTIVE",
         "subdomain": "demo",
         "company_name": "Fattmerchant",
         "contact_name": "Fattmerchant",
         "contact_email": "info2@fattmerchant.com",
         "contact_phone": "8555503288",
         "address_1": "25 Wall Street",
         "address_2": "Suite 1",
         "address_city": "Orlando",
         "address_state": "FL",
         "address_zip": "32801",
         "hosted_payments_token": "gfdbfed",
         "branding": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/avatars/0624acc8-c0be-45dc-a153-134da1990218.jpeg",
         "options": {
         "hosted_payments_success_note": "Thank you for your payment! It's gladly appreciated!",
         "hosted_payments_url_long": "http://localhost.app:5477/#/pay/t___-_",
         "hosted_payments_url_short": "http://bit.ly/1K34yKV",
         "hosted_payments_note": "Thank you for your payment"
         },
         "notes": "",
         "gateway_type": null,
         "gateway_name": null,
         "vendor_keys": {
         },
         "created_at": "2016-04-12 13:52:26",
         "updated_at": "2016-04-27 15:12:51",
         "deleted_at": null
         }
        }
        
+ Response 422 (application/json)
 
        {
          "id": [
            "Invoice could not be found"
          ]
        }

### Send an Invoice via sms [PUT /invoice/{id}/sms]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Sends the invoice to the customer's phone number and other CC phone numbers.
To be called immediately after an invoice is created or updated.
Once an invoice is made, it won't be sent automatically, as it can be made as a draft for a future invoice.
The invoice id must exist for this method to pass.
A single invoice can be sent multiple times as a way to remind a customer of a charge.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)
 
        {
         "id": "4bbd1a64-7472-44ed-afef-02b82d3eae24",
         "merchant_id": "dee75215-b3bc-4e44-9bc5-75d0fb498b61",
         "user_id": "7c30a7f6-eabc-4355-b530-d351f8f0a4f1",
         "customer_id": "a41c93d0-e45d-4d41-b46c-f781a02019f5",
         "total": 12,
        "meta": {
            "tax":2,
            "subtotal":10,
            "lineItems": [
                {
                    "id": "optional-fm-catalog-item-id",
                    "item":"Demo Item",
                    "details":"this is a regular demo item",
                    "quantity":1,
                    "price": 10
                }
            ]
        },
         "status": "SENT",
         "sent_at": "2016-05-09 17:10:43",
         "viewed_at": null,
         "paid_at": null,
         "url": "http://127.0.0.1:5477/#/bill/",
         "deleted_at": null,
         "created_at": "2016-05-09 17:10:37",
         "updated_at": "2016-05-09 17:10:43",
         "customer": {
         "id": "a41c93d0-e45d-4d41-b46c-f781a02019f5",
         "firstname": "Jason",
         "lastname": "Mann",
         "company": "CIA",
         "email": "JasonGuy@CIA.com",
         "phone": "1234567898",
         "address_1": "123 Rite Way",
         "address_2": "Unit 12",
         "address_city": "Orlando",
         "address_state": "FL",
         "address_zip": "32801",
         "notes": "",
         "options": "",
         "created_at": "2016-04-26 13:55:21",
         "updated_at": "2016-04-26 13:55:21",
         "deleted_at": null,
         "payment_attempt_failed": false,
         "payment_attempt_message": "",
         "gravatar": "//www.gravatar.com/avatar/1b91155f027795b2d36a08b1e5e8e9df"
         },
         "user": {
         "id": "7c30a7f6-eabc-4355-b530-d351f8f0a4f1",
         "system_admin": true,
         "name": "DANIEL WALKER",
         "email": "demo@fattmerchant.com",
         "created_at": "2016-04-12 13:52:26",
         "updated_at": "2016-04-25 16:46:42",
         "deleted_at": null,
         "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8"
         },
         "child_transactions": [],
         "merchant": {
         "id": "dee75215-b3bc-4e44-9bc5-75d0fb498b61",
         "mid": "520000294774",
         "status": "ACTIVE",
         "subdomain": "demo",
         "company_name": "Fattmerchant",
         "contact_name": "Fattmerchant",
         "contact_email": "info2@fattmerchant.com",
         "contact_phone": "8555503288",
         "address_1": "25 Wall Street",
         "address_2": "Suite 1",
         "address_city": "Orlando",
         "address_state": "FL",
         "address_zip": "32801",
         "hosted_payments_token": "gfdbfed",
         "branding": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/avatars/0624acc8-c0be-45dc-a153-134da1990218.jpeg",
         "options": {
         "hosted_payments_success_note": "Thank you for your payment! It's gladly appreciated!",
         "hosted_payments_url_long": "http://localhost.app:5477/#/pay/t___-_",
         "hosted_payments_url_short": "http://bit.ly/1K34yKV",
         "hosted_payments_note": "Thank you for your payment"
         },
         "notes": "",
         "gateway_type": null,
         "gateway_name": null,
         "vendor_keys": {
         },
         "created_at": "2016-04-12 13:52:26",
         "updated_at": "2016-04-27 15:12:51",
         "deleted_at": null
         }
        }
        
+ Response 422 (application/json)
 
        {
          "id": [
            "Invoice could not be found"
          ]
        }

### Mark an Invoice Paid in Cash or Check [POST /invoice/{id}/pay/{method}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This marks an invoice as paid manually (meaning not a processed payment, but cash, check or giftcard), rather than a credit card through the Fattmerchant system. 

It will update `paid_at` to the current time for the time the payment was received. 
Once marked as paid with cash, the invoice is no longer billable and will be marked as paid.
Doesn't have to be fully paid in cash; it can be paid partially.


+ Request (application/json)

    **Params**
    * `method` (the url query param) required must be: `cash`, `check`, or `giftcard`apiar
    * `apply_balance` numeric - for doing a partial payment. amount must be less that the invoice.total. Default is invoice.total (full amount) if apply_balance is not supplied. If supplied, the invoice will become partially paid
    * `email_receipt` boolean - whether Omni should send the receipt email to the customer attached to the invoice
    * `check_number` optional string, max length: 25
    * `driver_license` optional string, max length: 45
    * `driver_license_state` optional string, max length: 20
    * `payment_phone` optional string, max length: 20
    * `payment_note` optional string, max length: 255

    The optional strings for check_number through payment_note simply end up in the invoice.payment_meta and the child transaction.meta as well.
    These fields are simply for your own tracking and convenience. Any of these fields are available, regardless of which method you select.

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body
    
            {
                "apply_balance": 1000,
                "payment_note":"Customer walked in and handed me a huge stack of cash on Thursday"
            }

+ Response 200 (application/json)

        {
          "id": "eb1ff2cc-edaf-4261-b1d2-f4ba24d49076",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "total": 10000,
            "meta": {
                "tax":0,
                "subtotal":10000,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 10000
                    }
                ]
            },
          "status": "PARTIALLY APPLIED",
          "sent_at": null,
          "viewed_at": null,
          "paid_at": null,
          "schedule_id": null,
          "reminder_id": null,
          "payment_method_id": "d3050b19-77d9-44ac-9851-b1d1680a7684",
          "url": "https://omni.fattmerchant.com/#/bill/",
          "is_webpayment": false,
          "deleted_at": null,
          "created_at": "2017-05-10 16:05:10",
          "updated_at": "2017-05-10 16:05:26",
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "balance_due": 9000,
          "total_paid": 1000,
          "payment_meta": {
            "check_number": null,
            "driver_license": null,
            "driver_license_state": null,
            "payment_phone": null,
            "payment_note": "Customer walked in and handed me a huge stack of cash on Thursday",
            "tax":0,
            "subtotal":10000,
            "lineItems": [
                {
                    "id": "optional-fm-catalog-item-id",
                    "item":"Demo Item",
                    "details":"this is a regular demo item",
                    "quantity":1,
                    "price": 10000
                }
            ]
          },
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Demo",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null
          },
          "files": [],
          "child_transactions": [
            {
              "id": "0292381d-412e-4911-8e6e-e4a314401f5b",
              "invoice_id": "eb1ff2cc-edaf-4261-b1d2-f4ba24d49076",
              "reference_id": "",
              "recurring_transaction_id": "",
              "type": "charge",
              "source": null,
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "payment_method_id": "cash",
              "is_manual": true,
              "success": true,
              "message": null,
                "meta": {
                    "check_number": null,
                    "driver_license": null,
                    "driver_license_state": null,
                    "payment_phone": null,
                    "payment_note": "Customer walked in and handed me a huge stack of cash on Thursday",,
                    "tax":0,
                    "subtotal":10000,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 10000
                        }
                    ]
                },
              "total": 1000,
              "method": "cash",
              "pre_auth": false,
              "last_four": null,
              "receipt_email_at": "2017-05-10 16:05:26",
              "receipt_sms_at": null,
              "created_at": "2017-05-10 16:05:26",
              "updated_at": "2017-05-10 16:05:26",
              "total_refunded": null,
              "is_refundable": false,
              "is_voided": false,
              "is_voidable": false,
              "schedule_id": null,
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "cash",
                "customer_id": "",
                "merchant_id": "",
                "user_id": "",
                "nickname": "CASH (MANUAL ENTRY)",
                "is_default": 0,
                "method": "cash",
                "person_name": null,
                "card_type": null,
                "card_last_four": null,
                "card_exp": null,
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": null,
                "address_country": null,
                "purged_at": null,
                "deleted_at": "2017-01-18 20:41:21",
                "created_at": "2015-12-01 16:18:45",
                "updated_at": "2016-12-01 16:18:45",
                "card_exp_datetime": [],
                "customer": null
              },
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-03-29 15:27:19",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-04-24 15:41:58",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null
              }
            }
          ],
          "reminder": null
        }
        
+ Response 404 (application/json)

        {
         "invoice_id": [
          "id not found"
         ]
        }
 
+ Response 422 (application/json)

        [
         "A paid invoice can't be paid again."
        ]
        

## Scheduled Invoices [/invoice/schedule]


[**ARTICLE: Scheduled & Recurring Payments with the Omni API**](https://fattmerchant.zendesk.com/hc/en-us/articles/360009864153-Developers-Scheduled-Recurring-Payments-with-the-Omni-API)

### Create a Scheduled Invoice [POST /invoice/schedule/]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This creates a scheduled invoice, an invoice that runs at a certain frequency a certain amount of times.
Does not need a payment method to be created; it can be updated using `PUT /invoice/schedule/{id}`.
The `next_run_at` time is calculated and recalculated every time the scheduled invoice makes a payment.
Any e-mails tied to the invoice will get a receipt any time the invoice is paid.
Using a `PUT /invoice/schedule/{id}` call, the merchant can pause the scheduled invoice from charging.
This happens by updating the invoice's `active` status to `false`.
When a scheduled invoice is unpaused, the merchant must pick the `next_run_at` time manually.

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
    
            {
                "rule": "FREQ=DAILY;COUNT=3;DTSTART=20181126T000000Z",
                "customer_id": "{{fmapicustomerid}}",
                "total": "2.00",
                "meta": {
                    "tax":0,
                    "subtotal":2,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 2
                        }
                    ]
                },
                "url": "{{fmapipayurl}}",
                "email_notification": false,
                "files": [],
                "payment_method_id": "{{fmapipaymentmethodid}}",
            }

+ Response 200 (application/json)

        {
          "id": "a48c3a29-3a50-4803-b352-ef0bc6859177",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "active": true,
          "count": 0,
          "rule": "FREQ=DAILY;COUNT=3;DTSTART=20181126T000000Z",
          "last_run_at": null,
          "next_run_at": "2018-11-26 00:00:00",
          "event": "InvoiceGenerator",
          "payment_method_id": "bbeef9cb-07eb-4c62-8a92-ccde32cfeee3",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "created_at": "2017-05-10 18:03:28",
          "updated_at": "2017-05-10 18:03:28",
          "deleted_at": null,
          "rule_text": "daily for 3 times",
          "future_occurrences": [
            "2018-11-26 00:00:00",
            "2018-11-27 00:00:00",
            "2018-11-28 00:00:00"
          ],
          "max": 3,
          "end_at": null,
          "status": "NOT STARTED",
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "files": [],
          "invoices": [],
          "payment_method": {
            "id": "bbeef9cb-07eb-4c62-8a92-ccde32cfeee3",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
            "is_default": 1,
            "method": "card",
            "person_name": "Steven Smith Jr.",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "042019",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "32944",
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-05-10 18:03:04",
            "updated_at": "2017-05-10 18:03:04",
            "card_exp_datetime": "2019-04-30 23:59:59",
            "customer": {
              "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": [
                "demo1@abc.com",
                "demo2@abc.com"
              ],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-05-08 19:22:51",
              "updated_at": "2017-05-08 19:23:46",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            }
          },
            "meta": {
                "tax":0,
                "subtotal":2,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 2
                    }
                ]
            },
          "url": "https://omni.fattmerchant.com/#/bill/",
          "total": "2.00",
          "email_notification": false
        }
        
+ Response 422 (application/json)

        {
          "url": [
            "The url field is required."
          ],
          "total": [
            "The total field is required."
          ],
          "payment_method_id": [
            "The Payment Method could not be found"
          ]
        }

### Retrieve All Scheduled Invoices [GET /invoice/schedule]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Finds and lists all scheduled invoices under a merchant's account.
Scheduled invoices are created under `POST /invoice/schedule/`, can be edited under `PUT /invoice/schedule/{id}` and can be deleted under `DELETE /invoice/schedule/`.
The default sort is `created_at` in descending order (DESC).
More sorting and ordering parameters can be found below.

+ Request (application/json)

    ** `sort` Parameters Below.**
    
    + `last_run_at` ... sorts the scheduled invoices by the last time they ran.
    + `next_run_at` ... sorts the scheduled invoices by the next time they run.
    + `count` ... sorts the scheduled invoices numerically by the amount of times they run.
    + `created_at` ... sorts the scheduled invoices by the time they were created at.
    + `updated_at` ... sorts the scheduled invoices by the last time they were updated at.
    
    ** `order` Parameters Below.**
    
    + `DESC` ... Descending order.
    + `ASC` ... Ascending order.
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 
+ Response 200 (application/json)

        {
          "total": 2,
          "per_page": 25,
          "current_page": 1,
          "last_page": 1,
          "next_page_url": null,
          "prev_page_url": null,
          "from": 1,
          "to": 2,
          "data": [
            {
              "id": "53ad71d4-b85f-4efc-9ae1-579ff6eeb206",
              "merchant_id": "26492104-dbd0-49f7-918a-a4dcf9b2df1b",
              "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
              "active": true,
              "count": 0,
              "rule": "FREQ=DAILY;COUNT=3;DTSTART=20181126T000000Z",
              "last_run_at": null,
              "next_run_at": "2018-11-26 00:00:00",
              "event": "InvoiceGenerator",
              "payment_method_id": null,
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "created_at": "2017-05-10 17:37:50",
              "updated_at": "2017-05-10 17:37:50",
              "deleted_at": null,
              "rule_text": "daily for 3 times",
              "future_occurrences": [
                "2018-11-26 00:00:00",
                "2018-11-27 00:00:00",
                "2018-11-28 00:00:00"
              ],
              "max": 3,
              "end_at": null,
              "status": "NOT STARTED",
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "files": [],
              "invoices": [],
              "payment_method": null,
                "meta": {
                "tax":0,
                "subtotal":2,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 2
                    }
                ]
            },
              "url": "https://omni.fattmerchant.com/#/bill/",
              "total": "2.00",
              "email_notification": false
            },
            {
              "id": "af8d5ac4-ac2b-484f-8b97-3db7d8f79e35",
              "merchant_id": "26492104-dbd0-49f7-918a-a4dcf9b2df1b",
              "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
              "active": true,
              "count": 0,
              "rule": "FREQ=DAILY;COUNT=3;DTSTART=20181126T000000Z",
              "last_run_at": null,
              "next_run_at": "2018-11-26 00:00:00",
              "event": "InvoiceGenerator",
              "payment_method_id": null,
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "created_at": "2017-05-10 17:36:23",
              "updated_at": "2017-05-10 17:36:23",
              "deleted_at": null,
              "rule_text": "daily for 3 times",
              "future_occurrences": [
                "2018-11-26 00:00:00",
                "2018-11-27 00:00:00",
                "2018-11-28 00:00:00"
              ],
              "max": 3,
              "end_at": null,
              "status": "NOT STARTED",
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "files": [],
              "invoices": [],
              "payment_method": null,
              "meta": {
                "tax":0,
                "subtotal":2,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 2
                    }
                ]
              },
              "url": "https://omni.fattmerchant.com/#/bill/",
              "total": "2.00",
              "email_notification": false
            }
          ]
        }

### Edit an Invoice Schedule [PUT /invoice/schedule/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This function is used to update a pre-existing generated schedule.
Can be used to update the invoice's information, or pause the invoice by setting `active` to `false`.
If `active` is set to `false`, the scheduled invoice will have a future `next_run_at` date of `null`.
If `active` is set to `true`, the merchant will have to manually set `next_run_at` date.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
    
            {
                "total": "2.00",
                "meta": {
                    "tax":0,
                    "subtotal":2,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 2
                        }
                    ]
                },
                "payment_method_id":"{{fmapipaymentmethodid}}",
                "email_notification": false,
                "active": false
            }

 
+ Response 200 (application/json)

        {
          "id": "08ae5668-cd54-44e6-9259-b1e2cc36a212",
          "merchant_id": "068866d4-96ec-4735-b652-84e74ecb8712",
          "user_id": "6b5e0337-817d-4025-8729-6370173295a9",
          "active": true,
          "count": 1,
          "rule": "FREQ=MONTHLY;COUNT=3;DTSTART=2016-06-20 00:00:00",
          "last_run_at": "2016-09-02 15:37:02",
          "next_run_at": "2016-09-03 15:36:35",
          "event": "InvoiceGenerator",
          "payment_method_id": "b89ac300-6185-4de5-b255-fe65855dfcc9",
          "customer_id": "d647437c-da35-46f5-a6dd-956186861e03",
          "created_at": "2016-09-02 15:36:35",
          "updated_at": "2016-09-02 15:40:28",
          "deleted_at": null,
          "rule_text": "monthly for 3 times",
          "future_occurrences": [],
          "max": 3,
          "end_at": null,
          "pending": false,
          "payment_attempt_failed": false,
          "payment_attempt_message": "",
          "customer": {
            "id": "d647437c-da35-46f5-a6dd-956186861e03",
            "firstname": "Jared",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@fattmerchant.com",
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "options": "",
            "created_at": "2016-08-19 16:04:10",
            "updated_at": "2016-08-19 16:15:32",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
          },
          "invoices": [
            {
                "id": "892d6167-7488-438a-9cdc-0e6bd29c460b",
                "merchant_id": "068866d4-96ec-4735-b652-84e74ecb8712",
                "user_id": "6b5e0337-817d-4025-8729-6370173295a9",
                "customer_id": "d647437c-da35-46f5-a6dd-956186861e03",
                "total": 2,
                "meta": {
                    "tax":0,
                    "subtotal":2,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 2
                        }
                    ]
                },
              "status": "SENT",
              "sent_at": "2016-09-02 15:37:02",
              "viewed_at": null,
              "paid_at": null,
              "schedule_id": "08ae5668-cd54-44e6-9259-b1e2cc36a212",
              "payment_method_id": "",
              "url": "",
              "deleted_at": null,
              "created_at": "2016-09-02 15:37:02",
              "updated_at": "2016-09-02 15:37:02",
              "customer": {
                "id": "d647437c-da35-46f5-a6dd-956186861e03",
                "firstname": "Jared",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@fattmerchant.com",
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "options": "",
                "created_at": "2016-08-19 16:04:10",
                "updated_at": "2016-08-19 16:15:32",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
              },
              "user": {
                "id": "6b5e0337-817d-4025-8729-6370173295a9",
                "system_admin": true,
                "name": "Daniel",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2016-05-11 17:13:33",
                "email_verified_at": "2016-05-11 17:13:33",
                "created_at": "2015-07-21 21:23:42",
                "updated_at": "2016-06-01 18:46:01",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null
              },
              "child_transactions": []
            }
          ],
            "meta": {
                "tax":0,
                "subtotal":2,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 2
                    }
                ]
            },
          "url": "http://127.0.0.1:5477/#/bill/",
          "total": "2.00"
        }
        
+ Response 422 (application/json)

        {
          "customer_id": [
            "The selected customer id is invalid."
          ]
        }

### Delete a Scheduled Invoice [DELETE /invoice/schedule/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

"Soft" deletes a scheduled invoice from a merchants account.
The scheduled invoice will exist in the database, but will not be accessible by the merchant or customers.
It sets the `deleted_at` field to the time of deletion, stopping the scheduled future charges.
As of now, deleting an invoice doesn't change `active`, but will set `next_run_at` to null and `future_occurrences` will be an empty set.
Scheduled invoices with anything other than null in `deleted_at` are inaccessible by the merchant or customers.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "id": "a48c3a29-3a50-4803-b352-ef0bc6859177",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "active": true,
          "count": 0,
          "rule": "FREQ=DAILY;COUNT=3;DTSTART=20181126T000000Z",
          "last_run_at": null,
          "next_run_at": null,
          "event": "InvoiceGenerator",
          "payment_method_id": "bbeef9cb-07eb-4c62-8a92-ccde32cfeee3",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "created_at": "2017-05-10 18:03:28",
          "updated_at": "2017-05-10 18:03:28",
          "deleted_at": "2017-05-10 19:19:32",
          "rule_text": "daily for 3 times",
          "future_occurrences": [],
          "max": 3,
          "end_at": null,
          "status": "DELETED",
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "files": [],
          "invoices": [],
          "payment_method": {
            "id": "bbeef9cb-07eb-4c62-8a92-ccde32cfeee3",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
            "is_default": 1,
            "method": "card",
            "person_name": "Steven Smith Jr.",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "042019",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "32944",
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-05-10 18:03:04",
            "updated_at": "2017-05-10 18:03:04",
            "card_exp_datetime": "2019-04-30 23:59:59",
            "customer": {
              "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": [
                "demo1@abc.com",
                "demo2@abc.com"
              ],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-05-08 19:22:51",
              "updated_at": "2017-05-08 19:23:46",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            }
          },
            "meta": {
                "tax":0,
                "subtotal":2,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 2
                    }
                ]
            },
          "url": "https://omni.fattmerchant.com/#/bill/",
          "total": "2.00",
          "email_notification": false
        }
        
+ Response 422 (application/json)

        {
          "id": [
            "The schedule could not be found"
          ]
        }

## Payment Methods [/payment-method/]

### NOTE: Creating Payment Methods:

**To create a payment method please use Fattmerchant.js. If you are PCI compliant and need to use our Direct-Post route for storing PANs in OMNI, please email us or speak with your account manager.**

### NOTE: Test Cards and Bank Accounts:

When using a sandbox account on a test gateway, you may want to trigger a success or fail based on the card number you pass in.
Once you create a payment method with one of these card numbers or bank account numbers it will always trigger the success or fail thereafter when used in a charge.

**Credit cards**

|TYPE|TRIGGER SUCCESS|TRIGGER FAILURE|
|-|-|-|
|Visa| `4111111111111111`| `4012888888881881`|
|MasterCard| `5555555555554444`| `5105105105105100`|
|American Express| `378282246310005`| `371449635398431`|
|Discover| `6011111111111117`| `6011000990139424`|

**Banks**

The following will cause any charges to succeed. Any other combination will trigger a fail.

Routing Number: `021000021`

Account Number: `9876543210`

In an account with a live gateway - none of these numbers will work, all card and bank numbers will be treated as real.

### Get all Payment Methods for a Customer [GET /customer/{customerId}/payment-method]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Retreives a **non-paginated** data array of all non-deleted payment methods associated with a customer.
This route is a GET operation and can return a validation error if the customer id is invalid.
The `id` in each object is the payment method id which can be used in any route which generates a transaction like `POST charge`

Payment methods are ordered by `created_at DESC` (newest at top in index 0).

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json) 
    
        [
            {
                "id": "7e3a83ea-6770-41f7-9b28-7ea1a3ae33e7",
                "customer_id": "35e4cfa9-d87e-45fc-84da-a6bdce2c3330",
                "merchant_id": "85c58c65-4da7-4f99-acb0-afa885874572",
                "user_id": "hosted-payments",
                "nickname": "VISA: Bob Smithers (ending in: 1111)",
                "has_cvv": 0,
                "is_default": 0,
                "method": "card",
                "person_name": "Bob Smithers",
                "card_type": "visa",
                "card_last_four": "1111",
                "card_exp": "032022",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "999999",
                "address_country": null,
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-08-03 17:59:10",
                "updated_at": "2018-08-03 17:59:10",
                "card_exp_datetime": "2022-03-31 23:59:59",
                "is_usable_in_vt": true,
                "is_tokenized": true,
                "customer": {
                    "id": "35e4cfa9-d87e-45fc-84da-a6bdce2c3330",
                    "firstname": "John",
                    "lastname": "Smith",
                    "company": "ABC INC",
                    "email": "webpaymentstest@test.com",
                    "cc_emails": [],
                    "cc_sms": null,
                    "phone": "1234567898",
                    "address_1": "123 Rite Way",
                    "address_2": "Unit 12",
                    "address_city": "Orlando",
                    "address_state": "FL",
                    "address_zip": "32801",
                    "address_country": "USA",
                    "notes": null,
                    "reference": "",
                    "options": null,
                    "created_at": "2018-07-27 19:08:48",
                    "updated_at": "2018-07-27 19:08:48",
                    "deleted_at": null,
                    "allow_invoice_credit_card_payments": true,
                    "gravatar": "//www.gravatar.com/avatar/18dd69e3959903c248ac613b51bc7f8e"
                }
            },
            {
                "id": "403e043d-2971-4062-adc7-7e64f7882786",
                "customer_id": "35e4cfa9-d87e-45fc-84da-a6bdce2c3330",
                "merchant_id": "85c58c65-4da7-4f99-acb0-afa885874572",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "nickname": "personal savings, BANK INC (ending in: 3210)",
                "has_cvv": 0,
                "is_default": 1,
                "method": "bank",
                "person_name": "Bob Smith",
                "card_type": null,
                "card_last_four": "3210",
                "card_exp": null,
                "bank_name": "Bank INC",
                "bank_type": "savings",
                "bank_holder_type": "personal",
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": null,
                "address_country": null,
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-08-02 21:06:04",
                "updated_at": "2018-08-02 21:06:04",
                "card_exp_datetime": [],
                "is_usable_in_vt": true,
                "is_tokenized": true,
                "customer": {
                    "id": "35e4cfa9-d87e-45fc-84da-a6bdce2c3330",
                    "firstname": "John",
                    "lastname": "Smith",
                    "company": "ABC INC",
                    "email": "webpaymentstest@test.com",
                    "cc_emails": [],
                    "cc_sms": null,
                    "phone": "1234567898",
                    "address_1": "123 Rite Way",
                    "address_2": "Unit 12",
                    "address_city": "Orlando",
                    "address_state": "FL",
                    "address_zip": "32801",
                    "address_country": "USA",
                    "notes": null,
                    "reference": "",
                    "options": null,
                    "created_at": "2018-07-27 19:08:48",
                    "updated_at": "2018-07-27 19:08:48",
                    "deleted_at": null,
                    "allow_invoice_credit_card_payments": true,
                    "gravatar": "//www.gravatar.com/avatar/18dd69e3959903c248ac613b51bc7f8e"
                }
            }
        ]

+ Response 422 (application/json)

        {
            "id": [
                "The selected id is invalid."
            ]
        }


### Get a Payment Method By ID [GET /payment-method/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Retrieves the payment method matching the given id.
Can be used with `PUT /payment-method/{id}` to edit the already existing payment method.
Does not give back security sensitive information such as the full credit card number or security code.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json) 

        {
          "id": "6ba7babe-9906-4e7e-b1a5-f628c7badb61",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
          "is_default": 1,
          "method": "card",
          "person_name": "Steven Smith Jr.",
          "card_type": "visa",
          "card_last_four": "1111",
          "card_exp": "042019",
          "bank_name": null,
          "bank_type": null,
          "bank_holder_type": null,
          "address_1": null,
          "address_2": null,
          "address_city": null,
          "address_state": null,
          "address_zip": "32944",
          "address_country": "USA",
          "purged_at": null,
          "deleted_at": "2017-05-10 19:54:09",
          "created_at": "2017-05-10 19:54:04",
          "updated_at": "2017-05-10 19:54:09",
          "card_exp_datetime": "2019-04-30 23:59:59",
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          }
        }
        
+ Response 422 (application/json)

        {
         "id": [
           "The selected id is invalid."
         ]
        }


### Update a Payment Method [PUT /payment-method/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This function updates a `payment-method` after it already exists whether it was created through Fattmerchant.js or direct-post.

+ Request (application/json)
    
    **More Info On Payment Method Fields**

    * `is_default` boolean - not used by OMNI. this is just for the merchants' own use. We do not sort payment methods or attach any functionality based on this value
    * `person_name` string(100) (if supplied, _MUST_ have a value, not nullable)
    * `card_last_four` numeric, max:9999
    * `card_type` string(10) (`null` is accepted)
    * `card_exp` string digits:4 (if supplied, _MUST_ have a value, not nullable)
    * `has_cvv` boolean
    * `bank_name` string(255) (if supplied, _MUST_ have a value, not nullable)
    * `bank_type` string (either:'checking', or 'savings') (if supplied, _MUST_ have a value, not nullable)
    * `bank_holder_type` string (either:'personal', or 'business') (if supplied, _MUST_ have a value, not nullable)
    * `meta` any valid JSON value (including null). This will overwrite the entire meta object if supplied
    * Billing Address Fields
       * `address_1` string(255) (`null` is accepted). This field may be used for AVS.
       * `address_2` string(255) (`null` is accepted)
       * `address_city` string(255) (`null` is accepted)
       * `address_state` string size:2 (`null` is accepted)
       * `address_zip` string(16) (`null` is accepted). This field may be used for AVS.
       * `address_country` string size:3 (`null` is accepted)
    * Not Editable:
       * `card_number` (to change this field, create a new payment method)
       * `card_number` (to change this field, create a new payment method)
       * `card_cvv`  (to change this field, create a new payment method)
       * `bank_account`  (to change this field, create a new payment method)
       * `bank_routing`  (to change this field, create a new payment method)
       * `nickname` (this value is auto generated)
       * `customer_id` (currently to change this, you must create a new customer and a new payment method)

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
              "is_default": 1,
              "person_name": "Carl Junior Sr.",
              "card_type": "visa",
              "card_last_four": "1111",
              "card_exp": "032020",
              "bank_name": null,
              "bank_type": null,
              "bank_holder_type": null,
              "address_1": null,
              "address_2": null,
              "address_city": null,
              "address_state": null,
              "address_zip": "32944",
              "address_country": "USA"
            }

+ Response 200 (application/json)

        {
          "id": "6ba7babe-9906-4e7e-b1a5-f628c7badb61",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "nickname": "VISA: Carl Junior Sr. (ending in: 1111)",
          "is_default": 1,
          "method": "card",
          "person_name": "Carl Junior Sr.",
          "card_type": "visa",
          "card_last_four": "1111",
          "card_exp": "042019",
          "bank_name": null,
          "bank_type": null,
          "bank_holder_type": null,
          "address_1": null,
          "address_2": null,
          "address_city": null,
          "address_state": null,
          "address_zip": "32944",
          "address_country": "USA",
          "purged_at": null,
          "deleted_at": null,
          "created_at": "2017-05-10 19:54:04",
          "updated_at": "2017-05-10 19:54:04",
          "card_exp_datetime": "2019-04-30 23:59:59",
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          }
        }

+ Response 422 (application/json)

        {
          "id": [
            "The selected id is invalid."
          ]
        }


### Delete a Customer's Payment Method [DELETE /payment-method/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This function deletes a `payment-method` of customer.
This doesn't actually delete the `payment-method` from the database, but doesn't allow the merchant to access it anymore.
The `deleted_at` field in the database for the payment method is updated to the time of deletion.
Any card with a `delete_at` of anything other than `null` is inaccessible outside of the database.
Saved cards that haven't been used for more than six-months will be automatically deleted over time completely from the database.

+ Request (application/json)
    
    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "id": "6ba7babe-9906-4e7e-b1a5-f628c7badb61",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
          "is_default": 1,
          "method": "card",
          "person_name": "Steven Smith Jr.",
          "card_type": "visa",
          "card_last_four": "1111",
          "card_exp": "042019",
          "bank_name": null,
          "bank_type": null,
          "bank_holder_type": null,
          "address_1": null,
          "address_2": null,
          "address_city": null,
          "address_state": null,
          "address_zip": "32944",
          "address_country": "USA",
          "purged_at": null,
          "deleted_at": "2017-05-10 19:54:09",
          "created_at": "2017-05-10 19:54:04",
          "updated_at": "2017-05-10 19:54:04",
          "card_exp_datetime": "2019-04-30 23:59:59",
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          }
        }
        
+ Response 422 (application/json)

        {
          "id": [
            "The selected id is invalid."
          ]
        }


## Password Resets [/forgot]

Sometimes a user will need to reset their password.
These functions trigger the password to be reset, verify the user, and allow the user to submit the new password.


### Initiate Password Reset [POST /forgot]
_(please click this box ^^ for more information)_
**Note: No Authentication Token Required**

This function is used to initiate resetting a user's password.
Takes in the e-mail of the user and creates a reset URL with a token of the merchant.
Afterwards, creates the reset password request in the database.
If the e-mail is not recognized the web page will return "e-mail not recognized".
This is to be used in conjunction with `[GET /reset/{token}]` and `[POST /reset/{token}]`.

+ Request (application/json)
 
    **Attributes**
 
    * `email` (required, string): The e-mail of an existing user.
    * `url` (required, string): The URL login reset URL that gets appended with the merchant's token.
 

    + Headers
 
            Accept: application/json

    + Body

            {
             "email": "demo@fattmerchant.com",
             "url": "http://127.0.0.1:5667/#/reset/"
            }
 

+ Response 200 (application/json)

        [
         "email sent"
        ]
        
+ Response 422 (application/json)

        {
          "url": [
            "The url field is required."
          ],
          "email": [
            "The selected email is required."
          ]
        }


### Verify Password Reset Token [GET /reset/{token}]
_(please click this box ^^ for more information)_
**Note: No Authentication Token Required**

Verification step for password reset.
Determines if the given token in the URL is correct or not.
Prevents the user from entering a new password without valid access.
Returns a "404 page not found" error if the token is wrong.

+ Request (application/json)
 
    + Headers
 
            Accept: application/json

+ Response 200 (application/json)

        {
         "token": "d84da733-ca18-4c73-b06f-8f7cbb356721",
         "user_id": "7c30a7f£6-eabc-4355-b530-d351f8f0a4f1",
         "email": "demo@fattmerchant.com",
         "reset_at": null,
         "created_at": "2016-04-19 16:22:10",
         "updated_at": "2016-04-19 16:22:10"
        }
        
+ Response 422 (application/json)

        {
         "token": [
         "The selected token is invalid."
         ]
        }


### Reset Password [POST /reset/{token}]
_(please click this box ^^ for more information)_
**Note: No Authentication Token Required**

Finalizes the password reset process.
Takes in the new password and confirmation of that password from the user.
Verifies the user token is valid.
Afterwards, it is encrypted and then stored in the database.
Creates an entry under the `password_reset` table.

**Attributes**
 
* `password` (required, string): The new password the merchant has chosen.
* `password_confirmation` (required, string): The same new password to make sure the user entered it in correctly. 

+ Request (application/json)

    + Headers
 
            Accept: application/json

    + Body

            {
             "password": "bottomline", 
             "password_confirmation": "bottomline"
            }
 
+ Response 200 (application/json)

        [
         {
         "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudCI6ImRlZTc1MjE1LWIzYmMtNGU0NC05YmM1LTc1ZDBmYjQ5OGI2MSIsInN1YiI6IjdjMzBhN2Y2LWVhYmMtNDM1NS1iNTMwLWQzNTFmOGYwYTRmMSIsImlzcyI6Imh0dHA6XC9cL2ZtYXBpLmxvY2FsXC9yZXNldFwvZDg0ZGE3MzMtY2ExOC00YzczLWIwNmYtOGY3Y2JiMzU2NzIxIiwiaWF0IjoxNDYxMDgzMDQzLCJleHAiOjE0NjExNjk0NDMsIm5iZiI6MTQ2MTA4MzA0MywianRpIjoiMjNjZjU1MWQyZDllNDA4ODA1ZjQ5MWE1YjI5ZjY2YTQifQ.Io7dLSUBayeRbgZEkq60M3b7hmVzuWLEpj0r5bE7hYk",
         "user": {
         "id": "7c30a7f6-eabc-4355-b530-d351f8f0a4f1",
         "system_admin": true,
         "name": "DANIEL WALKER",
         "email": "demo@fattmerchant.com",
         "created_at": "2016-04-12 13:52:26",
         "updated_at": "2016-04-19 16:24:02",
         "deleted_at": null,
         "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
         "team_admin": true,
         "team_enabled": true
         },
         "merchant": {
         "id": "dee75215-b3bc-4e44-9bc5-75d0fb498b61",
         "mid": "520000294774",
         "status": "ACTIVE",
         "subdomain": "demo",
         "company_name": "Fattmerchant",
         "contact_name": "Fattmerchant",
         "contact_email": "info@fattmerchant.com",
         "contact_phone": "8555503288",
         "address_1": "25 Wall Street",
         "address_2": "Suite 1",
         "address_city": "Orlando",
         "address_state": "FL",
         "address_zip": "32801",
         "hosted_payments_token": null,
         "branding": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/avatars/0624acc8-c0be-45dc-a153-134da1990218.jpeg",
         "options": null,
         "gateway_type": null,
         "gateway_name": null,
         "created_at": "2016-04-12 13:52:26",
         "updated_at": "2016-04-12 13:52:26",
         "deleted_at": null
         }
         }
        ]
        
+ Response 422 (application/json)

        {
         "token": [
            "The selected token is invalid."
         ]
        }

## Reports [/query]


### Get List of Deposits [GET /query/deposit]
_(please click this box ^^ for more information)_
Shows list of your merchant's deposits. Results may be filtered by specifying a date range; for example, to filter by a date range, query `/deposit?page=1&startDate=2019-01-01&endDate=2019-01-02` to search between January 1st, 2019 and January 2nd, 2019.

+ Request (application/json)

    **Request Parameters**

    + `startDate` (string, required, YYYY-MM-DD HH:mm:ss) ... no results before this date will be returned
    + `endDate` (string, required, YYYY-MM-DD HH:mm:ss) ... no results after this date will be returned
    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json) 

        {
          "data": [
            {
              "batched_at": "2019-01-01",
              "batch_id": "00001",
              "last_transaction": "2019-01-01T18:38:00.000Z",
              "count": 29,
              "sum": 1379.65,
              "avg": 47.57,
              "min": 10,
              "max": 199.93,
              "std": 33.82
            },
            {
              "batched_at": "2019-01-02",
              "batch_id": "00002",
              "last_transaction": "2019-01-02T17:28:00.000Z",
              "count": 18,
              "sum": 706,
              "avg": 39.22,
              "min": 10,
              "max": 75,
              "std": 12.9
            }
          ]
        }


### Get Detail of Specific Deposit [GET /query/depositDetail]
_(please click this box ^^ for more information)_
Shows granular detail about a specific deposit. As deposits may sometimes have the same batch id, be sure to use batchId, startDate, and endDate when making your query. For example, a query for the first of the previous example's batches would look like this: `{apiUrl}/depositDetail?batchId=00001&startDate=2019-01-01%2000%3A00%3A00&endDate=2019-01-01%2023%3A59%3A59`, where we are searching for the deposit with `batchId=00001`, `startDate=2019-01-01 00:00:00`, and `endDate=2019-01-01 23:59:59`.

+ Request (application/json)

    **Request Parameters**

    + `batchId` (string, required) ... the id of the batch you are querying
    + `startDate` (string, required, YYYY-MM-DD HH:mm:ss) ... no results before this date will be returned
    + `endDate` (string, required, YYYY-MM-DD HH:mm:ss) ... no results after this date will be returned
    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json) 

        {
          "data": [
            {
              "batched_at": "2019-01-01",
              "batch_id": "00001",
              "auth_id": "654321",
              "created_at": "2019-01-01T18:38:00.000Z",
              "total": 40,
              "method": "card",
              "last_four": "1896",
              "card_type": "visa",
              "fees": 0.47
            },
            {
              "batched_at": "2019-01-01",
              "batch_id": "00001",
              "auth_id": "123456",
              "created_at": "2019-01-01T17:59:00.000Z",
              "total": 41,
              "method": "card",
              "last_four": "3243",
              "card_type": "mcrd",
              "fees": 0.47
            },
            {
              "batched_at": "2019-01-01",
              "batch_id": "00001",
              "auth_id": "123456",
              "created_at": "2019-01-01T17:49:00.000Z",
              "total": 35,
              "method": "card",
              "last_four": "0637",
              "card_type": "visa",
              "fees": 0.47
            },
            // [etc]
          ]
        }


### Get transaction id for specific Deposit Detail auth id add report [GET /query/deposit/{auth_id}/transaction]
_(please click this box ^^ for more information)_
Looks up a transaction id for a specific deposit detail datum using the auth_id. This can be helpful if you are creating a report and need specific information about the original transaction that does not exist on the deposit detail datum.

For example, a query to to look up the first transaction of the previous example's data would look like this: `{apiUrl}/deposit/654321/transaction`

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json) 

        { 
          "id":"eb5353af-c246-4e9a-8115-c0219f6566ca"
        }


### Team Summary [GET /query/team-summary]
_(please click this box ^^ for more information)_
**Note: Authentication Token, Active Team Required**

Returns a list of stats about the current team.

Supplies a count of a team's successful charges, refunds, failed charges, invoices, scheduled invoices, customers, users and files.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
            "charge_count_success": 3,
            "refund_count_success": 0,
            "charge_count_fail": 1,
            "invoice_count": 56,
            "scheduled_invoice_count": 0,
            "customer_count": 222,
            "user_count": 11,
            "file_count": 3
        }

## Self [/self]

These functions have to do with gathering, altering and creating information about the user.
Users belong to a merchant.
Merchants can have multiple users tied to it, known as teams.
Teams have admins that control who has what permissions on the team.
This function retrieves both the information of the user and the information of their merchant.
Since a user can be involved in multiple merchants, it will only open the merchant team associated with the current token.

### Get Self and Team's Info [GET /self]
_(please click this box ^^ for more information)_

**Note: Authentication Token Required**

Also known as `GET /`.
Once selected, this function will return information about the user.
Any information from `POST /self` and `PUT /self` with be retrieved, as well as information about the merchant the user belongs to.
This will only return general information about the team.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json) 

        {
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": false,
            "name": "Demo",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-03-29 15:27:19",
            "email_verified_at": "2017-03-29 15:27:21",
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-04-24 15:41:58",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_role": "admin",
            "team_admin": true,
            "team_enabled": true
          },
          "merchant": {
            "id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "mid": "520000294774",
            "status": "ACTIVE",
            "subdomain": "demo",
            "company_name": "Here",
            "contact_name": "Fattmerchant",
            "contact_email": "demo737@fattmerchant.com",
            "contact_phone": "8555503288",
            "address_1": "25 Wall Street",
            "address_2": "Suite 1",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "hosted_payments_token": "okay",
            "plan": {
              "id": "d619a0cc-b7e1-11e6-a0aa-08002777c33d",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "",
              "name": "premium",
              "created_at": "2016-12-01 16:18:46",
              "updated_at": "2016-12-01 16:18:46"
            },
            "options": {
              "default_dashboard": "Summary",
              "social": {
                "website_url": "http://google.com",
                "facebook_url": "http://google.com",
                "instagram_url": "http://google.com",
                "twitter_url": "http://google.com",
                "linkedin_url": "http://google.com"
              },
              "hosted_payments_url_long": "http://localhost:5432/#/pay/okay",
              "hosted_payments_url_short": "",
              "hosted_payments_success_note": "31",
              "hosted_payments_note": "12"
            },
            "gateway_type": "test",
            "processor": "Vantiv",
            "product_type": "Terminal",
            "welcome_email_sent_at": null,
            "created_at": "2016-12-01 16:18:46",
            "updated_at": "2017-04-21 20:15:12",
            "deleted_at": null,
            "gateway_name": null,
            "branding": {
              "id": "af82b215-6081-42b0-b494-fbda189ce8f9",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "name": "",
              "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/branding/af82b215-6081-42b0-b494-fbda189ce8f9.png",
              "tag": "branding",
              "meta": {
                "filesize_bytes": 3938556,
                "filesize": "3.94 MB",
                "extension": "png",
                "size": {
                  "width": 3072,
                  "height": 1728
                },
                "mime": "image/png"
              },
              "created_at": "2017-04-19 15:50:41",
              "updated_at": "2017-04-19 15:50:52",
              "deleted_at": null
            },
            "allow_ach": true
          }
        }
        
+ Response 401 (application/json)

        {
         "error": "token_expired"
        }

### Update Your User Info [PUT /self]
_(please click this box ^^ for more information)_

**Note: Authentication Token Required**

Allows the user to update their user information.
Typically used with `GET /self` to view the information before updating it.
Called after `POST /self`, this function fills in more details about the user.
Allows the user to attach a billing address to their account.
`email` must be unique and not used by another user.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
              "total": "2",
              "phone": "3452333212",
              "firstname": "daniel",
              "lastname": "walker",
              "address_zip": "32413",
              "response": "Api Error Occurred.",
              "email": "demo@abc.com",
              "useBillingAddress": true,
              "formValid": false,
              "formPending": false,
              "bank_type": "checking",
              "bank_holder_type": "personal",
              "address_country": "USA",
              "saving": false,
              "state": "",
              "person_name": "daniel walker",
              "method": "card",
              "card_number": "4111111111111111",
              "card_exp": "0320",
              "address_1": "123 adsf",
              "address_city": "ofad",
              "url": "http://localhost:5432/#/bill/",
              "address_state": "FL",
              "rule": "FREQ=MONTHLY;DTSTART=20170426T190837Z"
            }

+ Response 200 (application/json)

        {
          "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "system_admin": false,
          "name": "Demo",
          "email": "demo@fattmerchant.com",
          "email_verification_sent_at": "2017-03-29 15:27:19",
          "email_verified_at": "2017-03-29 15:27:21",
          "created_at": "2017-01-11 21:44:02",
          "updated_at": "2017-04-24 15:41:58",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
          "team_role": "admin",
          "team_admin": true,
          "team_enabled": true
        }
        
+ Response 422 (application/json)

        {
          "email": [
            "The email has already been taken."
          ]
        }
 
### Create a User Account - Self Registration [POST /self]
_(please click this box ^^ for more information)_

**Note: No Authentication Token Required**

The API call to make a new user account.
This function inputs a new user's information, verifies them and automatically logs them in.
Only fills in login details.
`PUT /self` is used to fill in more details about the user's background.
After the user information is entered, the user will receive an e-mail to verify their account.

This is one of two ways to make a user account.
The other method is to have a team admin make a user account.
Requires a `name`, `email`, `password` and `password_confirmation`.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
             "email": "john@abc.com",
             "password": "bottomline",
             "password_confirmation": "bottomline",
             "name": "DANIEL WALKER"
             "URL": "http://localhost:5477/#/register/"
            }

+ Response 200 (application/json)

        [
         {
         "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudCI6bnVsbCwic3ViIjoiZTEwYzg2OWYtZGFmZC00MmQ0LWJjZmItMTM5YjJiOGNhMTY3IiwiaXNzIjoiaHR0cHM6XC9cL2FwaWRldjAxLmZhdHRsYWJzLmNvbVwvc2VsZiIsImlhdCI6MTQ2MzE2MzQ5NywiZXhwIjoxNDYzMjQ5ODk3LCJuYmYiOjE0NjMxNjM0OTcsImp0aSI6ImM2MzZlNTI3OThjNWE3MWQwYmRmMzU2ZGRlYjBmYjFiIn0.nI35JMEPuMoiW_mgvBV5bqKdEYI28lE4a2HyW2KnJjA",
         "user": {
         "name": "Daniel Walker",
         "email": "JAAASON@fattmerchant.com",
         "id": "e10c869f-dafd-42d4-bcfb-139b2b8ca167",
         "updated_at": "2016-05-13 18:18:17",
         "created_at": "2016-05-13 18:18:17",
         "email_verification_sent_at": "2016-05-13 18:18:17",
         "gravatar": "//www.gravatar.com/avatar/acd8040614c912043ee5dcf1748b06d5",
         "team_admin": null,
         "team_enabled": null
         },
         "merchant": null
         }
        ]
        
+ Response 422 (application/json)

        {
          "name": [
            "The name field is required."
          ],
          "email": [
            "The email has already been taken."
          ],
          "password": [
            "The password field is required."
          ]
        }

### Check if E-Mail Exists [GET /self/exists?email={email}]
_(please click this box ^^ for more information)_

**Note: No Authentication Token Required**

This call verifies if the inputted `email` is valid.
Called during the `POST /self` and `PUT /self` verification processes.
Using the user's `email`, this function checks if it already belongs to another user in the database.
If `email` already exists, the process will pass back `true`.
If `email` not found, it will return "user cannot be found".

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
             "email": "demo@fattmerchant.com", 
             "password": "bottomline",
             "password_confirmation": "bottomline",
             "name": "Daniel Walker"
            }
 
+ Response 200 (application/json)

        {
          true
        }
        
+ Response 404 (application/json)

        {
         "email": [
          "The user cannot be found"
         ]
        }
        
### Resend Verification E-Mail [PUT /self/verify/resend]
_(please click this box ^^ for more information)_

**Note: Authentication Token Required**

Resends the verification e-mail for a new user.
`POST /self` function sends out a verification e-mail to the newly created user, this call resends that e-mail.
This is useful in cases where the e-mail never arrives. 
Updates `email_verification_sent_at` to the current time.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
             "email": "demo@fattmerchant.com", 
             "password": "bottomline",
             "password_confirmation": "bottomline",
             "name": "Daniel Walker"
            }

+ Response 200 (application/json)

        {
          "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "system_admin": false,
          "name": "demo",
          "email": "demo@fattmerchant.com",
          "email_verification_sent_at": "2017-05-12 18:07:27",
          "email_verified_at": "2017-03-29 15:27:21",
          "created_at": "2017-01-11 21:44:02",
          "updated_at": "2017-05-12 18:07:27",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
          "team_role": "admin",
          "team_admin": true,
          "team_enabled": true
        }
        
+ Response 404 (application/json)

        [
         "option_not_found"
        ]

### Verify E-mail Token [PUT /self/verify/{token}]
_(please click this box ^^ for more information)_

**Note: No Authentication Token Required**

Once an account is made, a `token` is created and sent to the user's `email`.
This function checks if the token is valid.
This verifies that the user has access to that e-mail.
Once passed, changes `email_verified_at` to the current time.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
         "email_verification": [
           "The user is verified"
         ]
        }
        
+ Response 404 (application/json)

        {
         "email_verification": [
           "The user cannot be found"
         ]
        }

## Teams [/team]

Merchants can have multiple users tied to it, known as a `team`.
Teams are meant to give different logins and access to users that are working together.
Team members have `team_role` that give them different levels of access over the team.
Team members with `admin` as their `team_role` control the roles of the other team members.

**Available Team Roles**
* `Admin` - Has access to everything.
* `Staff` - Has access `item`, `customer`, `invoice` and `transaction' calls.
* `Full` - Has access to everything, except `team` calls, Webpayments and certain apps.
* `Sales` - Has access to `customer`, `transaction` and `invoice` calls.
* `Reporting` - Has access to `reporting` and `transaction` GET calls.

### Create a Team [POST /team]
_(please click this box ^^ for more information)_

**Note: Authentication Token Required**

This call makes a new merchant team.
Automatically sets the user's `team_role` to `admin` of the team.
From there they can add new users under that team and set their roles.
Will re-authenticate the user with a new `token` associated with that team. 
Requires a `company_name` and `contact_email` at minimum.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
              "company_name": "Fattmerchant",
              "contact_name": "Fattmerchant",
              "contact_email": "info2@fattmerchant.com",
              "contact_phone": "8555503288",
              "address_1": "25 Wall Street",
              "address_2": "Suite 1",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801"
            }

+ Response 200 (application/json)

        [
          {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudCI6ImFhNzc2NmIyLTI0MmYtNDNiOS05NDc2LTNjOTAxOGYwY2U1MiIsInN1YiI6ImI1OGQ3ZWVlLWU2OGQtNGQxMi1hMWY4LTYyZjVlNzEzODJhZSIsImlzcyI6Imh0dHA6XC9cL2ZtYXBpLmxvY2FsXC90ZWFtIiwiaWF0IjoxNDk0ODY3NzU3LCJleHAiOjE0OTQ5NTQxNTcsIm5iZiI6MTQ5NDg2Nzc1NywianRpIjoiNzA1MmNkZWQ3NDA2ZDgyNDAxN2MzNTE1YzVhZGU3ZWYifQ.B4bcNQIcHTimpHW2hlJtnPOodAgsm3C-khfkphphDzo",
            "user": {
              "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "system_admin": false,
              "name": "demo",
              "email": "demo@fattmerchant.com",
              "email_verification_sent_at": "2017-05-15 16:30:23",
              "email_verified_at": "2017-03-29 15:27:21",
              "created_at": "2017-01-11 21:44:02",
              "updated_at": "2017-05-15 16:30:23",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
              "team_role": "admin",
              "team_admin": true,
              "team_enabled": true
            },
            "merchant": {
              "id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
              "mid": "",
              "status": "PENDING",
              "subdomain": "",
              "company_name": "Fattmerchant",
              "contact_name": "Fattmerchant",
              "contact_email": "info2@fattmerchant.com",
              "contact_phone": "8555503288",
              "address_1": "25 Wall Street",
              "address_2": "Suite 1",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "hosted_payments_token": null,
              "plan": null,
              "options": null,
              "gateway_type": null,
              "processor": "",
              "product_type": "",
              "welcome_email_sent_at": null,
              "created_at": "2017-05-15 17:02:37",
              "updated_at": "2017-05-15 17:02:37",
              "deleted_at": null,
              "gateway_name": null,
              "branding": null,
              "allow_ach": false
            }
          },
          {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudCI6ImRkMzZiOTM2LTFlYjctNGVjZS1iZWJjLWI1MTRjNmEzNmViZCIsInN1YiI6ImI1OGQ3ZWVlLWU2OGQtNGQxMi1hMWY4LTYyZjVlNzEzODJhZSIsImlzcyI6Imh0dHA6XC9cL2ZtYXBpLmxvY2FsXC90ZWFtIiwiaWF0IjoxNDk0ODY3NzU3LCJleHAiOjE0OTQ5NTQxNTcsIm5iZiI6MTQ5NDg2Nzc1NywianRpIjoiNzA1MmNkZWQ3NDA2ZDgyNDAxN2MzNTE1YzVhZGU3ZWYifQ._3rlhZzUyind1W138w4O7BjHYVlAOjUpgkmweSekKKE",
            "user": {
              "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "system_admin": false,
              "name": "demo",
              "email": "demo@fattmerchant.com",
              "email_verification_sent_at": "2017-05-15 16:30:23",
              "email_verified_at": "2017-03-29 15:27:21",
              "created_at": "2017-01-11 21:44:02",
              "updated_at": "2017-05-15 16:30:23",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
              "team_role": "admin",
              "team_admin": true,
              "team_enabled": true
            },
            "merchant": {
              "id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "mid": "520000294774",
              "status": "ACTIVE",
              "subdomain": "demo",
              "company_name": "Here",
              "contact_name": "Fattmerchant",
              "contact_email": "demo737@fattmerchant.com",
              "contact_phone": "8555503288",
              "address_1": "25 Wall Street",
              "address_2": "Suite 1",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "hosted_payments_token": "okay",
              "plan": {
                "id": "d619a0cc-b7e1-11e6-a0aa-08002777c33d",
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "",
                "name": "premium",
                "created_at": "2016-12-01 16:18:46",
                "updated_at": "2016-12-01 16:18:46"
              },
              "options": {
                "default_dashboard": "Summary",
                "social": {
                  "website_url": "http://google.com",
                  "facebook_url": "http://google.com",
                  "instagram_url": "http://google.com",
                  "twitter_url": "http://google.com",
                  "linkedin_url": "http://google.com"
                },
                "hosted_payments_url_long": "http://localhost:5432/#/pay/okay",
                "hosted_payments_url_short": "",
                "hosted_payments_success_note": "31",
                "hosted_payments_note": "12"
              },
              "gateway_type": "test",
              "processor": "Vantiv",
              "product_type": "Terminal",
              "welcome_email_sent_at": null,
              "created_at": "2016-12-01 16:18:46",
              "updated_at": "2017-04-21 20:15:12",
              "deleted_at": null,
              "gateway_name": null,
              "branding": {
                "id": "af82b215-6081-42b0-b494-fbda189ce8f9",
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "name": "",
                "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/branding/af82b215-6081-42b0-b494-fbda189ce8f9.png",
                "tag": "branding",
                "meta": {
                  "filesize_bytes": 3938556,
                  "filesize": "3.94 MB",
                  "extension": "png",
                  "size": {
                    "width": 3072,
                    "height": 1728
                  },
                  "mime": "image/png"
                },
                "created_at": "2017-04-19 15:50:41",
                "updated_at": "2017-04-19 15:50:52",
                "deleted_at": null
              },
              "allow_ach": true
            }
          }
        ]
        
+ Response 422 (application/json)

        {
         "company_name": [
         "The company name field is required."
         ],
         "contact_email": [
         "The contact email field is required."
         ]
        }

### Edit Your Merchant Team's Info [PUT /team]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

This function allows a user to edit the information, such as address and name, of a merchant team.
This only works for team members with `admin` as their `team_role`.
This call does not change team member information.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
             "company_name": "Fattmerchant",
             "contact_name": "Fattmerchant",
             "contact_email": "info2@fattmerchant.com",
             "contact_phone": "8555503288",
             "address_1": "25 Wall Street",
             "address_2": "Suite 1",
             "address_city": "Orlando",
             "address_state": "FL",
             "address_zip": "32801"
            }

+ Response 200 (application/json)

        {
          "id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
          "mid": "",
          "status": "PENDING",
          "subdomain": "",
          "company_name": "Fattmerchant",
          "contact_name": "Fattmerchant",
          "contact_email": "info2@fattmerchant.com",
          "contact_phone": "8555503288",
          "address_1": "25 Wall Street",
          "address_2": "Suite 1",
          "address_city": "Orlando",
          "address_state": "FL",
          "address_zip": "32801",
          "hosted_payments_token": null,
          "plan": {
            "id": "f92fee2b-fdae-4474-988c-c8f2df92772a",
            "merchant_id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "name": null,
            "created_at": "2017-05-15 18:41:25",
            "updated_at": "2017-05-15 18:41:25"
          },
          "options": null,
          "gateway_type": null,
          "processor": "",
          "product_type": "",
          "welcome_email_sent_at": null,
          "created_at": "2017-05-15 17:02:37",
          "updated_at": "2017-05-15 18:41:25",
          "deleted_at": null,
          "gateway_name": null,
          "branding": null,
          "allow_ach": false
        }
        
### Team Branding [POST /team/option/branding]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

This resource gives merchant admins the ability to change their company's `branding`.
`branding` may be uploaded as either a PNG or JPEG image file.
A merchant's `branding` will appear anywhere a merchant's object is returned.
The merchant `branding` will be securely hosted on Amazon S3 bucket and recorded in our database. 
This can be accessed using a public Amazon S3 URL.
In Omni, it will appear in the website payments page, the invoice payment page, receipt e-mails and invoice e-mails.
Requires an `image` at minimum.
If no `name` is supplied, it will be set to the `image` filename.
The response of this resource will contain the `image` URL.

**Parameters**

* `name` (string: max 255) ... An optional nickname for the uploaded photo. Typically will just be the name of the brand or company.
* `image` (file) ... This will contain the photo file of the logo that will be uploaded to Amazon S3 bucket.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer {{fmapiauthtoken}}
            Accept: application/json

    + Body

            {
             "name": "Mercedes-Benz",
             "image": "logo.png"
            }
        
+ Response 200 (application/json)

        {
          "id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
          "mid": "",
          "status": "PENDING",
          "subdomain": "",
          "company_name": "Fattmerchant",
          "contact_name": "Fattmerchant",
          "contact_email": "info2@fattmerchant.com",
          "contact_phone": "8555503288",
          "address_1": "25 Wall Street",
          "address_2": "Suite 1",
          "address_city": "Orlando",
          "address_state": "FL",
          "address_zip": "32801",
          "hosted_payments_token": null,
          "plan": {
            "id": "f92fee2b-fdae-4474-988c-c8f2df92772a",
            "merchant_id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "name": null,
            "created_at": "2017-05-15 18:41:25",
            "updated_at": "2017-05-15 18:41:25"
          },
          "options": null,
          "gateway_type": null,
          "processor": "",
          "product_type": "",
          "welcome_email_sent_at": null,
          "created_at": "2017-05-15 17:02:37",
          "updated_at": "2017-05-15 18:41:25",
          "deleted_at": null,
          "gateway_name": null,
          "branding": {
            "id": "81218dbb-74ad-480e-958e-839ced6e6962",
            "merchant_id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "name": "Bugu the Catu",
            "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/branding/81218dbb-74ad-480e-958e-839ced6e6962.png",
            "tag": "branding",
            "meta": {
              "filesize_bytes": 109524,
              "filesize": "1.1 kB",
              "extension": "png",
              "size": {
                "width": 537,
                "height": 512
              },
              "mime": "image/png"
            },
            "created_at": "2017-05-15 19:15:53",
            "updated_at": "2017-05-15 19:15:56",
            "deleted_at": null
          },
          "allow_ach": false
        }
        
+ Response 422 (application/json)

        {
          "image": [
            "The image field is required."
          ]
        }

### Find the Merchant Team's Users [GET /team/user]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

Retrieves all the users on a merchants's `team`, showing team-oriented details and `team_role`.
Used for finding all members of a team and listing them by roles.
Typically used in conjunction with `GET team/user/{id}` and `PUT team/user/{id}` to edit individual team members.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "total": 2,
          "per_page": 20,
          "current_page": 1,
          "last_page": 1,
          "next_page_url": null,
          "prev_page_url": null,
          "from": 1,
          "to": 2,
          "data": [
            {
              "id": "6b5e0337-817d-4025-8729-6370173295a9",
              "system_admin": false,
              "name": "Eric Andrews",
              "email": "demo@fattmerchant.com",
              "email_verification_sent_at": "2016-09-08 19:05:55",
              "email_verified_at": "2016-05-11 17:13:33",
              "created_at": "2015-07-21 21:23:42",
              "updated_at": "2016-09-08 19:05:55",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2",
              "team_role": "admin",
              "team_admin": true,
              "team_enabled": true
            },
            {
              "id": "372a0620-47cd-447e-9fcf-0f4671bdda26",
              "system_admin": false,
              "name": "Jacques Fu",
              "email": "jacques.fu@gmail.com",
              "email_verification_sent_at": "2016-05-11 17:13:33",
              "email_verified_at": "2016-05-11 17:13:33",
              "created_at": "2015-07-21 21:23:42",
              "updated_at": "2015-10-29 16:40:39",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/30d6b71a1803013e64894ae60ec53e34",
              "team_role": "admin",
              "team_admin": true,
              "team_enabled": true
            }
          ]
        }
        
### Create a New Team Member [POST /team/user]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

This creates a whole new user account in your merchant team.
Automatically adds the user to the merchant `team`.
Can only be used by users with `team_rule` of "admin".
This is one of two ways to create a new user account; the other being `POST /self`.
Requires a valid `email`, `password` and `name` at minimum.
If `team_role` is not selected, it will default to "full".
Used by team admins who want to add members to their merchant account who do not already have a Fattmerchant account. 

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 + Body

            {
              "email": "demo+1024@abc.com",
              "password": "bottomline",
              "password_confirmation": "bottomline",
              "name": "Bob Dylan",
              "team_role": "full",
              "team_enabled": true,
              "send_verification_email": true,
              "url": "https://omni.fattmerchant.com/#/verify/"
            }

+ Response 200 (application/json)

        {
          "id": "21a64e9e-3c13-4b85-9f85-67cb4fda808a",
          "system_admin": false,
          "name": "James",
          "email": "fatttest737@gmail.com",
          "email_verification_sent_at": null,
          "email_verified_at": null,
          "created_at": "2017-05-15 19:31:35",
          "updated_at": "2017-05-15 19:31:35",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a",
          "team_role": "full",
          "team_admin": false,
          "team_enabled": true
        }
        
+ Response 401 (application/json)

        [
         "not team admin"
        ]
 
+ Response 422 (application/json)

        {
          "name": [
            "The name field is required."
          ],
          "email": [
            "The email field is required."
          ],
          "password": [
            "The password field is required."
          ]
        }

### Create a New API Key [POST /team/apikey]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

This creates a whole new user account in your merchant team which will have `is_api_key` = `true`.
This will also return the api key value.

+ Request (application/json)

    **Allowed Fields**
    
    * `name` (string, max 255)
        * example: "api-key-1"
    * `team_role` (string, optional, default = "full")
        * allowed values: "admin", "staff", "full", "reporting"
        * **we recommend "admin" so the api key can be used for all routes**
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 + Body

            {
              "team_role": "admin",
              "name": "do not delete - zapier key"
            }

+ Response 200 (application/json)

            {
                "id": "0e5e54a5-f56b-4be5-a3a5-2e7a08155eba",
                "name": "do not delete - zapier key",
                "email": null,
                "email_verification_sent_at": null,
                "email_verified_at": null,
                "created_at": "2019-06-19 20:30:00",
                "updated_at": "2019-06-19 20:30:00",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e",
                "team_role": "admin",
                "team_admin": true,
                "team_enabled": true,
                "api_key": "THIS_VALUE_WILL_CONTAIN_JWT_STRING"
            }

+ Response 422 (application/json)

            {
                "team_role": [
                    "The selected team role is invalid."
                ]
            }
            
+ Response 422 (application/json)

            {
                "name": [
                    "The name may not be greater than 255 characters."
                ]
            }

### List API Keys [GET /team/apikey]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

List out all team member user records which are api keys.

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

            {
                "current_page": 1,
                "data": [
                    {
                        "id": "ebf007e4-90c9-4764-b8be-4b2a21a7deda",
                        "name": "api-key-1",
                        "email": null,
                        "email_verification_sent_at": null,
                        "email_verified_at": null,
                        "created_at": "2019-06-19 20:32:15",
                        "updated_at": "2019-06-19 20:32:15",
                        "deleted_at": null,
                        "gravatar": "//www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e",
                        "team_role": "full",
                        "team_admin": false,
                        "team_enabled": true,
                        "api_key": "THIS_VALUE_WILL_CONTAIN_JWT_STRING"
                    },
                    {
                        "id": "71626cac-ba4e-4c71-a8d3-315a279b8ef1",
                        "name": "api-key-2",
                        "email": null,
                        "email_verification_sent_at": null,
                        "email_verified_at": null,
                        "created_at": "2019-06-19 20:32:11",
                        "updated_at": "2019-06-19 20:32:11",
                        "deleted_at": null,
                        "gravatar": "//www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e",
                        "team_role": "full",
                        "team_admin": false,
                        "team_enabled": true,
                        "api_key": "THIS_VALUE_WILL_CONTAIN_JWT_STRING"
                    },
                ],
                "from": 1,
                "last_page": 1,
                "per_page": 20,
                "prev_page_url": null,
                "to": 2,
                "total": 2
            }

### Get Team Member's Information [GET /team/user/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

Retrieves the team member that matches the given id.
Deploys information on the team member, including their `team_role`.
Used in conjunction with `PUT /team/user/{id}` to edit a team member.
Requires `team_role` of `admin` to use.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "id": "21a64e9e-3c13-4b85-9f85-67cb4fda808a",
          "system_admin": false,
          "name": "James",
          "email": "fatttest737@gmail.com",
          "email_verification_sent_at": null,
          "email_verified_at": null,
          "created_at": "2017-05-15 19:31:35",
          "updated_at": "2017-05-15 19:31:35",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a",
          "team_role": "full",
          "team_admin": false,
          "team_enabled": true
        }

+ Response 404 (application/json)

        [
         "user not found"
        ]

### Update a Team Member's Information [PUT /team/user/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

Allows team admins to change a team members information, such as role.
Used in conjunction with `GET /team/user/{id}` to view a team members information.
This can be used to remove a member from the team.
Can only be used by members with `team_role` of "admin.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
             "email": "finaluser5@gmail.com", 
             "password": "bottomline",
             "password_confirmation": "bottomline",
             "name": "WILLIAM II KOHLS",
             "team_admin": "1",
             "team_enabled": "1"
            }

+ Response 200 (application/json)

        {
          "id": "21a64e9e-3c13-4b85-9f85-67cb4fda808a",
          "system_admin": false,
          "name": "WILLIAM II KOHLS",
          "email": "demo+1002@abc.com",
          "email_verification_sent_at": null,
          "email_verified_at": null,
          "created_at": "2017-05-15 19:31:35",
          "updated_at": "2017-05-15 19:41:53",
          "deleted_at": null,
          "gravatar": "//www.gravatar.com/avatar/4d6b3ceb5b37b610a68ef23fcbe0060b",
          "team_role": "admin",
          "team_admin": true,
          "team_enabled": true
        }
        
+ Response 401 (application/json)

        [
         "not team admin"
        ]

+ Response 404 (application/json)

        [
         "user not found"
        ]

### Add/Update Team Settings [PUT /team/option/]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

Adds team options, also known as team settings, to a `team`.
Saved as "options" under a team in the database.
This doesn't affect the values of the options at all.
Returns the results of the modified team options.
Only members with `team_role` of "admin" can use this.

Also used by hosted payments to change hosted payment options.

**Available Team Options**

* `hosted_payments_token` - Changes the hosted\_payments token/URL.
* `hosted_payment_note` - This changes the hosted\_payments\_note's page memo.
* `hosted_payments_success_note` - Changes the hosted\_payments\_note's success message.
* `gateway` - This changes the merchant's gateway. Currently available gateways are `test` and `authorize_net`. Gateways change where the user information will go through.
* `plan` - Changes the merchant's plan. Plans are preset information chosen by a merchant to set a course for their merchant account. Either `basic`, `plus` and `premium` are available. Each option will affect the merchant's functionality within the Fattmerchant system. Each plan may cost the merchant differently.
* `receipts_email` - Add/updates emails to be given a receipt when a hosted\_payment goes through.

**Team Options For Mobile and Batch Over EMV Gateway**

Used by the mobile app to store sensitive account information regarding the card reader and the EMV gateway.
* `emv_terminal_id` - The ID for the EMV gateway.
* `emv_terminal_secret` - Specific settings necessary for the card reader.
* `emv_user` - transmits the user's username over the EMV gateway.
* `emv_password` - transmits the user's password over the EMV gateway.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            [
                {
                    "name": "hosted_payments_token",
                    "url" : "http://localhost.app:5477/#/pay/",
                    "value": "BARTLE-_"
                },
                {
                    "name": "hosted_payments_success_note",
                    "value": "Success Note"
                },
                {
                    "name": "hosted_payments_note",
                    "value": "Page Memo"
                }
            ]

+ Response 200 (application/json)

        {
          "id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
          "mid": "",
          "status": "PENDING",
          "subdomain": "",
          "company_name": "Fattmerchant",
          "contact_name": "Fattmerchant",
          "contact_email": "info2@fattmerchant.com",
          "contact_phone": "8555503288",
          "address_1": "25 Wall Street",
          "address_2": "Suite 1",
          "address_city": "Orlando",
          "address_state": "FL",
          "address_zip": "32801",
          "hosted_payments_token": "BARTLE-_",
          "plan": {
            "id": "f92fee2b-fdae-4474-988c-c8f2df92772a",
            "merchant_id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "name": null,
            "created_at": "2017-05-15 18:41:25",
            "updated_at": "2017-05-15 18:41:25"
          },
          "options": {
            "hosted_payments_url_long": "http://localhost.app:5477/#/pay/BARTLE-_",
            "hosted_payments_url_short": "http://bit.ly/1RofD0T",
            "hosted_payments_success_note": "Success Note",
            "hosted_payments_note": "Page Memo"
          },
          "gateway_type": null,
          "processor": "",
          "product_type": "",
          "welcome_email_sent_at": null,
          "created_at": "2017-05-15 17:02:37",
          "updated_at": "2017-05-15 21:52:16",
          "deleted_at": null,
          "gateway_name": null,
          "branding": {
            "id": "81218dbb-74ad-480e-958e-839ced6e6962",
            "merchant_id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "name": "Bugu the Catu",
            "public_url": "https://s3-us-west-2.amazonaws.com/fattpaydocuments/branding/81218dbb-74ad-480e-958e-839ced6e6962.png",
            "tag": "branding",
            "meta": {
              "filesize_bytes": 109524,
              "filesize": "1.1 kB",
              "extension": "png",
              "size": {
                "width": 537,
                "height": 512
              },
              "mime": "image/png"
            },
            "created_at": "2017-05-15 19:15:53",
            "updated_at": "2017-05-15 19:15:56",
            "deleted_at": null
          },
          "allow_ach": false
        }

### Get Team Registration Data [GET /team/registration]
_(please click this box ^^ for more information)_

(ADVANCED)
**Note: Authentication Token and Team Admin Status Required**

This will get a registration record for a merchant that is tied to your team. This is data used by our internal underwriting team during onboarding.


+ Request (application/json)
    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 

+ Response 200 (application/json)

            {
                "annual_volume": "",
                "avg_trans_size": "",
                "b2b_percent": "",
                "bank_account_type": "",
                "business_address_1": "",
                "business_address_2": "",
                "business_address_city": "",
                "business_address_country": "",
                "business_address_state": "",
                "business_address_zip": "",
                "business_dba": "",
                "business_email": "",
                "business_fax": "",
                "business_legal_name": "",
                "business_open_date": "",
                "business_phone_number": "",
                "business_tax_id": "",
                "business_website": "",
                "card_not_present_percent": "",
                "card_present_percent": "",
                "card_swiped_percent": "",
                "chosen_plan": "",
                "chosen_processing_method": "",
                "company_type": "",
                "email": "",
                "first_name": "",
                "highest_trans_amount": "",
                "international": "",
                "internet": "",
                "job_title": "",
                "last_name": "",
                "location_type": "",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent": "",
                "network": "",
                "owner_address_1": "",
                "owner_address_2": "",
                "owner_address_city": "",
                "owner_address_country": "",
                "owner_address_state": "",
                "owner_address_zip": "",
                "phone_number": "",
                "plan": "",
                "principal_owners_name": "",
                "reason_for_applying": "",
                "referred_by": "",
                "refund_policy": "",
                "seasonal_flag": false,
                "seasonal_months": "",
                "service_you_provide": "",
                "title": "",
                "user_dob": "",
                "merchant_id": "791fc3fa-4534-4617-97b6-d41c9e1ce8da",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "updated_at": "2019-06-19 21:22:03",
                "created_at": "2019-06-19 21:22:03",
                "files": [],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }  
            }
+ Response 422 (application/json)
            
            {
                "annual_volume": [
                    "The annual volume may not be greater than 100 characters."
                ]
            }

### Update Team Registration Data [PUT /team/registration]
_(please click this box ^^ for more information)_

(ADVANCED)
**Note: Authentication Token and Team Admin Status Required**

This will upsert a registration record for a merchant that is tied to a team. This is data used by our internal underwriting team during onboarding.

Registration information passed in at the root of the request body (such as `first_name`) is for the Principal Signer/Control Owner for the business. If there are Additional Representatives/Beneficial Owners needed, the information for each representative will be passed into the `meta.representatives` as an object.

**IMPORTANT**
*Effective May 11, 2018, the Federal FinCen (Financial Crimes Enforcement Network) requires all financial institutions to collect the Control Owner and Beneficial Owners on entities that are not otherwise exempt. Please provide information on any additional representatives if any representatives (Beneficial Owner) directly or indirectly own 25% or more of the entity.*


+ Request (application/json)

    **Allowed Fields**
    
    * `email`: string, max: 100, email, merchant Email address
    * `first_name`: string, max: 100, merchant owner/signer first name
    * `last_name`: string, max: 100, merchant owner/signer last name
    * `refund_policy`: possible values: 'N' | 'E' | 'T' | 'O' , merchant business refund policy.
        - N: No Refunds
        - E: Merchandise Exchange Only
        - T: 30 Days or Fewer
        - O: Other
    * `business_fax`: string, max: 100, merchant fax number only digits (optional)
    * `business_legal_name`: string, max: 100, merchant business legal business_legal_name
    * `business_dba`: string, max: 100, merchant business 'Doing Business As'
    * `business_website`: string, max: 100, merchant business website address (including http://)
    * `business_phone_number`: string, max: 100, merchant business phone number, format: (999) 999-9999
    * `business_address_1`: string, max: 200, merchant business address line 1
    * `business_address_2`: string, max: 100, merchant business address line 2
    * `business_address_city`: string, max: 100, merchant business city
    * `business_address_state`: string, max: 100, merchant business state (two letter)
    * `business_address_zip`: string, max: 100, merchant business zip
    * `business_address_country`: string, max: 100, merchant business country iso-3
    * `business_location_address_1`: string, max: 100, merchant business address line 1
    * `business_location_address_2`: string, max: 100, merchant business address line 2
    * `business_location_address_city`: string, max: 100, merchant business city
    * `business_location_address_state`: string, max: 100, merchant business state two letters
    * `business_location_address_zip`: string, max: 100, merchant business zip business_location_address_zip
    * `business_location_address_country`: string, max: 100, merchant business country iso-3
    * `business_location_phone_number`: string, max: 100, merchant business phone number, format: (999) 999-9999
    * `business_open_date`: string, max: 100, merchant business open date format MM/DD/YYYY
    * `company_type`: possible values: 'A' | 'G' | 'S' | 'F' | 'L' | 'E' | 'P' | 'V' | 'B' | 'R', companyType,
        - A: Association/Estate/Trust
        - G: Government (Federal/State/Local)
        - S: Individual/Sole Proprietor
        - F: Financial Institution
        - L: LLC (Limited-Liability Corporation)
        - E: Tax-Exempt Organization (501C)
        - P: Partnership
        - V: Private Corporation
        - B: Public Corporation
        - R: SEC-Registered Entity
    * `business_tax_id`: string, max: 100, merchant business taxid format: 99-9999999
    * `annual_volume`: string, max: 100, merchant volume annual annual_volume (Credit Card and ACH combined)
    * `avg_trans_size`: string, max: 100, merchant volume average transaction avg_trans_size
    * `highest_trans_amount`: string, max: 100, merchant volume highest transaction highest_trans_amount
    * `card_present_percent`: string, max: 100, merchant volume card present percent eg: 50 (ex. Terminal transactions where card is physically present at time of transaction) 
    * `card_swiped_percent`: string, max: 100, merchant volume card swiped percent eg 50
    * `card_not_present_percent`: string, max: 100, merchant volume not present eg 15 (ex. Transactions taken on website where user enters card information into a form)
    * `moto_percent`: string, max: 100, merchant volume percentage taken over moto (mail order telephone order) -- *typically the same value as `card_not_present_percent`*
    * `internet`: string, max: 100, eg. 35, merchant volume percentage taken over the internet
    * `b2b_percent`: string, max: 100, merchant business to business volume percentage
    * `international`: string, max: 100, merchant  international volume percentage
    * `bank_routing_number`: string, max: 100, billing bank routing number
    * `bank_account_number`: string, max: 100, billing bank account number
    * `bank_account_owner_name`: string, max: 100, billing bank account owner name
    * `pricing_plan`: string, max:100, **IMPORTANT**: Partners only. Please reach out to your account manager or POC for information on your pricing plan option(s)
    * `proc_change`: possible values: 'PROC_CHANGE' | 'NOT_NOW_PROC' , has merchant processed before or are they not currently processing
        - PROC_CHANGE: merchant is currently processing with a different processor and needs to change processors
        - NOT_NOW_PROC: merchant is not currently processing payments
    * `mcc`: string, max:100, **IMPORTANT**: Partners only. Please reach out to your account manager or POC for information on mcc codes if needed
    * `service_you_provide`: string, max: 200, merchant business what is sold description
    * `bus_type`: possible values: '1' | '11' | '12' | '18' , max: 100, merchant business type.
        - 1: Retail
        - 11: Restaurant
        - 12: Moto
        - 18: Internet
    * `sub_bus_type`: possible values: '19' | '45' | '13' | '36' , max: 100, merchant sub business type.
        - 19: Retail.key entered
        - 45: Moto
        - 13: Dial pay capture
        - 36: Interchange plus
    * `principal_owners_name`: string, max: 100, merchant owner principal first and last name (optional)
    * `job_title`: string, max: 100, merchant owner title
    * `user_dob`: string, max: 100, OwnerDOB format: MM/DD/YYYY
    * `phone_number`: string, max: 100, owner/signer phone number, format: (999) 999-9999
    * `owner_address_1`: string, max: 100, owner/signer Address line 1
    * `owner_address_2`: string, max: 100, owner/signer Address line 2
    * `owner_address_city`: string, max: 100, owner/signer City
    * `owner_address_state`: string, max: 100, owner/signer State
    * `owner_address_country`: string, max: 100, owner/signer country
    * `owner_address_zip`: string, max: 100, owner/signer Zip
    * `user_ssn`: string, max: 100, owner/signer social security number
    * `note`: string, max: 100
    * `electronic_signature`: object
        * `html_content`: string, legal content displayed to user
        * `ip`: string, ipv4, ipv6
        * `timestamp`: string, "2019-06-19 21:22:03",
        * `user_id`: string, your unique user_id or user email
        * `email`: string, john@doe.com
        * `browser_agent`: string, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
    * `meta`: object
        * `ownership_percentage`: string; ownership percentage for company representatives eg 50
        * `representatives`: array of objects, each representing the additional representatives (required for any owner/representative with 25% or more ownership)
            * `title`: string
            * `date_of_birth`: string, max: 100, OwnerDOB format: MM/DD/YYYY
            * `ssn`: string, max: 100, owner/signer social security number
            * `first_name`: string, max: 100, merchant owner/signer first name
            * `last_name`: string, max: 100, merchant owner/signer last name
            * `type`: string, max:100 type of owner eg. "Beneficial Owner"
            * `ownership_percentage`: string; ownership percentage for company representatives eg 50
            * `email`: string, max: 200, merchant email
            * `phone`: string, max: 200, merchant phone number
            * `address_1`: string, max: 200, merchant business address line 1
            * `address_2`: string, max: 200, merchant business address line 2
            * `address_city`: string, max: 100, owner/signer City
            * `address_state`: string, max: 100, owner/signer State (two letter) (ex. FL)
            * `address_zip`: string, string, max: 100, owner/signer Zip
    * `files`: array




    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 + Body

            {
                "annual_volume" : "",
                "avg_trans_size" : "",
                "bank_account_number" : "",
                "bank_account_type" : "",
                "bank_routing_number" : "",
                "business_address_1" : "",
                "business_address_2" : "",
                "business_address_city" : "",
                "business_address_country" : "",
                "business_address_state" : "",
                "business_address_zip" : "",
                "business_dba" : "",
                "business_email" : "",
                "business_fax" : "",
                "business_legal_name" : "",
                "business_open_date" : "",
                "business_phone_number" : "",
                "business_tax_id" : "",
                "business_website" : "",
                "card_not_present_percent" : "",
                "card_present_percent" : "",
                "card_swiped_percent" : "",
                "chosen_processing_method" : "",
                "company_type" : "",
                "email" : "",
                "first_name" : "",
                "highest_trans_amount" : "",
                "international" : "",
                "internet" : "",
                "job_title" : "",
                "last_name" : "",
                "location_type" : "",
                "mcc": "1750",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent" : "",
                "network" : "",
                "owner_address_1" : "",
                "owner_address_2" : "",
                "owner_address_city" : "",
                "owner_address_country" : "",
                "owner_address_state" : "",
                "owner_address_zip" : "",
                "phone_number" : "",
                "plan" : "",
                "pricing_plan": "interchange0-15",
                "principal_owners_name" : "",
                "reason_for_applying" : "",
                "referred_by" : "",
                "refund_policy" : "",
                "seasonal_flag" : false,
                "seasonal_months" : "",
                "service_you_provide" : "",
                "title" : "",
                "user_dob" : "",
                "user_ssn" : "",
                "files" : [],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }                
            }

+ Response 200 (application/json)

            {
                "annual_volume": "",
                "avg_trans_size": "",
                "b2b_percent": "",
                "bank_account_type": "",
                "business_address_1": "",
                "business_address_2": "",
                "business_address_city": "",
                "business_address_country": "",
                "business_address_state": "",
                "business_address_zip": "",
                "business_dba": "",
                "business_email": "",
                "business_fax": "",
                "business_legal_name": "",
                "business_open_date": "",
                "business_phone_number": "",
                "business_tax_id": "",
                "business_website": "",
                "card_not_present_percent": "",
                "card_present_percent": "",
                "card_swiped_percent": "",
                "chosen_plan": "",
                "chosen_processing_method": "",
                "company_type": "",
                "email": "",
                "first_name": "",
                "highest_trans_amount": "",
                "international": "",
                "internet": "",
                "job_title": "",
                "last_name": "",
                "location_type": "",
                "mcc": "1750",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent": "",
                "network": "",
                "owner_address_1": "",
                "owner_address_2": "",
                "owner_address_city": "",
                "owner_address_country": "",
                "owner_address_state": "",
                "owner_address_zip": "",
                "phone_number": "",
                "plan": "",
                "pricing_plan": "interchange0-15"
                "principal_owners_name": "",
                "reason_for_applying": "",
                "referred_by": "",
                "refund_policy": "",
                "seasonal_flag": false,
                "seasonal_months": "",
                "service_you_provide": "",
                "title": "",
                "user_dob": "",
                "merchant_id": "791fc3fa-4534-4617-97b6-d41c9e1ce8da",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "updated_at": "2019-06-19 21:22:03",
                "created_at": "2019-06-19 21:22:03",
                "files": [],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }  
            }
+ Response 422 (application/json)
            
            {
                "annual_volume": [
                    "The annual volume may not be greater than 100 characters."
                ]
            }

### Create a Merchant [POST /merchant]
_(please click this box ^^ for more information)_

**Note: Authentication Token Required**


This call makes a new merchant. 

#### Generating the Webpayments Token (public key)
The webpayments token is the same as the `hosted_payments_token` in the merchant record. Each merchant will always need a unique `hosted_payments_token` in order to use Fattmerchant.js. This field is autogenerated and will default to have `Fattmerchant` appended to the token. You may customize this token by passing in a different value when making this POST(ex. partnername-12345678909876).

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
              "company_name": "Fattmerchant",
              "contact_name": "Fattmerchant",
              "contact_email": "info2@fattmerchant.com",
              "contact_phone": "8555503288",
              "address_1": "25 Wall Street",
              "address_2": "Suite 1",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "hosted_payments_token": "Fattmerchant-c3073a83d4a2"
            }

+ Response 200 (application/json)

        {
            "id": "9cbfffba-33e2-4d25-aa2b-11e9bc11c301",
            "mid": "",
            "status": "ACTIVE",
            "subdomain": "",
            "company_name": "Fattmerchant",
            "display_name": "Fattmerchant",
            "contact_name": "Fattmerchant",
            "contact_email": "info2@fattmerchant.com",
            "contact_phone": "8555503288",
            "address_1": "25 Wall Street",
            "address_2": "Suite 1",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "hosted_payments_token": "Fattmerchant-c3073a83d4a2",
            "plan": {
                "id": "1de08ed1-27e3-4e5a-bc17-ea76444b636c",
                "merchant_id": "9cbfffba-33e2-4d25-aa2b-11e9bc11c301",
                "user_id": "user1",
                "name": "premium",
                "created_at": "2020-02-17 13:35:11",
                "updated_at": "2020-02-17 13:35:11"
            },
            "options": [],
            "notes": "",
            "gateway_type": null,
            "vendor_keys": [],
            "processor": "",
            "partner": null,
            "product_type": "",
            "is_enterprise": false,
            "is_payfac": false,
            "fm_billing_schedule_id": null,
            "welcome_email_sent_at": null,
            "created_at": "2020-02-17 13:35:11",
            "updated_at": "2020-02-17 13:35:11",
            "deleted_at": null,
            "brand": "fattmerchant",
            "branding": null,
            "allow_ach": false,
            "is_portal": false,
            "allow_credits": false,
            "allow_terminal": false,
            "users": []
        }
        
+ Response 422 (application/json)

        {
         "company_name": [
         "The company name field is required."
         ],
         "contact_email": [
         "The contact email field is required."
         ]
        }

### Create a New API Key for Merchant [POST /merchant/{id}/apikey]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

This will return an api key value for the merchant.

+ Request (application/json)

    **Allowed Fields**
    
    * `name` (string, max 255)
        * example: "api-key-1"
    * `team_role` (string, optional, default = "full")
        * allowed values: "admin", "staff", "full", "reporting"
        * **we recommend "admin" so the api key can be used for all routes**
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 + Body

            {
              "team_role": "admin",
              "name": "do not delete - zapier key"
            }

+ Response 200 (application/json)

            {
                "id": "0e5e54a5-f56b-4be5-a3a5-2e7a08155eba",
                "name": "do not delete - zapier key",
                "email": null,
                "email_verification_sent_at": null,
                "email_verified_at": null,
                "created_at": "2019-06-19 20:30:00",
                "updated_at": "2019-06-19 20:30:00",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e",
                "team_role": "admin",
                "team_admin": true,
                "team_enabled": true,
                "api_key": "THIS_VALUE_WILL_CONTAIN_JWT_STRING"
            }

+ Response 422 (application/json)

            {
                "team_role": [
                    "The selected team role is invalid."
                ]
            }
            
+ Response 422 (application/json)

            {
                "name": [
                    "The name may not be greater than 255 characters."
                ]
            }

### List API Keys for Merchant [GET /merchant/{id}/apikey]
_(please click this box ^^ for more information)_

**Note: Authentication Token and Team Admin Status Required**

List out all api keys for merchant.

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

            {
                "current_page": 1,
                "data": [
                    {
                        "id": "ebf007e4-90c9-4764-b8be-4b2a21a7deda",
                        "name": "api-key-1",
                        "email": null,
                        "email_verification_sent_at": null,
                        "email_verified_at": null,
                        "created_at": "2019-06-19 20:32:15",
                        "updated_at": "2019-06-19 20:32:15",
                        "deleted_at": null,
                        "gravatar": "//www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e",
                        "team_role": "full",
                        "team_admin": false,
                        "team_enabled": true,
                        "api_key": "THIS_VALUE_WILL_CONTAIN_JWT_STRING"
                    },
                    {
                        "id": "71626cac-ba4e-4c71-a8d3-315a279b8ef1",
                        "name": "api-key-2",
                        "email": null,
                        "email_verification_sent_at": null,
                        "email_verified_at": null,
                        "created_at": "2019-06-19 20:32:11",
                        "updated_at": "2019-06-19 20:32:11",
                        "deleted_at": null,
                        "gravatar": "//www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e",
                        "team_role": "full",
                        "team_admin": false,
                        "team_enabled": true,
                        "api_key": "THIS_VALUE_WILL_CONTAIN_JWT_STRING"
                    },
                ],
                "from": 1,
                "last_page": 1,
                "per_page": 20,
                "prev_page_url": null,
                "to": 2,
                "total": 2
            }

### Get Merchant Registration Data [GET /merchant/{id}/registration]
_(please click this box ^^ for more information)_

(ADVANCED)
**Note: Authentication Token and Team Admin Status Required**

This will get a registration record for a merchant. This is data used by our internal underwriting team during onboarding.

**Getting Information about a Merchant's Underwriting status**

The merchant's registration data includes information about the merchant's status in Underwriting. The `underwriting_status` will either be "APPROVED", "PENDED", or "REJECTED".
The `underwriting_substatuses` is an array which will contain an object for each reason if the merchant was either PENDED or REJECTED. This information can be used to better understand the status of a merchant, real time.


+ Request (application/json)
    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 

+ Response 200 (application/json)

            {
                "underwriting_status": "PENDED",
                "underwriting_substatuses": [{
                        "message":"Volume Clarity"
                    },
                    {
                        "message":"Marketing Material"
                }],  
                "annual_volume": "",
                "avg_trans_size": "",
                "b2b_percent": "",
                "bank_account_type": "",
                "business_address_1": "",
                "business_address_2": "",
                "business_address_city": "",
                "business_address_country": "",
                "business_address_state": "",
                "business_address_zip": "",
                "business_dba": "",
                "business_email": "",
                "business_fax": "",
                "business_legal_name": "",
                "business_open_date": "",
                "business_phone_number": "",
                "business_tax_id": "",
                "business_website": "",
                "card_not_present_percent": "",
                "card_present_percent": "",
                "card_swiped_percent": "",
                "chosen_plan": "",
                "chosen_processing_method": "",
                "company_type": "",
                "email": "",
                "first_name": "",
                "highest_trans_amount": "",
                "international": "",
                "internet": "",
                "job_title": "",
                "last_name": "",
                "location_type": "",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent": "",
                "network": "",
                "owner_address_1": "",
                "owner_address_2": "",
                "owner_address_city": "",
                "owner_address_country": "",
                "owner_address_state": "",
                "owner_address_zip": "",
                "phone_number": "",
                "plan": "",
                "principal_owners_name": "",
                "reason_for_applying": "",
                "referred_by": "",
                "refund_policy": "",
                "seasonal_flag": false,
                "seasonal_months": "",
                "service_you_provide": "",
                "title": "",
                "user_dob": "",
                "merchant_id": "791fc3fa-4534-4617-97b6-d41c9e1ce8da",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "updated_at": "2019-06-19 21:22:03",
                "created_at": "2019-06-19 21:22:03",
                "files": [],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }  
            }
+ Response 422 (application/json)
            
            {
                "annual_volume": [
                    "The annual volume may not be greater than 100 characters."
                ]
            }

### Update Merchant Registration Data [PUT /merchant/{id}/registration]
_(please click this box ^^ for more information)_

(ADVANCED)
**Note: Authentication Token and Team Admin Status Required**

This will upsert a registration record for a merchant. This is data used by our internal underwriting team during onboarding.

Registration information passed in at the root of the request body (such as `first_name`) is for the Principal Signer/Control Owner for the business. If there are Additional Representatives/Beneficial Owners needed, the information for each representative will be passed into the `meta.representatives` as an object.

**IMPORTANT**
*Effective May 11, 2018, the Federal FinCen (Financial Crimes Enforcement Network) requires all financial institutions to collect the Control Owner and Beneficial Owners on entities that are not otherwise exempt. Please provide information on any additional representatives if any representatives (Beneficial Owner) directly or indirectly own 25% or more of the entity.*


+ Request (application/json)

    **Allowed Fields**
    
    * `email`: string, max: 100, email, merchant Email address
    * `first_name`: string, max: 100, merchant owner/signer first name
    * `last_name`: string, max: 100, merchant owner/signer last name
    * `refund_policy`: possible values: 'N' | 'E' | 'T' | 'O' , merchant business refund policy.
        - N: No Refunds
        - E: Merchandise Exchange Only
        - T: 30 Days or Fewer
        - O: Other
    * `business_fax`: string, max: 100, merchant fax number only digits (optional)
    * `business_legal_name`: string, max: 100, merchant business legal business_legal_name
    * `business_dba`: string, max: 100, merchant business 'Doing Business As'
    * `business_website`: string, max: 100, merchant business website address (including http://)
    * `business_phone_number`: string, max: 100, merchant business phone number, format: (999) 999-9999
    * `business_address_1`: string, max: 200, merchant business address line 1
    * `business_address_2`: string, max: 100, merchant business address line 2
    * `business_address_city`: string, max: 100, merchant business city
    * `business_address_state`: string, max: 100, merchant business state (two letter)
    * `business_address_zip`: string, max: 100, merchant business zip
    * `business_address_country`: string, max: 100, merchant business country iso-3
    * `business_location_address_1`: string, max: 100, merchant business address line 1
    * `business_location_address_2`: string, max: 100, merchant business address line 2
    * `business_location_address_city`: string, max: 100, merchant business city
    * `business_location_address_state`: string, max: 100, merchant business state two letters
    * `business_location_address_zip`: string, max: 100, merchant business zip business_location_address_zip
    * `business_location_address_country`: string, max: 100, merchant business country iso-3
    * `business_location_phone_number`: string, max: 100, merchant business phone number, format: (999) 999-9999
    * `business_open_date`: string, max: 100, merchant business open date format MM/DD/YYYY
    * `company_type`: possible values: 'A' | 'G' | 'S' | 'F' | 'L' | 'E' | 'P' | 'V' | 'B' | 'R', companyType,
        - A: Association/Estate/Trust
        - G: Government (Federal/State/Local)
        - S: Individual/Sole Proprietor
        - F: Financial Institution
        - L: LLC (Limited-Liability Corporation)
        - E: Tax-Exempt Organization (501C)
        - P: Partnership
        - V: Private Corporation
        - B: Public Corporation
        - R: SEC-Registered Entity
    * `business_tax_id`: string, max: 100, merchant business taxid format: 99-9999999
    * `annual_volume`: string, max: 100, merchant volume annual annual_volume (Credit Card and ACH combined)
    * `avg_trans_size`: string, max: 100, merchant volume average transaction avg_trans_size
    * `highest_trans_amount`: string, max: 100, merchant volume highest transaction highest_trans_amount
    * `card_present_percent`: string, max: 100, merchant volume card present percent eg: 50 (ex. Terminal transactions where card is physically present at time of transaction) 
    * `card_swiped_percent`: string, max: 100, merchant volume card swiped percent eg 50
    * `card_not_present_percent`: string, max: 100, merchant volume not present eg 15 (ex. Transactions taken on website where user enters card information into a form)
    * `moto_percent`: string, max: 100, merchant volume percentage taken over moto (mail order telephone order) -- *typically the same value as `card_not_present_percent`*
    * `internet`: string, max: 100, eg. 35, merchant volume percentage taken over the internet
    * `b2b_percent`: string, max: 100, merchant business to business volume percentage
    * `international`: string, max: 100, merchant  international volume percentage
    * `bank_routing_number`: string, max: 100, billing bank routing number
    * `bank_account_number`: string, max: 100, billing bank account number
    * `bank_account_owner_name`: string, max: 100, billing bank account owner name
    * `pricing_plan`: string, max:100, **IMPORTANT**: Partners only. Please reach out to your account manager or POC for information on your pricing plan option(s)
    * `proc_change`: possible values: 'PROC_CHANGE' | 'NOT_NOW_PROC' , has merchant processed before or are they not currently processing
        - PROC_CHANGE: merchant is currently processing with a different processor and needs to change processors
        - NOT_NOW_PROC: merchant is not currently processing payments
    * `mcc`: string, max:100, **IMPORTANT**: Partners only. Please reach out to your account manager or POC for information on mcc codes if needed
    * `service_you_provide`: string, max: 200, merchant business what is sold description
    * `bus_type`: possible values: '1' | '11' | '12' | '18' , max: 100, merchant business type.
        - 1: Retail
        - 11: Restaurant
        - 12: Moto
        - 18: Internet
    * `sub_bus_type`: possible values: '19' | '45' | '13' | '36' , max: 100, merchant sub business type.
        - 19: Retail.key entered
        - 45: Moto
        - 13: Dial pay capture
        - 36: Interchange plus
    * `principal_owners_name`: string, max: 100, merchant owner principal first and last name (optional)
    * `job_title`: string, max: 100, merchant owner title
    * `user_dob`: string, max: 100, OwnerDOB format: MM/DD/YYYY
    * `phone_number`: string, max: 100, owner/signer phone number, format: (999) 999-9999
    * `owner_address_1`: string, max: 100, owner/signer Address line 1
    * `owner_address_2`: string, max: 100, owner/signer Address line 2
    * `owner_address_city`: string, max: 100, owner/signer City
    * `owner_address_state`: string, max: 100, owner/signer State
    * `owner_address_country`: string, max: 100, owner/signer country
    * `owner_address_zip`: string, max: 100, owner/signer Zip
    * `user_ssn`: string, max: 100, owner/signer social security number
    * `note`: string, max: 100
    * `electronic_signature`: object
        * `html_content`: string, legal content displayed to user
        * `ip`: string, ipv4, ipv6
        * `timestamp`: string, "2019-06-19 21:22:03",
        * `user_id`: string, your unique user_id or user email
        * `email`: string, john@doe.com
        * `browser_agent`: string, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
    * `meta`: object
        * `ownership_percentage`: string; ownership percentage for company representatives eg 50
        * `representatives`: array of objects, each representing the additional representatives (required for any owner/representative with 25% or more ownership)
            * `title`: string
            * `date_of_birth`: string, max: 100, OwnerDOB format: MM/DD/YYYY
            * `ssn`: string, max: 100, owner/signer social security number
            * `first_name`: string, max: 100, merchant owner/signer first name
            * `last_name`: string, max: 100, merchant owner/signer last name
            * `type`: string, max:100 type of owner eg. "Beneficial Owner"
            * `ownership_percentage`: string; ownership percentage for company representatives eg 50
            * `email`: string, max: 200, merchant email
            * `phone`: string, max: 200, merchant phone number
            * `address_1`: string, max: 200, merchant business address line 1
            * `address_2`: string, max: 200, merchant business address line 2
            * `address_city`: string, max: 100, owner/signer City
            * `address_state`: string, max: 100, owner/signer State (two letter) (ex. FL)
            * `address_zip`: string, string, max: 100, owner/signer Zip
    * `files`: array




    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 + Body

            {
                "annual_volume" : "",
                "avg_trans_size" : "",
                "bank_account_number" : "",
                "bank_account_type" : "",
                "bank_account_owner_name": "",
                "bank_routing_number" : "",
                "business_address_1" : "",
                "business_address_2" : "",
                "business_address_city" : "",
                "business_address_country" : "",
                "business_address_state" : "",
                "business_address_zip" : "",
                "business_dba" : "",
                "business_email" : "",
                "business_fax" : "",
                "business_legal_name" : "",
                "business_open_date" : "",
                "business_phone_number" : "",
                "business_tax_id" : "",
                "business_website" : "",
                "card_not_present_percent" : "",
                "card_present_percent" : "",
                "card_swiped_percent" : "",
                "chosen_processing_method" : "",
                "company_type" : "",
                "email" : "",
                "first_name" : "",
                "highest_trans_amount" : "",
                "international" : "",
                "internet" : "",
                "job_title" : "",
                "last_name" : "",
                "location_type" : "",
                "mcc": "1750",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent" : "",
                "network" : "",
                "owner_address_1" : "",
                "owner_address_2" : "",
                "owner_address_city" : "",
                "owner_address_country" : "",
                "owner_address_state" : "",
                "owner_address_zip" : "",
                "phone_number" : "",
                "plan" : "",
                "pricing_plan": "interchange0-15",
                "principal_owners_name" : "",
                "reason_for_applying" : "",
                "referred_by" : "",
                "refund_policy" : "",
                "seasonal_flag" : false,
                "seasonal_months" : "",
                "service_you_provide" : "",
                "title" : "",
                "user_dob" : "",
                "user_ssn" : "",
                "files" : [],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }                
            }

+ Response 200 (application/json)

            {
                "annual_volume": "",
                "avg_trans_size": "",
                "b2b_percent": "",
                "bank_account_type": "",
                "business_address_1": "",
                "business_address_2": "",
                "business_address_city": "",
                "business_address_country": "",
                "business_address_state": "",
                "business_address_zip": "",
                "business_dba": "",
                "business_email": "",
                "business_fax": "",
                "business_legal_name": "",
                "business_open_date": "",
                "business_phone_number": "",
                "business_tax_id": "",
                "business_website": "",
                "card_not_present_percent": "",
                "card_present_percent": "",
                "card_swiped_percent": "",
                "chosen_plan": "",
                "chosen_processing_method": "",
                "company_type": "",
                "email": "",
                "first_name": "",
                "highest_trans_amount": "",
                "international": "",
                "internet": "",
                "job_title": "",
                "last_name": "",
                "location_type": "",
                "mcc": "1750",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent": "",
                "network": "",
                "owner_address_1": "",
                "owner_address_2": "",
                "owner_address_city": "",
                "owner_address_country": "",
                "owner_address_state": "",
                "owner_address_zip": "",
                "phone_number": "",
                "plan": "",
                "pricing_plan": "interchange0-15",
                "principal_owners_name": "",
                "reason_for_applying": "",
                "referred_by": "",
                "refund_policy": "",
                "seasonal_flag": false,
                "seasonal_months": "",
                "service_you_provide": "",
                "title": "",
                "user_dob": "",
                "merchant_id": "791fc3fa-4534-4617-97b6-d41c9e1ce8da",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "updated_at": "2019-06-19 21:22:03",
                "created_at": "2019-06-19 21:22:03",
                "files": [],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }  
            }
+ Response 422 (application/json)
            
            {
                "annual_volume": [
                    "The annual volume may not be greater than 100 characters."
                ]
            }

### Add File to Merchant Registration [POST /merchant/{id}/registration/file]
_(please click this box ^^ for more information)_

(ADVANCED)
**Note: Authentication Token and Team Admin Status Required**

This will add a file to a merchant's registration

+ Request (application/json)


    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 + Body

            {
             "name": "voidcheck",
             "file": "check.png"
            }

+ Response 200 (application/json)

            {
                "annual_volume": "",
                "avg_trans_size": "",
                "b2b_percent": "",
                "bank_account_type": "",
                "business_address_1": "",
                "business_address_2": "",
                "business_address_city": "",
                "business_address_country": "",
                "business_address_state": "",
                "business_address_zip": "",
                "business_dba": "",
                "business_email": "",
                "business_fax": "",
                "business_legal_name": "",
                "business_open_date": "",
                "business_phone_number": "",
                "business_tax_id": "",
                "business_website": "",
                "card_not_present_percent": "",
                "card_present_percent": "",
                "card_swiped_percent": "",
                "chosen_plan": "",
                "chosen_processing_method": "",
                "company_type": "",
                "email": "",
                "first_name": "",
                "highest_trans_amount": "",
                "international": "",
                "internet": "",
                "job_title": "",
                "last_name": "",
                "location_type": "",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent": "",
                "network": "",
                "owner_address_1": "",
                "owner_address_2": "",
                "owner_address_city": "",
                "owner_address_country": "",
                "owner_address_state": "",
                "owner_address_zip": "",
                "phone_number": "",
                "plan": "",
                "principal_owners_name": "",
                "reason_for_applying": "",
                "referred_by": "",
                "refund_policy": "",
                "seasonal_flag": false,
                "seasonal_months": "",
                "service_you_provide": "",
                "title": "",
                "user_dob": "",
                "merchant_id": "791fc3fa-4534-4617-97b6-d41c9e1ce8da",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "updated_at": "2019-06-19 21:22:03",
                "created_at": "2019-06-19 21:22:03",
                "files": [
                {
                    "id": "69ad5457-c027-4057-ad52-05ef0e39ec39",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": "onboarding/69ad5457-c027-4057-ad52-05ef0e39ec39.png",
                    "public_url": "https://fattonboardingfiles.s3.us-west-2.amazonaws.com/onboarding/69ad5457-c027-4057-ad52-05ef0e39ec39.png",
                    "tag": "onboarding",
                    "meta": {
                        "filesize_bytes": 2631,
                        "filesize": "0.03 kB",
                        "extension": "png",
                        "size": {
                            "width": 225,
                            "height": 225
                        },
                        "mime": "image/png"
                    },
                    "created_at": "2020-01-16 18:35:03",
                    "updated_at": "2020-01-16 18:35:04",
                    "deleted_at": null
                },
                {
                    "id": "e87441c2-4c1f-483f-87eb-117cbd909405",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": null,
                    "public_url": null,
                    "tag": "onboarding",
                    "meta": null,
                    "created_at": "2020-01-16 18:34:08",
                    "updated_at": "2020-01-16 18:34:08",
                    "deleted_at": null
                },
                {
                    "id": "67e140cc-73fb-439f-9c32-545ad5a8492d",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": "onboarding/67e140cc-73fb-439f-9c32-545ad5a8492d.txt",
                    "public_url": "https://fattonboardingfiles.s3.us-west-2.amazonaws.com/onboarding/67e140cc-73fb-439f-9c32-545ad5a8492d.txt",
                    "tag": "onboarding",
                    "meta": {
                        "filesize_bytes": 35,
                        "filesize": "0 kB",
                        "extension": "txt",
                        "size": null,
                        "mime": "text/plain"
                    },
                    "created_at": "2020-01-16 18:01:54",
                    "updated_at": "2020-01-16 18:01:54",
                    "deleted_at": null
                },
                {
                    "id": "72331b5e-340b-4dbf-a807-ad175d8eee53",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": null,
                    "public_url": null,
                    "tag": "onboarding",
                    "meta": null,
                    "created_at": "2020-01-16 17:48:43",
                    "updated_at": "2020-01-16 17:48:43",
                    "deleted_at": null
                }
                ],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }  
            }
+ Response 422 (application/json)
            
            {
                "annual_volume": [
                    "The annual volume may not be greater than 100 characters."
                ]
            }

### Delete File from Merchant Registration [DELETE /merchant/{id}/registration/file/{file_id}]
_(please click this box ^^ for more information)_

(ADVANCED)
**Note: Authentication Token and Team Admin Status Required**

This will delete a file from a merchant's registration

+ Request (application/json)


    
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
 + Body

               This route takes no body, only a file id

+ Response 200 (application/json)

            {
                "annual_volume": "",
                "avg_trans_size": "",
                "b2b_percent": "",
                "bank_account_type": "",
                "business_address_1": "",
                "business_address_2": "",
                "business_address_city": "",
                "business_address_country": "",
                "business_address_state": "",
                "business_address_zip": "",
                "business_dba": "",
                "business_email": "",
                "business_fax": "",
                "business_legal_name": "",
                "business_open_date": "",
                "business_phone_number": "",
                "business_tax_id": "",
                "business_website": "",
                "card_not_present_percent": "",
                "card_present_percent": "",
                "card_swiped_percent": "",
                "chosen_plan": "",
                "chosen_processing_method": "",
                "company_type": "",
                "email": "",
                "first_name": "",
                "highest_trans_amount": "",
                "international": "",
                "internet": "",
                "job_title": "",
                "last_name": "",
                "location_type": "",
                "meta": {
                    "ownership_percentage": 60,
                    "representatives": [{
                        "title": "",
                        "date_of_birth": "",
                        "ssn": "",
                        "first_name": "",
                        "last_name": "",
                        "type": "",
                        "ownership_percentage": 40,
                        "email": "",
                        "phone": "",
                        "address_1": "",
                        "address_2": "",
                        "address_city": "",
                        "address_state": "",
                        "address_zip": ""
                    }]
                },
                "moto_percent": "",
                "network": "",
                "owner_address_1": "",
                "owner_address_2": "",
                "owner_address_city": "",
                "owner_address_country": "",
                "owner_address_state": "",
                "owner_address_zip": "",
                "phone_number": "",
                "plan": "",
                "principal_owners_name": "",
                "reason_for_applying": "",
                "referred_by": "",
                "refund_policy": "",
                "seasonal_flag": false,
                "seasonal_months": "",
                "service_you_provide": "",
                "title": "",
                "user_dob": "",
                "merchant_id": "791fc3fa-4534-4617-97b6-d41c9e1ce8da",
                "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                "updated_at": "2019-06-19 21:22:03",
                "created_at": "2019-06-19 21:22:03",
                "files": [
                {
                    "id": "69ad5457-c027-4057-ad52-05ef0e39ec39",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": "onboarding/69ad5457-c027-4057-ad52-05ef0e39ec39.png",
                    "public_url": "https://fattonboardingfiles.s3.us-west-2.amazonaws.com/onboarding/69ad5457-c027-4057-ad52-05ef0e39ec39.png",
                    "tag": "onboarding",
                    "meta": {
                        "filesize_bytes": 2631,
                        "filesize": "0.03 kB",
                        "extension": "png",
                        "size": {
                            "width": 225,
                            "height": 225
                        },
                        "mime": "image/png"
                    },
                    "created_at": "2020-01-16 18:35:03",
                    "updated_at": "2020-01-16 18:35:04",
                    "deleted_at": null
                },
                {
                    "id": "e87441c2-4c1f-483f-87eb-117cbd909405",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": null,
                    "public_url": null,
                    "tag": "onboarding",
                    "meta": null,
                    "created_at": "2020-01-16 18:34:08",
                    "updated_at": "2020-01-16 18:34:08",
                    "deleted_at": null
                },
                {
                    "id": "67e140cc-73fb-439f-9c32-545ad5a8492d",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": "onboarding/67e140cc-73fb-439f-9c32-545ad5a8492d.txt",
                    "public_url": "https://fattonboardingfiles.s3.us-west-2.amazonaws.com/onboarding/67e140cc-73fb-439f-9c32-545ad5a8492d.txt",
                    "tag": "onboarding",
                    "meta": {
                        "filesize_bytes": 35,
                        "filesize": "0 kB",
                        "extension": "txt",
                        "size": null,
                        "mime": "text/plain"
                    },
                    "created_at": "2020-01-16 18:01:54",
                    "updated_at": "2020-01-16 18:01:54",
                    "deleted_at": null
                },
                {
                    "id": "72331b5e-340b-4dbf-a807-ad175d8eee53",
                    "merchant_id": "866ccc18-315e-496d-8a49-f16a5da79b75",
                    "user_id": "8f5f7d73-d53c-47c6-8880-6da0de8d9a10",
                    "name": "voidcheck",
                    "path": null,
                    "public_url": null,
                    "tag": "onboarding",
                    "meta": null,
                    "created_at": "2020-01-16 17:48:43",
                    "updated_at": "2020-01-16 17:48:43",
                    "deleted_at": null
                }
                ],
                "electronic_signature": {
                    "html_content": "I agree to...",
                    "ip": "42.1.1.113",
                    "timestamp": "2019-06-19 21:22:03",
                    "user_id": "a01a5f74-cbdb-4704-9e9b-56fd5a8ee7b8",
                    "email": "john@doe.com",
                    "browser_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }  
            }
+ Response 422 (application/json)
            
            {
                "annual_volume": [
                    "The annual volume may not be greater than 100 characters."
                ]
            }


## Transactions [/transaction]

Transactions are "activity" within the Fattmerchant core data API. 
A transaction represents an exchange of money between a merchant and a customer. 
They are attached to a `payment_method` and a `customer`.

**Transactions can be created using the `POST /charge` call**

### List and Filter All Transactions [GET /transaction{?export,keywords,startDate,endDate,sort,order,user_id,customer_id,meta,total,pre_auth,method}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This call retrieves all transactions found under the merchant.
Can be given query parameters to sort and filter the transaction data with the below actions.
Transactions are created using the `POST /charge` call.

Check roles to see which user roles may process a transaction.

+ Request
    
    **`filter` Parameters Below.**
    
    + export ([csv]) ... if this value is set to csv, the data will be output as comma sep values.
        For example: `transaction?export=csv`
    + keywords (array) ... Allows the transactions and customers to be searchable by keywords. Added by default. Allows searching by partial ID for customer's who match it.
        For example: `transaction?keywords[]=Jake&keywords[]=Anderson
        Multiple query parameters can be used. I.e. `transaction?keywords[]=daniel&startDate=2016-04-01`
    + startDate (t-2string, `Y-m-d G:i:s`) ... Sets the earliest date to find transactions. Searches on the `created_at`.
        For example: `transaction?startDate=2015-06-26 16:59:21`
    + endDate (string, `Y-m-d G:i:s`) ... Sets the latest date to find transactions. Searches on the `created_at`.
        For example: `transaction?endDate=2015-06-26 17:07:12`
    + user_id (string) ... Filters the data that matches the customer ID.
        For example: `user_id=a40da94f-2c4a-4755-9663-cf32bff0bd5e`
    + customer_id (string) ... Filters data that matches the customer ID.
        For example: `customer_id=9f45e4c6-c077-4144-94c9-a819be946ab1`
    + meta (string) ... Will filter results set to records that have an exact match.
        For example: `meta=10`
    + total (numeric) ... Will filter results set to records that have an exact match.
        For example: `total=10`
    + pre_auth (boolean) ... Finds if the user is already pre-authorized.
        For example: `pre-auth=0`
    + method (string) ... Filters the tables based on which payment method was chosen. Can be `card`, `bank`, `cash`, `giftcard` or `check`.
        For example: `method=card`
    + maxTotal (numeric) ... Filters transactions with totals less than the chosen `maxTotal`.
    + minTotal (numeric) ... Filters transactions with totals more than the chosen `minTotal`.
    + type ... filers transactions if they're a `capture`, `charge`, `credit`, `pre auth`, `refund` or `void`.
    + success ... filters transactions that are successful.
    + is_manual (boolean) ... true for cash, check and giftcard methods.
    + user_id (string) ... looks for the exact match of a user ID to filter to find.

        
    **`sort` Parameters Below.**    
        
    + `order`  ... Changes the order of the data either ascending or descending order.  
        For example: `order=ASC` or `order=DSC`
    + `created_at` ... Sorts when transactions were created at. **This is the default sort**.
        For example: `sort=created_at`
    + `updated_at` ... sorts when a transaction was last updated at.
    + `total` ... sorts transactions numerically by their total.
        For example: `sort=12.99`
    + `pre_auth` ... sorts transactions based on their pre auth status.
    + `last_four` ... sorts transactions based on their last four card digits.

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "net_sales": null,
          "total": 1,
          "per_page": 50,
          "current_page": 1,
          "last_page": 1,
          "next_page_url": null,
          "prev_page_url": null,
          "from": 1,
          "to": 1,
          "data": [
            {
              "id": "795c7b84-76aa-498c-b2b8-cd06ef6baf7a",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "type": "charge",
              "source": null,
              "merchant_id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
              "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "payment_method_id": "425dfe40-3f4d-443e-8ac8-dc4ec6f4edec",
              "is_manual": null,
              "success": true,
              "message": null,
                "meta": {
                    "tax":0,
                    "subtotal":2,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 1
                        }
                    ]
                },
              "total": 1,
              "method": "card",
              "pre_auth": false,
              "last_four": "1111",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2017-05-15 22:13:18",
              "updated_at": "2017-05-15 22:13:18",
              "total_refunded": null,
              "is_refundable": false,
              "is_voided": false,
              "is_voidable": true,
              "schedule_id": null,
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "425dfe40-3f4d-443e-8ac8-dc4ec6f4edec",
                "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "merchant_id": "aa7766b2-242f-43b9-9476-3c9018f0ce52",
                "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
                "is_default": 1,
                "method": "card",
                "person_name": "Steven Smith Jr.",
                "card_type": "visa",
                "card_last_four": "1111",
                "card_exp": "042019",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2017-05-15 22:13:12",
                "updated_at": "2017-05-15 22:13:12",
                "card_exp_datetime": "2019-04-30 23:59:59",
                "customer": {
                  "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                  "firstname": "John",
                  "lastname": "Smith",
                  "company": "ABC INC",
                  "email": "demo@abc.com",
                  "cc_emails": [
                    "demo1@abc.com",
                    "demo2@abc.com"
                  ],
                  "phone": "1234567898",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": null,
                  "reference": "BARTLE",
                  "options": "",
                  "created_at": "2017-05-08 19:22:51",
                  "updated_at": "2017-05-08 19:23:46",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                }
              },
              "user": {
                "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "system_admin": false,
                "name": "Demo Mann",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2017-05-15 16:30:23",
                "email_verified_at": "2017-03-29 15:27:21",
                "is_api_key": false,
                "created_at": "2017-01-11 21:44:02",
                "updated_at": "2017-05-15 16:30:23",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }
          ]
        }
        
+ Response 422 (application/json)

        {
         "keywords": [
           "The keywords must be an array."
         ],
         "startDate": [
           "The start date does not match the format Y-m-d G:i:s."
         ]
        }

### Get a Transaction's Information [GET /transaction/{id}]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Searches for a specific transaction based on the given ID, then lists data on that transaction.
Will show info such as the `payment_method`, `customer`, and `child_transactions`.
Typically used in conjunction with `PUT /transaction/{id}`.

+ Request (application/json)

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        {
          "id": "6f49149d-69a1-48e6-bec5-d63eb5816118",
          "invoice_id": "",
          "reference_id": "",
          "recurring_transaction_id": "",
          "type": "charge",
          "source": null,
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "payment_method_id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
          "is_manual": null,
          "success": true,
          "message": null,
                "meta": {
                    "tax":0,
                    "subtotal":2,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 1
                        }
                    ]
                },
          "total": 1,
          "method": "card",
          "pre_auth": false,
          "last_four": "1111",
          "receipt_email_at": null,
          "receipt_sms_at": null,
          "created_at": "2017-05-17 19:57:08",
          "updated_at": "2017-05-17 19:57:08",
          "total_refunded": null,
          "is_refundable": false,
          "is_voided": false,
          "is_voidable": true,
          "schedule_id": null,
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "child_transactions": [],
          "files": [],
          "payment_method": {
            "id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
            "is_default": 1,
            "method": "card",
            "person_name": "Steven Smith Jr.",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "042019",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "32944",
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-05-17 19:56:59",
            "updated_at": "2017-05-17 19:56:59",
            "card_exp_datetime": "2019-04-30 23:59:59",
            "customer": {
              "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": [
                "demo1@abc.com",
                "demo2@abc.com"
              ],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-05-08 19:22:51",
              "updated_at": "2017-05-08 19:23:46",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            }
          },
          "user": {
            "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "system_admin": true,
            "name": "Benji",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2016-12-01 16:18:46",
            "email_verified_at": "2016-12-01 16:18:46",
            "is_api_key": false,
            "created_at": "2016-12-01 16:18:46",
            "updated_at": "2017-01-27 20:10:53",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null,
            "merchant_options": [],
            "is_portal": false
          }
        }
        
+ Response 422 (application/json)

        {
         "id": [
          "The selected id is invalid."
         ]
        }
        
### Update a Transaction [PUT /transaction/{id}/]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

This route will error if called for a transaction created by Omni from paying an invoice or running post charge.
This function can be called to change the values on a transaction which you created manually with post transaction.
Use with `GET /transaction/{id}` to see the transaction details before changing them.
This uses the same parameters as `POST /transaction/`.

**Some things such as receipt emails, the invoice page, the payments page, and the Quickbooks Online integration rely on fields in some field in `meta` to correctly display or function.**

You may encounter unwanted or unusual behavior if you remove from or change these fields in `meta`. 

+ Request (application/json)

    **Required Parameters**
    
    * `total` (required, number, min: .01)
      - If excluded this will default to the total allowed other wise must be a floating point.
    * `source` (required, max: 50, min: 1) 
      - Where the transaction came from. For example, source=mobile means it may have come from a mobile team.
    * `success` (required, boolean) 
      - Tells if the transaction successfully went through or not.
    * `type` (required, in: charge, credit, pre_auth, refund, void) 
      - Tells what type of transaction this is.
    * `customer_id` (filled, string, min: 01, max: 50, exists: customers, id) 
      - If a customer is tied to the transaction, this will bind them to it.
    * `meta` (array) 
      - Misc JSON data stored in the transaction such as tax and subtotal.
    * `pre_auth` (filled, in: 0,1) 
      - Used to see if the transaction was pre\_auth.
    * `method` (filled, in: card, bank) 
      - Whether a card or bank payment\_method was used.

    **Optional Parameters**

    * `last_four` (digits: 4) - The last 4 digits of the card. Other than the payment method token, it's the only card information stored in the Fattmerchant database.
    * `message` (max: 255) - A note or short message about the transaction.
    * `reference_id` (exists: transaction, id) - The given reference ID for the transaction.

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
        
            {
                "total":2.00,
                "source":"postman",
                "success":true,
                "type":"charge",
                "last_four":"",
                "reference_id":"6e97c100-4aeb-4f3f-a8b7-764dd5edc678",
                "meta": {
                    "tax":0,
                    "subtotal":2,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 2
                        }
                    ]
                },
                "message":"",
                "pre_auth":0,
                "method":"card"
            }
 
+ Response 200 (application/json)

        {
          "id": "6f49149d-69a1-48e6-bec5-d63eb5816118",
          "invoice_id": "",
          "reference_id": "",
          "recurring_transaction_id": "",
          "type": "charge",
          "source": null,
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "payment_method_id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
          "is_manual": null,
          "success": true,
          "message": null,
            "meta": {
                "tax":0,
                "subtotal":2,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 2
                    }
                ]
            },
          "total": 1,
          "method": "card",
          "pre_auth": false,
          "last_four": "1111",
          "receipt_email_at": null,
          "receipt_sms_at": null,
          "created_at": "2017-05-17 19:57:08",
          "updated_at": "2017-05-17 19:57:08",
          "total_refunded": null,
          "is_refundable": false,
          "is_voided": false,
          "is_voidable": true,
          "schedule_id": null,
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "child_transactions": [],
          "files": [],
          "payment_method": {
            "id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
            "is_default": 1,
            "method": "card",
            "person_name": "Steven Smith Jr.",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "042019",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "32944",
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-05-17 19:56:59",
            "updated_at": "2017-05-17 19:56:59",
            "card_exp_datetime": "2019-04-30 23:59:59",
            "customer": {
              "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": [
                "demo1@abc.com",
                "demo2@abc.com"
              ],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-05-08 19:22:51",
              "updated_at": "2017-05-08 19:23:46",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            }
          },
          "user": {
            "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "system_admin": true,
            "name": "Benji",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2016-12-01 16:18:46",
            "email_verified_at": "2016-12-01 16:18:46",
            "is_api_key": false,
            "created_at": "2016-12-01 16:18:46",
            "updated_at": "2017-01-27 20:10:53",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null,
            "merchant_options": [],
            "is_portal": false
          }
        }
        
+ Response 422 (application/json)

        {
          "id": [
            "this transaction is immutable"
          ]
        }
        
+ Response 422 (application/json)

        {
          "ccEmails.0": [
            "The ccEmails.0 must be a valid email address."
          ]
        }

### Void or Refund Transaction [POST /transaction/{id}/void-or-refund]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Will void or refund a transaction based on whichever option is available.
Void will be used if the transaction is less than 18-24 hours old and refunds can be issued anytime after that.
Partial refunds are possible, but partial voids are not.
Voiding a transactions ends the transaction before it's batched.
Refunding a transaction will return the funds back to the customer.

**NOTE:** this route will not work for VT+Terminal transactions. If your transaction source is `terminalservice.dejavoo` use the [terminal/void-or-refund route instead](https://fattmerchant.docs.apiary.io/#reference/0/terminals/void-or-refund-(omni-picks-for-you)).
+ Request

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "id": "ba9bf00c-c54d-48f8-8400-902cb3aacd21",
          "invoice_id": "",
          "reference_id": "",
          "recurring_transaction_id": "",
          "type": "charge",
          "source": null,
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "payment_method_id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
          "is_manual": null,
          "success": true,
          "message": null,
          "meta": {
            "tax": 2,
            "subtotal": 10
          },
          "total": 1,
          "method": "card",
          "pre_auth": false,
          "last_four": "1111",
          "receipt_email_at": "2017-05-19 14:40:31",
          "receipt_sms_at": null,
          "created_at": "2017-05-19 13:50:44",
          "updated_at": "2017-05-19 14:40:31",
          "total_refunded": null,
          "is_refundable": false,
          "is_voided": true,
          "is_voidable": false,
          "schedule_id": null,
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "child_transactions": [
            {
              "id": "04497525-565c-4169-bb6d-5a4df399d255",
              "invoice_id": "",
              "reference_id": "ba9bf00c-c54d-48f8-8400-902cb3aacd21",
              "recurring_transaction_id": "",
              "type": "void",
              "source": null,
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "payment_method_id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
              "is_manual": null,
              "success": true,
              "message": null,
              "meta": {
                "tax": 2,
                "subtotal": 10
              },
              "total": 1,
              "method": "card",
              "pre_auth": false,
              "last_four": "1111",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2017-05-19 15:11:32",
              "updated_at": "2017-05-19 15:11:32",
              "total_refunded": null,
              "is_refundable": false,
              "is_voided": null,
              "is_voidable": false,
              "schedule_id": null,
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
                "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
                "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
                "is_default": 1,
                "method": "card",
                "person_name": "Steven Smith Jr.",
                "card_type": "visa",
                "card_last_four": "1111",
                "card_exp": "042019",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2017-05-17 19:56:59",
                "updated_at": "2017-05-17 19:56:59",
                "card_exp_datetime": "2019-04-30 23:59:59",
                "customer": {
                  "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                  "firstname": "John",
                  "lastname": "Smith",
                  "company": "ABC INC",
                  "email": "demo@abc.com",
                  "cc_emails": [
                    "demo1@abc.com",
                    "demo2@abc.com"
                  ],
                  "phone": "1234567898",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": null,
                  "reference": "BARTLE",
                  "options": "",
                  "created_at": "2017-05-08 19:22:51",
                  "updated_at": "2017-05-08 19:23:46",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                }
              },
              "user": {
                "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
                "system_admin": true,
                "name": "Benji",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2016-12-01 16:18:46",
                "email_verified_at": "2016-12-01 16:18:46",
                "is_api_key": false,
                "created_at": "2016-12-01 16:18:46",
                "updated_at": "2017-01-27 20:10:53",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }
          ],
          "files": [],
          "payment_method": {
            "id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
            "is_default": 1,
            "method": "card",
            "person_name": "Steven Smith Jr.",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "042019",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "32944",
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-05-17 19:56:59",
            "updated_at": "2017-05-17 19:56:59",
            "card_exp_datetime": "2019-04-30 23:59:59",
            "customer": {
              "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": [
                "demo1@abc.com",
                "demo2@abc.com"
              ],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-05-08 19:22:51",
              "updated_at": "2017-05-08 19:23:46",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            }
          },
          "user": {
            "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "system_admin": true,
            "name": "Benji",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2016-12-01 16:18:46",
            "email_verified_at": "2016-12-01 16:18:46",
            "is_api_key": false,
            "created_at": "2016-12-01 16:18:46",
            "updated_at": "2017-01-27 20:10:53",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null,
            "merchant_options": [],
            "is_portal": false
          }
        }
        
+ Response 422 (application/json)

        {
         "total": [
           "The transaction has already been voided."
         ],
        "type": [
           "The transaction to refund must be a successful auth, charge, credit, or capture."
         ]
        }

### Refund Transaction [POST /transaction/{id}/refund]
_(please click this box ^^ for more information)_

(Advanced)
**Note: Authentication Token, Active Team and Enabled Team Required**
**Use [transaction/id/void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/transactions/void-or-refund-transaction) route instead**

**To refund, a transaction must be older than 24-hours.**
This returns money from the merchant to a customer.
The user may request how much is to be refunded.
No less than 1 cent and no more than the total amount may be refunded.
After a refund is processed, a child refund transaction is attached to the original transaction.
The child refund's `reference_id` will be the `id` of the original transaction.
The refund resource cannot exceed the total of the original transaction.
The total allowed is calculated based on the cumulative total of its successful child refund transactions.
So if one refunds $30 off of a $50 transaction, only up to $20 more may be refunded.

+ Request (application/json)
 
    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
    + Body

            {
              "total": 5
            }
 
+ Response 200 (application/json)

        {
          "id": "4daf3bdd-a23a-4363-b5c3-041ce431e301",
          "invoice_id": "2f463135-c62f-4f54-9e18-58f616e7a56d",
          "reference_id": "",
          "recurring_transaction_id": "",
          "type": "charge",
          "source": null,
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
          "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
          "payment_method_id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
          "is_manual": null,
          "success": true,
          "message": null,
          "meta": {
            "lineItems": [
              {
                "item": "",
                "details": "",
                "quantity": 1,
                "price": "123"
              }
            ],
            "memo": "",
            "subtotal": 123,
            "tax": "",
            "type": "invoice/schedule"
          },
          "total": 123,
          "method": "card",
          "pre_auth": false,
          "last_four": "1111",
          "receipt_email_at": null,
          "receipt_sms_at": null,
          "created_at": "2017-05-05 19:51:05",
          "updated_at": "2017-05-05 19:51:05",
          "total_refunded": 5,
          "is_refundable": true,
          "is_voided": false,
          "is_voidable": false,
          "schedule_id": "8b8c4333-29af-4364-8a5e-d8617f31c4ae",
          "customer": {
            "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
            "firstname": "BOND",
            "lastname": "BURGER",
            "company": "ABC INC",
            "email": "john@abc.com",
            "cc_emails": null,
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-03-31 17:04:27",
            "updated_at": "2017-03-31 17:04:27",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
          },
          "child_transactions": [
            {
              "id": "fd4e7bad-4982-4747-ab95-4eb87df97a8c",
              "invoice_id": "2f463135-c62f-4f54-9e18-58f616e7a56d",
              "reference_id": "4daf3bdd-a23a-4363-b5c3-041ce431e301",
              "recurring_transaction_id": "",
              "type": "refund",
              "source": null,
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
              "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
              "payment_method_id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
              "is_manual": null,
              "success": true,
              "message": null,
              "meta": {
                "lineItems": [
                  {
                    "item": "",
                    "details": "",
                    "quantity": 1,
                    "price": "123"
                  }
                ],
                "memo": "",
                "subtotal": 123,
                "tax": "",
                "type": "invoice/schedule"
              },
              "total": 5,
              "method": "card",
              "pre_auth": false,
              "last_four": "1111",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2017-05-19 15:06:29",
              "updated_at": "2017-05-19 15:06:29",
              "total_refunded": null,
              "is_refundable": false,
              "is_voided": null,
              "is_voidable": false,
              "schedule_id": "8b8c4333-29af-4364-8a5e-d8617f31c4ae",
              "customer": {
                "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                "firstname": "BOND",
                "lastname": "BURGER",
                "company": "ABC INC",
                "email": "john@abc.com",
                "cc_emails": null,
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-03-31 17:04:27",
                "updated_at": "2017-03-31 17:04:27",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
                "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
                "nickname": "VISA: BOND BURGER (ending in: 1111)",
                "is_default": 0,
                "method": "card",
                "person_name": "BOND BURGER",
                "card_type": "visa",
                "card_last_four": "1111",
                "card_exp": "022020",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": null,
                "address_country": "USA",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2017-04-05 15:30:05",
                "updated_at": "2017-04-05 15:30:05",
                "card_exp_datetime": "2020-02-29 23:59:59",
                "customer": {
                  "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
                  "firstname": "BOND",
                  "lastname": "BURGER",
                  "company": "ABC INC",
                  "email": "john@abc.com",
                  "cc_emails": null,
                  "phone": "1234567898",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": null,
                  "reference": "BARTLE",
                  "options": "",
                  "created_at": "2017-03-31 17:04:27",
                  "updated_at": "2017-03-31 17:04:27",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
                }
              },
              "user": {
                "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
                "system_admin": true,
                "name": "Benji",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2016-12-01 16:18:46",
                "email_verified_at": "2016-12-01 16:18:46",
                "is_api_key": false,
                "created_at": "2016-12-01 16:18:46",
                "updated_at": "2017-01-27 20:10:53",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }
          ],
          "files": [],
          "payment_method": {
            "id": "ad03da14-4f2b-4b43-8e12-e8d784018d79",
            "customer_id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "nickname": "VISA: BOND BURGER (ending in: 1111)",
            "is_default": 0,
            "method": "card",
            "person_name": "BOND BURGER",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "022020",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": null,
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-04-05 15:30:05",
            "updated_at": "2017-04-05 15:30:05",
            "card_exp_datetime": "2020-02-29 23:59:59",
            "customer": {
              "id": "ffed4fd2-977e-412f-9048-293bb5e46c68",
              "firstname": "BOND",
              "lastname": "BURGER",
              "company": "ABC INC",
              "email": "john@abc.com",
              "cc_emails": null,
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-03-31 17:04:27",
              "updated_at": "2017-03-31 17:04:27",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/144fa42eb34883ecb00cbc3f81a060a1"
            }
          },
          "user": {
            "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "system_admin": true,
            "name": "Demo",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2017-05-15 16:30:23",
            "email_verified_at": "2017-03-29 15:27:21",
            "is_api_key": false,
            "created_at": "2017-01-11 21:44:02",
            "updated_at": "2017-05-15 16:30:23",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null,
            "merchant_options": [],
            "is_portal": false
          }
        }
        
+ Response 422 (application/json)

        {
         "created_at": [
         "The transaction cannot be refunded within 24 hours of being created."
         ]
        }

### Void Transaction [POST /transaction/{id}/void]
_(please click this box ^^ for more information)_

(Advanced)
**Note: Authentication Token, Active Team and Enabled Team Required**
**Use [transaction/id/void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/transactions/void-or-refund-transaction) route instead**

Sets a transaction to void, ending the transaction before it's processed.
Creates a child transaction with type = `void` belonging to the transaction of the given ID. 
Transactions may only be set to void if they haven't already been processed yet.
It usually takes 18-24 hours before a transaction is completely processed.
If a void request is sent after the transaction occurs, an error will appear.
`POST /transaction/{id}/refund` is the only way to reverse a transaction after it has been processed.
The result will be the parent transaction with the new void `child_transaction` within another `child_transaction`.

+ Request

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
 
+ Response 200 (application/json)

        {
          "id": "ba9bf00c-c54d-48f8-8400-902cb3aacd21",
          "invoice_id": "",
          "reference_id": "",
          "recurring_transaction_id": "",
          "type": "charge",
          "source": null,
          "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
          "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
          "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
          "payment_method_id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
          "is_manual": null,
          "success": true,
          "message": null,
          "meta": {
            "tax": 2,
            "subtotal": 10
          },
          "total": 1,
          "method": "card",
          "pre_auth": false,
          "last_four": "1111",
          "receipt_email_at": "2017-05-19 14:40:31",
          "receipt_sms_at": null,
          "created_at": "2017-05-19 13:50:44",
          "updated_at": "2017-05-19 14:40:31",
          "total_refunded": null,
          "is_refundable": false,
          "is_voided": true,
          "is_voidable": false,
          "schedule_id": null,
          "customer": {
            "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "firstname": "John",
            "lastname": "Smith",
            "company": "ABC INC",
            "email": "demo@abc.com",
            "cc_emails": [
              "demo1@abc.com",
              "demo2@abc.com"
            ],
            "phone": "1234567898",
            "address_1": "123 Rite Way",
            "address_2": "Unit 12",
            "address_city": "Orlando",
            "address_state": "FL",
            "address_zip": "32801",
            "address_country": "USA",
            "notes": null,
            "reference": "BARTLE",
            "options": "",
            "created_at": "2017-05-08 19:22:51",
            "updated_at": "2017-05-08 19:23:46",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
          },
          "child_transactions": [
            {
              "id": "04497525-565c-4169-bb6d-5a4df399d255",
              "invoice_id": "",
              "reference_id": "ba9bf00c-c54d-48f8-8400-902cb3aacd21",
              "recurring_transaction_id": "",
              "type": "void",
              "source": null,
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
              "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "payment_method_id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
              "is_manual": null,
              "success": true,
              "message": null,
              "meta": {
                "tax": 2,
                "subtotal": 10
              },
              "total": 1,
              "method": "card",
              "pre_auth": false,
              "last_four": "1111",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2017-05-19 15:11:32",
              "updated_at": "2017-05-19 15:11:32",
              "total_refunded": null,
              "is_refundable": false,
              "is_voided": null,
              "is_voidable": false,
              "schedule_id": null,
              "customer": {
                "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "firstname": "John",
                "lastname": "Smith",
                "company": "ABC INC",
                "email": "demo@abc.com",
                "cc_emails": [
                  "demo1@abc.com",
                  "demo2@abc.com"
                ],
                "phone": "1234567898",
                "address_1": "123 Rite Way",
                "address_2": "Unit 12",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "32801",
                "address_country": "USA",
                "notes": null,
                "reference": "BARTLE",
                "options": "",
                "created_at": "2017-05-08 19:22:51",
                "updated_at": "2017-05-08 19:23:46",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
                "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
                "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
                "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
                "is_default": 1,
                "method": "card",
                "person_name": "Steven Smith Jr.",
                "card_type": "visa",
                "card_last_four": "1111",
                "card_exp": "042019",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "32944",
                "address_country": "USA",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2017-05-17 19:56:59",
                "updated_at": "2017-05-17 19:56:59",
                "card_exp_datetime": "2019-04-30 23:59:59",
                "customer": {
                  "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
                  "firstname": "John",
                  "lastname": "Smith",
                  "company": "ABC INC",
                  "email": "demo@abc.com",
                  "cc_emails": [
                    "demo1@abc.com",
                    "demo2@abc.com"
                  ],
                  "phone": "1234567898",
                  "address_1": "123 Rite Way",
                  "address_2": "Unit 12",
                  "address_city": "Orlando",
                  "address_state": "FL",
                  "address_zip": "32801",
                  "address_country": "USA",
                  "notes": null,
                  "reference": "BARTLE",
                  "options": "",
                  "created_at": "2017-05-08 19:22:51",
                  "updated_at": "2017-05-08 19:23:46",
                  "deleted_at": null,
                  "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
                }
              },
              "user": {
                "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
                "system_admin": true,
                "name": "Benji",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2016-12-01 16:18:46",
                "email_verified_at": "2016-12-01 16:18:46",
                "is_api_key": false,
                "created_at": "2016-12-01 16:18:46",
                "updated_at": "2017-01-27 20:10:53",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }
          ],
          "files": [],
          "payment_method": {
            "id": "129520d1-3844-45fd-a0b1-afb66bcdc74c",
            "customer_id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
            "is_default": 1,
            "method": "card",
            "person_name": "Steven Smith Jr.",
            "card_type": "visa",
            "card_last_four": "1111",
            "card_exp": "042019",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "32944",
            "address_country": "USA",
            "purged_at": null,
            "deleted_at": null,
            "created_at": "2017-05-17 19:56:59",
            "updated_at": "2017-05-17 19:56:59",
            "card_exp_datetime": "2019-04-30 23:59:59",
            "customer": {
              "id": "d45ee88c-8b27-4be8-8d81-77dda1b81826",
              "firstname": "John",
              "lastname": "Smith",
              "company": "ABC INC",
              "email": "demo@abc.com",
              "cc_emails": [
                "demo1@abc.com",
                "demo2@abc.com"
              ],
              "phone": "1234567898",
              "address_1": "123 Rite Way",
              "address_2": "Unit 12",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "32801",
              "address_country": "USA",
              "notes": null,
              "reference": "BARTLE",
              "options": "",
              "created_at": "2017-05-08 19:22:51",
              "updated_at": "2017-05-08 19:23:46",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/fe3e929dd80f1653c3a4b82812660061"
            }
          },
          "user": {
            "id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
            "system_admin": true,
            "name": "Benji",
            "email": "demo@fattmerchant.com",
            "email_verification_sent_at": "2016-12-01 16:18:46",
            "email_verified_at": "2016-12-01 16:18:46",
            "is_api_key": false,
            "created_at": "2016-12-01 16:18:46",
            "updated_at": "2017-01-27 20:10:53",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null,
            "merchant_options": [],
            "is_portal": false
          }
        }
        
+ Response 422 (application/json)

        {
         "total": [
         "The transaction has already been voided."
         ]
        }

### Capture a Transaction [POST /transaction/{transactionid}/capture]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

*Requires a pre-authenticated (pre-auth) transaction ID*.

Using a preauthorized (pre_auth) transaction id, this call will reuse the payment information of that transaction to create a new one.
The body is the same as creating a new transaction.
The new transaction will have preauth = false; therefore a capture of an already captured transaction will not work.
Typically used in conjunction with a `POST /charge` with pre_auth = true.

+ Request

    + Headers
 
            Authorization: Bearer [insert authorization token here]
            Accept: application/json
            
    + Body
            
            {
                "total": 5
            }

+ Response 200 (application/json)

        {
        "id": "d4db6c3b-4a96-48b6-a08b-551326fada40",
        "invoice_id": "",
        "reference_id": "",
        "recurring_transaction_id": "",
        "auth_id": null,
        "type": "pre_auth",
        "source": null,
        "is_merchant_present": true,
        "merchant_id": "e7bcf7a6-ea72-4981-894d-73b41a690fa8",
        "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
        "customer_id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "payment_method_id": "f096d9b4-c890-45af-9b47-3de0aa10e5d2",
        "is_manual": null,
        "success": true,
        "message": null,
        "meta": {
        "tax": 2,
        "subtotal": 10
        },
        "total": 1,
        "method": "card",
        "pre_auth": true,
        "is_captured": 1,
        "last_four": "1111",
        "interchange_code": "",
        "interchange_fee": null,
        "batch_id": "",
        "batched_at": "2018-03-20 13:27:19",
        "emv_response": "",
        "avs_response": "",
        "cvv_response": "",
        "pos_entry": "",
        "pos_salesperson": "",
        "receipt_email_at": null,
        "receipt_sms_at": null,
        "created_at": "2018-03-05 13:27:05",
        "updated_at": "2018-03-05 13:27:19",
        "total_refunded": 0,
        "is_refundable": false,
        "is_voided": false,
        "is_voidable": false,
        "schedule_id": null,
        "child_captures": [
        {
        "id": "936e3b88-6df1-4048-9d39-00469748008f",
        "invoice_id": "",
        "reference_id": "",
        "recurring_transaction_id": "",
        "auth_id": "d4db6c3b-4a96-48b6-a08b-551326fada40",
        "type": "capture",
        "source": null,
        "is_merchant_present": true,
        "merchant_id": "e7bcf7a6-ea72-4981-894d-73b41a690fa8",
        "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
        "customer_id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "payment_method_id": "f096d9b4-c890-45af-9b47-3de0aa10e5d2",
        "is_manual": null,
        "success": true,
        "message": null,
        "meta": {
        "tax": 2,
        "subtotal": 10
        },
        "total": 5,
        "method": "card",
        "pre_auth": false,
        "is_captured": 0,
        "last_four": "1111",
        "interchange_code": "",
        "interchange_fee": null,
        "batch_id": "",
        "batched_at": "2018-03-20 13:27:18",
        "emv_response": "",
        "avs_response": "",
        "cvv_response": "",
        "pos_entry": "",
        "pos_salesperson": "",
        "receipt_email_at": null,
        "receipt_sms_at": null,
        "created_at": "2018-03-05 13:27:18",
        "updated_at": "2018-03-05 13:27:18",
        "total_refunded": 0,
        "is_refundable": false,
        "is_voided": false,
        "is_voidable": true,
        "schedule_id": null,
        "child_captures": [],
        "parent_auth": null,
        "customer": {
        "id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "firstname": "John",
        "lastname": "Smith",
        "company": "ABC INC",
        "email": "eandrews@fattmerchant.com",
        "cc_emails": [
        "demo@abc.com"
        ],
        "cc_sms": null,
        "phone": "1234567898",
        "address_1": "123 Rite Way",
        "address_2": "Unit 12",
        "address_city": "Orlando",
        "address_state": "FL",
        "address_zip": "32801",
        "address_country": "USA",
        "notes": null,
        "reference": "BARTLE",
        "options": "",
        "created_at": "2018-03-02 16:20:06",
        "updated_at": "2018-03-02 16:20:06",
        "deleted_at": null,
        "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
        },
        "child_transactions": [],
        "files": [],
        "payment_method": {
        "id": "f096d9b4-c890-45af-9b47-3de0aa10e5d2",
        "customer_id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "merchant_id": "e7bcf7a6-ea72-4981-894d-73b41a690fa8",
        "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
        "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
        "has_cvv": 1,
        "is_default": 1,
        "method": "card",
        "person_name": "Steven Smith Jr.",
        "card_type": "visa",
        "card_last_four": "1111",
        "card_exp": "042019",
        "bank_name": null,
        "bank_type": null,
        "bank_holder_type": null,
        "address_1": null,
        "address_2": null,
        "address_city": null,
        "address_state": null,
        "address_zip": "32944",
        "address_country": "USA",
        "purged_at": null,
        "deleted_at": null,
        "created_at": "2018-03-03 16:21:09",
        "updated_at": "2018-03-03 16:21:09",
        "card_exp_datetime": "2019-04-30 23:59:59",
        "customer": {
        "id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "firstname": "John",
        "lastname": "Smith",
        "company": "ABC INC",
        "email": "eandrews@fattmerchant.com",
        "cc_emails": [
        "demo@abc.com"
        ],
        "cc_sms": null,
        "phone": "1234567898",
        "address_1": "123 Rite Way",
        "address_2": "Unit 12",
        "address_city": "Orlando",
        "address_state": "FL",
        "address_zip": "32801",
        "address_country": "USA",
        "notes": null,
        "reference": "BARTLE",
        "options": "",
        "created_at": "2018-03-03 16:20:06",
        "updated_at": "2018-03-03 16:20:06",
        "deleted_at": null,
        "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
        }
        },
        "user": {
        "id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
        "system_admin": true,
        "name": "Morty Junior",
        "email": "demo@fattmerchant.com",
        "email_verification_sent_at": "2016-05-11 17:13:33",
        "email_verified_at": "2016-05-11 17:13:33",
        "is_api_key": false,
        "acknowledgments": {
        "tutorial": true,
        "signedApplication": true,
        "godviewWelcome": true
        },
        "created_at": "2016-05-18 14:11:46",
        "updated_at": "2018-03-05 20:26:20",
        "deleted_at": null,
        "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
        "team_admin": null,
        "team_enabled": null,
        "team_role": null,
        "merchant_options": [],
        "is_portal": false
        }
        }
        ],
        "parent_auth": null,
        "customer": {
        "id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "firstname": "John",
        "lastname": "Smith",
        "company": "ABC INC",
        "email": "eandrews@fattmerchant.com",
        "cc_emails": [
        "demo@abc.com"
        ],
        "cc_sms": null,
        "phone": "1234567898",
        "address_1": "123 Rite Way",
        "address_2": "Unit 12",
        "address_city": "Orlando",
        "address_state": "FL",
        "address_zip": "32801",
        "address_country": "USA",
        "notes": null,
        "reference": "BARTLE",
        "options": "",
        "created_at": "2018-03-03 16:20:06",
        "updated_at": "2018-03-03 16:20:06",
        "deleted_at": null,
        "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
        },
        "child_transactions": [],
        "files": [],
        "payment_method": {
        "id": "f096d9b4-c890-45af-9b47-3de0aa10e5d2",
        "customer_id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "merchant_id": "e7bcf7a6-ea72-4981-894d-73b41a690fa8",
        "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
        "nickname": "VISA: Steven Smith Jr. (ending in: 1111)",
        "has_cvv": 1,
        "is_default": 1,
        "method": "card",
        "person_name": "Steven Smith Jr.",
        "card_type": "visa",
        "card_last_four": "1111",
        "card_exp": "042019",
        "bank_name": null,
        "bank_type": null,
        "bank_holder_type": null,
        "address_1": null,
        "address_2": null,
        "address_city": null,
        "address_state": null,
        "address_zip": "32944",
        "address_country": "USA",
        "purged_at": null,
        "deleted_at": null,
        "created_at": "2018-03-03 16:21:09",
        "updated_at": "2018-03-03 16:21:09",
        "card_exp_datetime": "2019-04-30 23:59:59",
        "customer": {
        "id": "3a50862a-c2d5-47ae-8f49-d42afff8ee77",
        "firstname": "John",
        "lastname": "Smith",
        "company": "ABC INC",
        "email": "eandrews@fattmerchant.com",
        "cc_emails": [
        "demo@abc.com"
        ],
        "cc_sms": null,
        "phone": "1234567898",
        "address_1": "123 Rite Way",
        "address_2": "Unit 12",
        "address_city": "Orlando",
        "address_state": "FL",
        "address_zip": "32801",
        "address_country": "USA",
        "notes": null,
        "reference": "BARTLE",
        "options": "",
        "created_at": "2018-03-03 16:20:06",
        "updated_at": "2018-03-03 16:20:06",
        "deleted_at": null,
        "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
        }
        },
        "user": {
        "id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
        "system_admin": true,
        "name": "Morty Junior",
        "email": "demo@fattmerchant.com",
        "email_verification_sent_at": "2016-05-11 17:13:33",
        "email_verified_at": "2016-05-11 17:13:33",
        "is_api_key": false,
        "acknowledgments": {
        "tutorial": true,
        "signedApplication": true,
        "godviewWelcome": true
        },
        "created_at": "2016-05-18 14:11:46",
        "updated_at": "2018-03-05 20:26:20",
        "deleted_at": null,
        "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
        "team_admin": null,
        "team_enabled": null,
        "team_role": null,
        "merchant_options": [],
        "is_portal": false
        }
        }
+ Response 422 (application/json)

        {
         "id": [
          "The selected id is invalid."
         ]
        }

### Get a Related Transaction [GET /transaction/{id}/related]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

When a transaction is voided or refunded, it creates a child transaction as a way of keeping track of changes to transactions.
Transaction can have multiple child transactions.
`Child_transactions` contain a `related_ID` which is just the ID of the original transaction.
This ID is used to identify the Child transactions' original transaction.
The child transaction will show changes to the original transaction.
Must be a charge transaction id; void and refund transaction ids will not work.

    + Request

        + Headers
        
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

        [
          {
            "id": "3872e334-bba1-4bbd-91fc-bb3f48c74b1a",
            "invoice_id": "",
            "reference_id": "890eda03-0cb5-4c51-813d-8f1959d1a591",
            "recurring_transaction_id": "",
            "type": "refund",
            "source": null,
            "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
            "user_id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
            "customer_id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
            "payment_method_id": "23c06bc1-7473-46fb-8d65-b8e9bde1fe75",
            "is_manual": null,
            "success": true,
            "message": null,
            "meta": {
                "tax":0,
                "subtotal":2,
                "lineItems": [
                    {
                        "id": "optional-fm-catalog-item-id",
                        "item":"Demo Item",
                        "details":"this is a regular demo item",
                        "quantity":1,
                        "price": 22
                    }
                ]
            },
            "total": 22,
            "method": "card",
            "pre_auth": false,
            "last_four": "1111",
            "receipt_email_at": null,
            "receipt_sms_at": null,
            "created_at": "2017-03-29 16:15:43",
            "updated_at": "2017-03-29 16:15:43",
            "total_refunded": null,
            "is_refundable": false,
            "is_voided": null,
            "is_voidable": false,
            "schedule_id": null,
            "customer": {
              "id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
              "firstname": "Mario",
              "lastname": "Henderson",
              "company": "",
              "email": "fatttest737@gmail.com",
              "cc_emails": null,
              "phone": "5555555555",
              "address_1": "123 S ST.",
              "address_2": "",
              "address_city": "Orlando",
              "address_state": "FL",
              "address_zip": "3222",
              "address_country": "USA",
              "notes": "",
              "reference": "",
              "options": "",
              "created_at": "2017-01-30 20:41:23",
              "updated_at": "2017-01-30 20:41:23",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a"
            },
            "child_transactions": [],
            "files": [],
            "payment_method": {
              "id": "23c06bc1-7473-46fb-8d65-b8e9bde1fe75",
              "customer_id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
              "merchant_id": "dd36b936-1eb7-4ece-bebc-b514c6a36ebd",
              "user_id": "41e60252-4f23-48de-a64f-e5a1e8a9359c",
              "nickname": "VISA: Mario Mario (ending in: 1111)",
              "is_default": 0,
              "method": "card",
              "person_name": "Mario Henderson",
              "card_type": "visa",
              "card_last_four": "1111",
              "card_exp": "022020",
              "bank_name": null,
              "bank_type": null,
              "bank_holder_type": null,
              "address_1": null,
              "address_2": null,
              "address_city": null,
              "address_state": null,
              "address_zip": null,
              "address_country": "USA",
              "purged_at": null,
              "deleted_at": null,
              "created_at": "2017-01-30 20:48:13",
              "updated_at": "2017-01-30 20:48:13",
              "card_exp_datetime": "2020-02-29 23:59:59",
              "customer": {
                "id": "50d14fcb-b468-4ac4-afd8-d7c47172dc1c",
                "firstname": "Mario",
                "lastname": "Henderson",
                "company": "",
                "email": "fatttest737@gmail.com",
                "cc_emails": null,
                "phone": "5555555555",
                "address_1": "123 S ST.",
                "address_2": "",
                "address_city": "Orlando",
                "address_state": "FL",
                "address_zip": "3222",
                "address_country": "USA",
                "notes": "",
                "reference": "",
                "options": "",
                "created_at": "2017-01-30 20:41:23",
                "updated_at": "2017-01-30 20:41:23",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/52b3ef2ae70945ce0fca14086443dc1a"
              }
            },
            "user": {
              "id": "b58d7eee-e68d-4d12-a1f8-62f5e71382ae",
              "system_admin": true,
              "name": "Demo Mann",
              "email": "demo@fattmerchant.com",
              "email_verification_sent_at": "2017-05-15 16:30:23",
              "email_verified_at": "2017-03-29 15:27:21",
              "is_api_key": false,
              "created_at": "2017-01-11 21:44:02",
              "updated_at": "2017-05-15 16:30:23",
              "deleted_at": null,
              "gravatar": "//www.gravatar.com/avatar/157965dea7cd2f44e349382d1d791650",
              "team_admin": null,
              "team_enabled": null,
              "team_role": null,
              "merchant_options": [],
              "is_portal": false
            }
          }
        ]
        
+ Response 422 (application/json)

        {
         "id": [
          "The selected id is invalid."
         ]
        }
        
### E-Mail Transaction Receipt [PUT /transaction/{id}/receipt/email]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Using the ID of a transaction, this function will send out an `email` receipt of that transaction.
The `email` that will receive the receipt must be passed in to the function.
If invalid or incomplete `email` are given, this function will fail.
Can be sent to multiple `email` by attaching more in the `ccEmail` field in the body.
`email` must be sent manually and will not automatically send from any other call.
This uses the same info as `GET /transaction/{id}`.

+ Request

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
        
            {
              "ccEmails" : [
                "fatttest737@fattmerchant.com",
                "demo@fattmerchant.com"
              ]
            }
 
+ Response 200 (application/json)

        {
            "id": "184ef996-de5e-41a8-b139-4ba595426053",
            "invoice_id": "2230adc8-a755-4a26-95b5-a54a4b8aa0ad",
            "reference_id": "",
            "recurring_transaction_id": "",
            "auth_id": null,
            "type": "charge",
            "source": null,
            "is_merchant_present": true,
            "merchant_id": "a61d78cc-cde9-44ac-8a18-30c39be05879",
            "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
            "customer_id": "0f553deb-5dbd-4dca-9bef-743c4bc2809f",
            "payment_method_id": "giftcard",
            "is_manual": true,
            "success": true,
            "message": null,
            "meta": {
                "update_inventory": true,
                "taxOverride": false,
                "isBulkInvoice": false,
                "taxRate": 0,
                "tax": 0,
                "subtotal": 55,
                "memo": "",
                "lineItems": [
                    {
                        "id": "generated-id-0630-32fe-649d-cf6c-e38b",
                        "item": "",
                        "details": "",
                        "quantity": 1,
                        "price": "55"
                    }
                ],
                "reference": 1872,
                "check_number": null,
                "driver_license": null,
                "driver_license_state": null,
                "payment_phone": null,
                "payment_note": null
            },
            "total": 55,
            "method": "giftcard",
            "pre_auth": false,
            "is_captured": 1,
            "last_four": null,
            "interchange_code": "",
            "interchange_fee": null,
            "batch_id": "",
            "batched_at": "2018-10-02 12:30:44",
            "emv_response": "",
            "avs_response": "",
            "cvv_response": "",
            "pos_entry": "",
            "pos_salesperson": "",
            "receipt_email_at": "2018-10-02 16:30:44",
            "receipt_sms_at": "2018-10-02 14:53:09",
            "created_at": "2018-07-23 18:21:42",
            "updated_at": "2018-10-02 16:30:44",
            "total_refunded": 0,
            "is_refundable": true,
            "is_voided": false,
            "is_voidable": true,
            "schedule_id": null,
            "child_captures": [],
            "parent_auth": null,
            "customer": {
                "id": "0f553deb-5dbd-4dca-9bef-743c4bc2809f",
                "firstname": "Elizabeth",
                "lastname": "Jones",
                "company": "Liz's Lemonade",
                "email": "eandrews@fattmerchant.com",
                "cc_emails": null,
                "cc_sms": null,
                "phone": "",
                "address_1": "",
                "address_2": "",
                "address_city": "",
                "address_state": "",
                "address_zip": "",
                "address_country": "",
                "notes": "",
                "reference": "",
                "options": null,
                "created_at": "2016-10-09 11:04:35",
                "updated_at": "2018-08-14 13:09:21",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
            },
            "child_transactions": [],
            "files": [],
            "payment_method": {
                "id": "giftcard",
                "customer_id": "",
                "merchant_id": "",
                "user_id": "",
                "nickname": "GIFT CARD",
                "has_cvv": 0,
                "is_default": 0,
                "method": "giftcard",
                "person_name": null,
                "card_type": null,
                "card_last_four": null,
                "card_exp": null,
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": null,
                "address_country": null,
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-06-05 16:45:43",
                "updated_at": "2018-06-05 16:45:43",
                "card_exp_datetime": [],
                "is_usable_in_vt": false,
                "customer": {
                    "id": "",
                    "firstname": "",
                    "lastname": "",
                    "company": "",
                    "email": "",
                    "cc_emails": null,
                    "cc_sms": null,
                    "phone": "",
                    "address_1": "",
                    "address_2": "",
                    "address_city": "",
                    "address_state": "",
                    "address_zip": "",
                    "address_country": "",
                    "notes": null,
                    "reference": "",
                    "options": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null,
                    "allow_invoice_credit_card_payments": true,
                    "gravatar": false
                }
            },
            "user": {
                "id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
                "system_admin": true,
                "name": "Morty Junior",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2018-09-26 18:24:21",
                "email_verified_at": "2016-05-11 17:13:33",
                "is_api_key": false,
                "acknowledgments": {
                    "signedApplication": true,
                    "editedOnboardingInformation": false,
                    "tutorial": true,
                    "godviewWelcome": true
                },
                "created_at": "2016-05-18 14:11:46",
                "updated_at": "2018-09-26 18:24:21",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_default": false
            }
        }
        
+ Response 422 (application/json)

        {
          "ccEmails.0": [
            "The ccEmails.0 must be a valid email address."
          ]
        }

### Send Transaction Receipt by SMS [PUT /transaction/{id}/receipt/sms]
_(please click this box ^^ for more information)_

**Note: Authentication Token, Active Team and Enabled Team Required**

Similar to the transaction ID function; it gathers information on a transaction and sends an SMS (text message) receipt to the customer.
Must be enabled by customers with a list of CC numbers.


+ Request

    + Headers
 
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body 
    
            {
              "ccSms": [ "6365553226", "5555552368"]
            }
 
+ Response 200 (application/json)

        {
            "id": "184ef996-de5e-41a8-b139-4ba595426053",
            "invoice_id": "2230adc8-a755-4a26-95b5-a54a4b8aa0ad",
            "reference_id": "",
            "recurring_transaction_id": "",
            "auth_id": null,
            "type": "charge",
            "source": null,
            "is_merchant_present": true,
            "merchant_id": "a61d78cc-cde9-44ac-8a18-30c39be05879",
            "user_id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
            "customer_id": "0f553deb-5dbd-4dca-9bef-743c4bc2809f",
            "payment_method_id": "giftcard",
            "is_manual": true,
            "success": true,
            "message": null,
            "meta": {
                "update_inventory": true,
                "taxOverride": false,
                "isBulkInvoice": false,
                "taxRate": 0,
                "tax": 0,
                "subtotal": 55,
                "memo": "",
                "lineItems": [
                    {
                        "id": "generated-id-0630-32fe-649d-cf6c-e38b",
                        "item": "",
                        "details": "",
                        "quantity": 1,
                        "price": "55"
                    }
                ],
                "reference": 1872,
                "check_number": null,
                "driver_license": null,
                "driver_license_state": null,
                "payment_phone": null,
                "payment_note": null
            },
            "total": 55,
            "method": "giftcard",
            "pre_auth": false,
            "is_captured": 1,
            "last_four": null,
            "interchange_code": "",
            "interchange_fee": null,
            "batch_id": "",
            "batched_at": "2018-10-02 10:53:09",
            "emv_response": "",
            "avs_response": "",
            "cvv_response": "",
            "pos_entry": "",
            "pos_salesperson": "",
            "receipt_email_at": "2018-10-02 14:47:08",
            "receipt_sms_at": "2018-10-02 14:53:09",
            "created_at": "2018-07-23 18:21:42",
            "updated_at": "2018-10-02 14:53:09",
            "total_refunded": 0,
            "is_refundable": true,
            "is_voided": false,
            "is_voidable": true,
            "schedule_id": null,
            "child_captures": [],
            "parent_auth": null,
            "customer": {
                "id": "0f553deb-5dbd-4dca-9bef-743c4bc2809f",
                "firstname": "Elizabeth",
                "lastname": "Jones",
                "company": "Liz's Lemonade",
                "email": "eandrews@fattmerchant.com",
                "cc_emails": null,
                "cc_sms": null,
                "phone": "",
                "address_1": "",
                "address_2": "",
                "address_city": "",
                "address_state": "",
                "address_zip": "",
                "address_country": "",
                "notes": "",
                "reference": "",
                "options": null,
                "created_at": "2016-10-09 11:04:35",
                "updated_at": "2018-08-14 13:09:21",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": "//www.gravatar.com/avatar/45357c125af15b6df8864a71a653bea2"
            },
            "child_transactions": [],
            "files": [],
            "payment_method": {
                "id": "giftcard",
                "customer_id": "",
                "merchant_id": "",
                "user_id": "",
                "nickname": "GIFT CARD",
                "has_cvv": 0,
                "is_default": 0,
                "method": "giftcard",
                "person_name": null,
                "card_type": null,
                "card_last_four": null,
                "card_exp": null,
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": null,
                "address_country": null,
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-06-05 16:45:43",
                "updated_at": "2018-06-05 16:45:43",
                "card_exp_datetime": [],
                "is_usable_in_vt": false,
                "customer": {
                    "id": "",
                    "firstname": "",
                    "lastname": "",
                    "company": "",
                    "email": "",
                    "cc_emails": null,
                    "cc_sms": null,
                    "phone": "",
                    "address_1": "",
                    "address_2": "",
                    "address_city": "",
                    "address_state": "",
                    "address_zip": "",
                    "address_country": "",
                    "notes": null,
                    "reference": "",
                    "options": null,
                    "created_at": null,
                    "updated_at": null,
                    "deleted_at": null,
                    "allow_invoice_credit_card_payments": true,
                    "gravatar": false
                }
            },
            "user": {
                "id": "2d089742-6aca-462d-8db3-c2966e1f9e68",
                "system_admin": true,
                "name": "Morty Junior",
                "email": "demo@fattmerchant.com",
                "email_verification_sent_at": "2018-09-26 18:24:21",
                "email_verified_at": "2016-05-11 17:13:33",
                "is_api_key": false,
                "acknowledgments": {
                    "signedApplication": true,
                    "editedOnboardingInformation": false,
                    "tutorial": true,
                    "godviewWelcome": true
                },
                "created_at": "2016-05-18 14:11:46",
                "updated_at": "2018-09-26 18:24:21",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/772cbf95746d7da86789cc3634c46ba8",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_default": false
            }
        }
 
## Terminals [/terminal/]

Terminal is a resource within the Fattmerchant core api which allows customers to 
interact with our hardware solutions:


- [`GET /terminal/register`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/get-all-registers-(terminals)) returns the terminals belonging to the account from your JWT, including their REGISTER IDs.
- [`POST /terminal/charge/queue`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/charge-(queue)) initiate a charge to the terminal, and get an ID back instantly, before the transaction is finished
- [`POST /terminal/charge`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/charge) request for user to insert card for charge.
- [`POST /terminal/credit`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/credit) request for user to insert card for credit (a general credit).
- [`POST /terminal/void-or-refund`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/void-or-refund-(omni-picks-for-you)) request to either void or for customer to insert card for refund - depending on whether the transaction has batched out. (RECOMMENDED)
- [`POST /terminal/refund`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/refund) request for user to insert card for refund.
- [`POST /terminal/void`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/void) voids a transaction.
- [`POST /terminal/print`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/print) prints a message on a terminal
- [`POST /terminal/promptInput`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/prompt-(input)) request for user to input text.
- [`POST /terminal/promptChoice`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/prompt-(choice)) request for user to select a choice.
- [`GET /terminal/{registerId}/status/{transactionId}`](https://fattmerchant.docs.apiary.io/#reference/0/terminals/get-transaction-status) returns the status of the transaction from the terminal itself. (Also prints a receipt)

### Get all registers (terminals) [GET /terminal/register]
_(please click this box ^^ for more information)_

Returns a list of your registers (devices). This route should be used when your user needs to pick a register to send a charge to. 
This route returns an array of objects containing details and a register id to be used in POST terminal/charge

+ Request (application/json)

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
+ Response 200 (application/json)
    
        [
            {
                "id": "4f1b-f10a",
                "nickname": "Tech Area Z8 (3594291)",
                "status_port": "3594291",
                "serial": "124124",
                "type": "dejavoo",
                "model": "",
                "isDefault": false,
                "register_num": "3594291"
            },
            {
                "id": "18a3-83e7",
                "nickname": "DANIEL HOME OFFICE (3598304)",
                "status_port": "3598304",
                "serial": "123123",
                "type": "dejavoo",
                "model": "",
                "isDefault": true,
                "register_num": "3598304"
            },
            {
                "id": "94d1-318d",
                "nickname": "Tech Area Z1 (6880)",
                "status_port": "6880",
                "serial": "2434",
                "type": "dejavoo",
                "model": "",
                "isDefault": false,
                "register_num": "6880"
            }
        ]

### Charge (Queue) [POST /terminal/charge/queue]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

Wakes terminal with request for user to insert card. This call is asynchronous, it responds immidiately with a new transaction ID even before the terminal receives the request to start the transaction.
This is helpful, because where POST terminal/charge would timeout if a customer takes too long to swipe/dip, this call will still give you the transaction id.
Once you have the id, begin polling the [`GET transaction/{id}` resource](https://fattmerchant.docs.apiary.io/#reference/0/transactions/get-a-transaction's-information).

The [`GET /transaction/{id}`](https://fattmerchant.docs.apiary.io/#reference/0/transactions/get-a-transaction's-information) will return be the actual transaction record and show whether the transaction has been completed on the device.

We recommend checking the [`GET /transaction/{id}`](https://fattmerchant.docs.apiary.io/#reference/0/transactions/get-a-transaction's-information) 
every 5 seconds and no more.

**NOTE on throttling:** all api routes are throttled to 150 requests per minute per IP.

The `message` of the resulting transaction will be "terminalservice.waiting" until the transaction is finished, after that, the success flag will be either 0 or 1, and the `message` will either contain an error string, or be `''` (empty string).

**NOTE on customer experience:** we have found that once a customer sees the price show up on the terminal, 
many times they will begin a discussion about the price. 
Perhaps their goal is to alter the price. This takes time and often caused the old route (POST charge) 
to timeout. It can also cause extra strain on your servers and ours during polling with the charge/queue route. 
So we recommend showing the customer the price _before_ initiating the POST charge/queue. 
An easy way to do this is to use our [prompt route](https://fattmerchant.docs.apiary.io/#reference/0/terminals/prompt-(choice)) 
to display the price and have the user approve it. 
This way, the discussion can take place _before_ you initiate the charge. 

+ Request (application/json)

    **Attributes**
    
    * `total` (required, number, min:. .01) this float is required and will be the amount a customer is charged.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        - will be blindly stored and returned during a `GET` operation.
        - values in meta may also appear in an email receipt if the template calls for it.
        - the Fattmerchant front-end uses `subtotal`, `tax`, `memo`, `lineItems = []`
        
    * `printReceipt` (optional, string) Possible values: `No`, `Merchant`, `Customer`, `Both`. (defaults to `Both`)
    * `promptCardType` (optional, boolean) If true, will prompt the user to select Credit or Debit for this transaction.
    * `paymentType` (optional, string) Possible values: `Credit`, `Debit`, `Check`, `Gift`, `Loyalty`. (defaults to `Credit`)
    * `customerId`: (optional, string) The id of the customer attributed to this charge.
    * `invoiceId`: (optional, string) The id of the invoice attributed to this charge.
    * `register`: (required, string) The id of the register performing this operation.
    
    * `promptTipInput` (optional, boolean) If true, will prompt the user to input a custom tip that will be added to `total` and set to `meta.tip`. `promptTipInput` and `promptTipChoice` cannot both be true. (defaults to `false`) 
    * `promptTipChoice` (optional, boolean) If true, will prompt the user to select a tip from a list defined by either `percentageTipChoices` or `wholeTipChoices`. The selected tip will be added to `total` and set to `meta.tip`. See the following params for more details. (defaults to `false`)
    * `percentageTipThreshold` (optional, number) If `total` is greater than or equal to `percentageTipThreshold`, `percentageTipChoices` will be used. If the total is less than `percentageTipThreshold`, wholeTipChoices will be used. (defaults to `10`)
    * `percentageTipChoices` (optional, array) The array of tip percentages to show to the user. Tip amount will be automatically calculated and shown alongside the percent. (defaults to [15, 20, 25])
    * `wholeTipChoices` (optional, array) The array of flat dollar amount tips to show to the user. (defaults to [1, 3, 5])

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
                "total": 0.01,
                "meta": {
                    "lineItems": [],
                    "tax": 0,
                    "subtotal": 0.01,
                    "printReceipt": "Merchant",
                    "paymentType": "Credit",
                    "invoiceId": "02936d77-93cc-48a6-b712-7f7234c19b7c",
                    "message": "terminalservice.waiting",
                    "type": "charge",
                    "registerId": "ba5c-5b03",
                    "registerStatusPort": "3594291",
                    "registerNickname": "Dejavoo Z8",
                    "registerSerial": "",
                    "registerType": "dejavoo"
                },
                "printReceipt": "Both",
                "paymentType": "Credit",
                "customerId": "df25411e-4b01-4efe-8368-496b959b253f",
                "invoiceId": "",
                "register": "4f1b-f10a",
                "promptTipInput": false,
                "promptTipChoice": true,
                "percentageTipThreshold": 10, // in this case, since total is 0.01, wholeTipAmounts will be used
                "percentageTipChoices": [10, 18, 25],
                "wholeTipChoices": [1, 2, 4]
            }
    
+ Response 200 (application/json)

            {
                "id": "71d7f9ec-59d9-4fab-891e-fa612cd2e275",
                "invoice_id": "02936d77-93cc-48a6-b712-7f7234c19b7c",
                "reference_id": "",
                "recurring_transaction_id": "",
                "auth_id": null,
                "type": "charge",
                "source": "terminalservice.dejavoo",
                "source_ip": "127.0.0.1",
                "is_merchant_present": true,
                "merchant_id": "07420820-9b00-4816-9199-2071af7019f4",
                "user_id": "61822412-09b3-4f5a-a90f-fd9f1db703b4",
                "customer_id": "df25411e-4b01-4efe-8368-496b959b253f",
                "payment_method_id": null,
                "is_manual": true,
                "success": false,
                "message": "terminalservice.waiting",
                "meta": {
                    "lineItems": [],
                    "tax": 0,
                    "subtotal": 0.01,
                    "printReceipt": "Merchant",
                    "paymentType": "Credit",
                    "invoiceId": "02936d77-93cc-48a6-b712-7f7234c19b7c",
                    "message": "terminalservice.waiting",
                    "type": "charge",
                    "registerId": "ba5c-5b03",
                    "registerStatusPort": "3594291",
                    "registerNickname": "Dejavoo Z8",
                    "registerSerial": "",
                    "registerType": "dejavoo"
                },
                "total": 0.01,
                "method": "card",
                "pre_auth": false,
                "is_captured": 0,
                "last_four": "",
                "interchange_code": "",
                "interchange_fee": null,
                "batch_id": "",
                "batched_at": "2018-12-19 14:23:43",
                "emv_response": "",
                "avs_response": "",
                "cvv_response": "",
                "pos_entry": "",
                "pos_salesperson": "",
                "receipt_email_at": null,
                "receipt_sms_at": null,
                "settled_at": null,
                "created_at": "2018-12-19 19:23:43",
                "updated_at": "2018-12-19 19:23:43",
                "gateway_id": null,
                "total_refunded": 0,
                "is_refundable": false,
                "is_voided": false,
                "is_voidable": false,
                "schedule_id": null,
                "child_captures": [],
                "parent_auth": null,
                "gateway_name": "",
                "customer": {
                    "id": "df25411e-4b01-4efe-8368-496b959b253f",
                    "firstname": "Swipe",
                    "lastname": "Customer",
                    "company": "",
                    "email": "",
                    "cc_emails": null,
                    "cc_sms": null,
                    "phone": "",
                    "address_1": "",
                    "address_2": "",
                    "address_city": "",
                    "address_state": "",
                    "address_zip": "",
                    "address_country": "",
                    "notes": "",
                    "reference": "Physical Terminal customer",
                    "options": null,
                    "created_at": "2018-12-19 19:23:43",
                    "updated_at": "2018-12-19 19:23:43",
                    "deleted_at": null,
                    "allow_invoice_credit_card_payments": true,
                    "gravatar": false
                },
                "child_transactions": [],
                "files": [],
                "payment_method": null,
                "user": {
                    "id": "61822412-09b3-4f5a-a90f-fd9f1db703b4",
                    "name": "David Johnson",
                    "email": "demo1@abc.com",
                    "email_verification_sent_at": "2018-09-27 15:24:38",
                    "email_verified_at": "2017-12-05 19:05:53",
                    "is_api_key": false,
                    "acknowledgments": {
                        "setPassword": true,
                        "godviewOmniSearchTooltip": true,
                        "tutorial": true,
                        "godviewWelcome": true
                    },
                    "created_at": "2016-12-05 19:05:53",
                    "updated_at": "2018-11-20 14:51:28",
                    "deleted_at": null,
                    "brand": "Fattmerchant",
                    "gravatar": "//www.gravatar.com/avatar/1cd5aef1d36d07e495abb73061f857d4",
                    "team_admin": null,
                    "team_enabled": null,
                    "team_role": null,
                    "merchant_options": [],
                    "is_default": false
                }
            }

### Charge [POST /terminal/charge]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

Wakes terminal with request for user to insert card. This call is SYNCHRONOUS, meaning, the network call will stay open until the transaction is finished.
The call will timeout after only 60 seconds if the transaction is not completed, and you will not recieve the response, unless you poll the GET transactions resource. For this reason, we reccommend using the `charge/queue` resource above.

**WARNING:** Only use this call for customers who will not exceed the 60 second timeout - the charge/queue route is a more robust (and newer solution). **IF YOU USE THIS ROUTE, AND A CUSTOMER TAKES LONGER THAN 60 SECONDS, YOUR TRANSACTION WILL NOT BE RECORDED IN FATTMERCHANT**

+ Request (application/json)

    **Attributes**
    
    * `total` (required, number, min:. .01) this float is required and will be the amount a customer is charged.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        - will be blindly stored and returned during a `GET` operation.
        - values in meta may also appear in an email receipt if the template calls for it.
        - the Fattmerchant front-end uses `subtotal`, `tax`, `memo`, `lineItems = []`
        
    * `printReceipt` (optional, string) Possible values: `No`, `Merchant`, `Customer`, `Both`. (defaults to `Both`)
    * `paymentType` (optional, string) Possible values: `Credit`, `Debit`, `Check`, `Gift`, `Loyalty`. (defaults to `Credit`)
    * `customerId`: (optional, string) The id of the customer attributed to this charge.
    * `invoiceId`: (optional, string) The id of the invoice attributed to this charge.
    * `register`: (required, string) The id of the register performing this operation.
    
    * `promptTipInput` (optional, boolean) If true, will prompt the user to input a custom tip that will be added to `total` and set to `meta.tip`. `promptTipInput` and `promptTipChoice` cannot both be true. (defaults to `false`) 
    * `promptTipChoice` (optional, boolean) If true, will prompt the user to select a tip from a list defined by either `percentageTipChoices` or `wholeTipChoices`. The selected tip will be added to `total` and set to `meta.tip`. See the following params for more details. (defaults to `false`)
    * `percentageTipThreshold` (optional, number) If `total` is greater than or equal to `percentageTipThreshold`, `percentageTipChoices` will be used. If the total is less than `percentageTipThreshold`, wholeTipChoices will be used. (defaults to `10`)
    * `percentageTipChoices` (optional, array) The array of tip percentages to show to the user. Tip amount will be automatically calculated and shown alongside the percent. (defaults to [15, 20, 25])
    * `wholeTipChoices` (optional, array) The array of flat dollar amount tips to show to the user. (defaults to [1, 3, 5])

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
                "total": 0.01,
                "meta": {
                    "tax":0,
                    "subtotal":0.01,
                    "lineItems": [
                        {
                            "id": "optional-fm-catalog-item-id",
                            "item":"Demo Item",
                            "details":"this is a regular demo item",
                            "quantity":1,
                            "price": 0.01
                        }
                    ]
                },
                 "paymentType": "Credit",
                 "customerId": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                 "invoiceId": "",
                 "register": "4f1b-f10a",
                 "promptTipInput": false,
                 "promptTipChoice": true,
                 "percentageTipThreshold": 10, // in this case, since total is 0.01, wholeTipAmounts will be used
                  "percentageTipChoices": [10, 18, 25],
                 "wholeTipChoices": [1, 2, 4]
            }

 
+ Response 200 (application/json)

            {
              "id": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "auth_id": null,
              "type": "charge",
              "source": "terminalservice.dejavoo",
              "is_merchant_present": true,
              "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
              "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
              "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
              "payment_method_id": "e422a5a1-0088-4038-ae22-7a6d17aaf599",
              "is_manual": true,
              "success": true,
              "message": "",
              "meta": {
                "lineItems": [
                  {
                    "id": "optional-fm-catalog-item-id",
                    "item":"Demo Item",
                    "details":"this is a regular demo item",
                    "quantity":1,
                    "price": 0.01
                  }
                ],
                "subtotal": 0.01,
                "tax": 0,
                "taxRate": 10,
                "isBulkInvoice": false,
                "taxOverride": false,
                "update_inventory": true,
                "reference": 2477,
                "RegisterId": 3594291,
                "ResultCode": 0,
                "RespMSG": "APPROVAL 145599",
                "Message": "Approved",
                "AuthCode": 145599,
                "PNRef": 810618212223,
                "PaymentType": "Credit",
                "TransType": "Sale",
                "SN": 118816524647,
                "ExtData": {
                  "Amount": "0.01",
                  "InvNum": "6",
                  "CardType": "VISA",
                  "BatchNum": "56",
                  "Tip": "0.00",
                  "CashBack": "0.00",
                  "Fee": "0.00",
                  "AcntLast4": "0281",
                  "Name": "YOU/A GIFT FOR",
                  "SVC": "0.00",
                  "TotalAmt": "0.01",
                  "DISC": "0.00",
                  "Donation": "0.00",
                  "SHFee": "0.00",
                  "RwdPoints": "0",
                  "RwdBalance": "0",
                  "RwdIssued": "",
                  "EBTFSLedgerBalance": "",
                  "EBTFSAvailBalance": "",
                  "EBTFSBeginBalance": "",
                  "EBTCashLedgerBalance": "",
                  "EBTCashAvailBalance": "",
                  "EBTCashBeginBalance": "",
                  "RewardCode": "",
                  "AcqRefData": "",
                  "ProcessData": "",
                  "RefNo": "",
                  "RewardQR": "",
                  "Language": "English",
                  "EntryType": "Swipe",
                  "table_num": "0",
                  "clerk_id": "",
                  "ticket_num": "",
                  "ControlNum": "",
                  "TaxCity": "0.00",
                  "TaxState": "0.00",
                  "Cust1": "",
                  "Cust1Value": "",
                  "Cust2": "",
                  "Cust2Value": "",
                  "Cust3": "",
                  "Cust3Value": "",
                  "AcntFirst4": "4941"
                },
                "CVMResult": 2,
                "cancelled": false,
                "gatewayStatus": 200,
                "gatewayStatusText": "OK",
                "printReceipt": "Both",
                "paymentType": "Credit",
                "type": "charge",
                "registerId": "4f1b-f10a",
                "registerStatusPort": "3594291",
                "registerNickname": "Tech Area Z8 (3594291)",
                "registerSerial": "124124",
                "registerType": "dejavoo"
              },
              "total": 0.01,
              "method": "card",
              "pre_auth": false,
              "is_captured": 0,
              "last_four": "",
              "interchange_code": "",
              "interchange_fee": null,
              "batch_id": "",
              "batched_at": "2018-04-16 18:55:32",
              "emv_response": "",
              "avs_response": "",
              "cvv_response": "",
              "pos_entry": "",
              "pos_salesperson": "",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2018-04-16 18:55:32",
              "updated_at": "2018-04-16 18:55:32",
              "total_refunded": 0,
              "is_refundable": true,
              "is_voided": false,
              "is_voidable": true,
              "schedule_id": null,
              "child_captures": [],
              "parent_auth": null,
              "customer": {
                "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "firstname": "A",
                "lastname": "Customer",
                "company": "",
                "email": "",
                "cc_emails": [],
                "cc_sms": null,
                "phone": "",
                "address_1": "",
                "address_2": "",
                "address_city": "",
                "address_state": "",
                "address_zip": "",
                "address_country": "USA",
                "notes": "",
                "reference": "",
                "options": "",
                "created_at": "2018-02-23 22:32:19",
                "updated_at": "2018-02-23 22:32:19",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": false
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "e422a5a1-0088-4038-ae22-7a6d17aaf599",
                "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
                "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "nickname": "VISA: YOU/A GIFT FOR (ending in: 0281)",
                "has_cvv": 0,
                "is_default": 1,
                "method": "card",
                "person_name": "YOU/A GIFT FOR",
                "card_type": "visa",
                "card_last_four": "0281",
                "card_exp": "992099",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "",
                "address_country": "",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-04-16 18:55:31",
                "updated_at": "2018-04-16 18:55:31",
                "card_exp_datetime": "2107-03-31 23:59:59",
                "customer": {
                  "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                  "firstname": "A",
                  "lastname": "Customer",
                  "company": "",
                  "email": "",
                  "cc_emails": [],
                  "cc_sms": null,
                  "phone": "",
                  "address_1": "",
                  "address_2": "",
                  "address_city": "",
                  "address_state": "",
                  "address_zip": "",
                  "address_country": "USA",
                  "notes": "",
                  "reference": "",
                  "options": "",
                  "created_at": "2018-02-23 22:32:19",
                  "updated_at": "2018-02-23 22:32:19",
                  "deleted_at": null,
                  "allow_invoice_credit_card_payments": true,
                  "gravatar": false
                }
              },
              "user": {
                "id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "system_admin": true,
                "name": "David Johnson",
                "email": "demo1@abc.com",
                "email_verification_sent_at": "2017-05-16 17:35:16",
                "email_verified_at": "2017-05-16 17:35:33",
                "is_api_key": false,
                "acknowledgments": {
                  "tutorial": true,
                  "godviewWelcome": true
                },
                "created_at": "2016-05-12 15:57:19",
                "updated_at": "2018-04-16 18:08:55",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/1cd5aef1d36d07e495abb73061f857d4",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }

+ Response 400 (application/json)

        {
            "success": false,
            "message": "User Cancelled",
            "gatewayStatus": 200,
            "gatewayStatusText": "OK",
            "cancelled": true,
            "status": 400
        }

+ Response 422 (application/json)

        {
            "validation": "register not found",
            "status": 422,
            "message": "Validation Error"
        }

### Credit [POST /terminal/credit]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

Wakes terminal with request for user to insert card for a credit.

+ Request (application/json)

    **Attributes**
    
    * `total` (required, number, min:. .01) this float is required and will be the amount a customer is credited.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        - will be blindly stored and returned during a `GET` operation.
        - values in meta may also appear in an email receipt if the template calls for it.
        - the Fattmerchant front-end uses `subtotal`, `tax`, `memo`, `lineItems = []`
        
    * `printReceipt` (optional, string) Possible values: `No`, `Merchant`, `Customer`, `Both`. (defaults to `Both`)
    * `paymentType` (optional, string) Possible values: `Credit`, `Debit`, `Check`, `Gift`, `Loyalty`
    * `customerId`: (optional, string) The id of the customer attributed to this credit.
    * `invoiceId`: (optional, string) The id of the invoice attributed to this charge.
    * `register`: (required, string) The id of the register performing this operation.

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
            
            {
              "meta": {
                "reference": 2479,
                "taxRate": 10,
                "tax": 0,
                "subtotal": -0.02,
                "lineItems": [
                  {
                    "price": "-0.02",
                    "quantity": 1,
                    "details": "",
                    "item": "Item Name"
                  }
                ]
              },
              "customerId": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
              "invoiceId": "",
              "register": "4f1b-f10a",
              "total": 0.02
            }

 
+ Response 200 (application/json)

            {
              "id": "07b7f3ac-20f0-472a-bf51-a4d534d1579d",
              "invoice_id": "",
              "reference_id": "",
              "recurring_transaction_id": "",
              "auth_id": null,
              "type": "credit",
              "source": "terminalservice.dejavoo",
              "is_merchant_present": true,
              "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
              "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
              "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
              "payment_method_id": "bb61a1f5-c3ab-460f-ba8f-0aef9b4c550b",
              "is_manual": true,
              "success": true,
              "message": "",
              "meta": {
                "reference": 2479,
                "update_inventory": true,
                "taxOverride": false,
                "isBulkInvoice": false,
                "taxRate": 10,
                "tax": 0,
                "subtotal": -0.02,
                "lineItems": [
                  {
                    "price": "-0.02",
                    "quantity": 1,
                    "details": "",
                    "item": "Item Name"
                  }
                ],
                "RegisterId": 3594291,
                "ResultCode": 0,
                "RespMSG": "Approved Offline",
                "Message": "Approved",
                "PaymentType": "Credit",
                "TransType": "Return",
                "SN": 118816524647,
                "ExtData": {
                  "Amount": "0.02",
                  "InvNum": "7",
                  "CardType": "VISA",
                  "BatchNum": "56",
                  "Tip": "0.00",
                  "CashBack": "0.00",
                  "Fee": "0.00",
                  "AcntLast4": "1396",
                  "Name": "JOHNSON/DAVID",
                  "SVC": "0.00",
                  "TotalAmt": "0.02",
                  "DISC": "0.00",
                  "Donation": "0.00",
                  "SHFee": "0.00",
                  "RwdPoints": "0",
                  "RwdBalance": "0",
                  "RwdIssued": "",
                  "EBTFSLedgerBalance": "",
                  "EBTFSAvailBalance": "",
                  "EBTFSBeginBalance": "",
                  "EBTCashLedgerBalance": "",
                  "EBTCashAvailBalance": "",
                  "EBTCashBeginBalance": "",
                  "RewardCode": "",
                  "AcqRefData": "",
                  "ProcessData": "",
                  "RefNo": "",
                  "RewardQR": "",
                  "Language": "English",
                  "EntryType": "CHIP",
                  "table_num": "0",
                  "clerk_id": "",
                  "ticket_num": "",
                  "ControlNum": "",
                  "TaxCity": "0.00",
                  "TaxState": "0.00",
                  "Cust1": "",
                  "Cust1Value": "",
                  "Cust2": "",
                  "Cust2Value": "",
                  "Cust3": "",
                  "Cust3Value": "",
                  "AcntFirst4": "4147"
                },
                "EMVData": {
                  "AID": "A0000000031010",
                  "AppName": "CHASE VISA",
                  "TVR": "0080008000",
                  "TSI": "E800",
                  "IAD": "",
                  "ARC": "00"
                },
                "CVMResult": 2,
                "cancelled": false,
                "gatewayStatus": 200,
                "gatewayStatusText": "OK",
                "printReceipt": "Both",
                "paymentType": "Credit",
                "type": "credit",
                "registerId": "4f1b-f10a",
                "registerStatusPort": "3594291",
                "registerNickname": "Tech Area Z8 (3594291)",
                "registerSerial": "124124",
                "registerType": "dejavoo"
              },
              "total": 0.02,
              "method": "card",
              "pre_auth": false,
              "is_captured": 0,
              "last_four": "",
              "interchange_code": "",
              "interchange_fee": null,
              "batch_id": "",
              "batched_at": "2018-04-16 19:02:24",
              "emv_response": "",
              "avs_response": "",
              "cvv_response": "",
              "pos_entry": "",
              "pos_salesperson": "",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2018-04-16 19:02:24",
              "updated_at": "2018-04-16 19:02:24",
              "total_refunded": 0,
              "is_refundable": false,
              "is_voided": false,
              "is_voidable": true,
              "schedule_id": null,
              "child_captures": [],
              "parent_auth": null,
              "customer": {
                "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "firstname": "A",
                "lastname": "Customer",
                "company": "",
                "email": "",
                "cc_emails": [],
                "cc_sms": null,
                "phone": "",
                "address_1": "",
                "address_2": "",
                "address_city": "",
                "address_state": "",
                "address_zip": "",
                "address_country": "USA",
                "notes": "",
                "reference": "",
                "options": "",
                "created_at": "2018-02-23 22:32:19",
                "updated_at": "2018-02-23 22:32:19",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": false
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "bb61a1f5-c3ab-460f-ba8f-0aef9b4c550b",
                "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
                "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "nickname": "VISA: JOHNSON/DAVID (ending in: 1396)",
                "has_cvv": 0,
                "is_default": 1,
                "method": "card",
                "person_name": "JOHNSON/DAVID",
                "card_type": "visa",
                "card_last_four": "1396",
                "card_exp": "992099",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "",
                "address_country": "",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-04-16 19:02:24",
                "updated_at": "2018-04-16 19:02:24",
                "card_exp_datetime": "2107-03-31 23:59:59",
                "customer": {
                  "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                  "firstname": "A",
                  "lastname": "Customer",
                  "company": "",
                  "email": "",
                  "cc_emails": [],
                  "cc_sms": null,
                  "phone": "",
                  "address_1": "",
                  "address_2": "",
                  "address_city": "",
                  "address_state": "",
                  "address_zip": "",
                  "address_country": "USA",
                  "notes": "",
                  "reference": "",
                  "options": "",
                  "created_at": "2018-02-23 22:32:19",
                  "updated_at": "2018-02-23 22:32:19",
                  "deleted_at": null,
                  "allow_invoice_credit_card_payments": true,
                  "gravatar": false
                }
              },
              "user": {
                "id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "system_admin": true,
                "name": "David Johnson",
                "email": "demo1@abc.com",
                "email_verification_sent_at": "2017-05-16 17:35:16",
                "email_verified_at": "2017-05-16 17:35:33",
                "is_api_key": false,
                "acknowledgments": {
                  "tutorial": true,
                  "godviewWelcome": true
                },
                "created_at": "2016-05-12 15:57:19",
                "updated_at": "2018-04-16 18:08:55",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/1cd5aef1d36d07e495abb73061f857d4",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }

+ Response 400 (application/json)

        {
            "success": false,
            "message": "User Cancelled",
            "gatewayStatus": 200,
            "gatewayStatusText": "OK",
            "cancelled": true,
            "status": 400
        }

+ Response 422 (application/json)

        {
            "validation": "register not found",
            "status": 422,
            "message": "Validation Error"
        }

### Void or Refund (omni picks for you) [POST /terminal/void-or-refund]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

This is the preferred method for cancelling an existing transaction.

Wakes terminal for either a refund OR a void. Given a transactionId in the POST body, the Omni terminal resource will decide 
whether to process a refund OR a void depending on the `created_at` date of the original transaction.
If the date is before the current batch time (usually 8pm EST) the transaction will be voided (removed from the current batch)
If the transaction was already batched, the terminal will begin a refund request and the customer will be prompted
to insert a card.

If the terminal runs a void (because the transaction hasn't batched yet, the customer doesn't need to do anything.
The terminal will simply print a void reciept (depending on the value of `printReceipt`)

If given a register id, the void or refund will be sent to the register (terminal) specified. However, if the transaction needs to be voided, the register id MUST be the same id as the original transaction.
One register cannot be used to void a transaction on a separate register. It is therefore recommended that you DO NOT supply a register id.

The sample body shows the result if refund is chosen. For a void sample, (please see the void result)[https://fattmerchant.docs.apiary.io/#reference/0/terminals/void]. 

+ Request (application/json)

    **Attributes**
    
    * `total` (required, number, min:. .01) this float is required and will be the amount a customer is charged.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        - will be blindly stored and returned during a `GET` operation.
        - values in meta may also appear in an email receipt if the template calls for it.
        - the Fattmerchant front-end uses `subtotal`, `tax`, `memo`, `lineItems = []`
        
    * `printReceipt` (optional, string) Possible values: `No`, `Merchant`, `Customer`, `Both`. (defaults to `Both`)
    * `paymentType` (optional, string) Possible values: `Credit`, `Debit`, `Check`, `Gift`, `Loyalty`
    * `transactionId`: (required, string) The id of the transaction being refunded.
    * `register`: (required, string) The id of the register performing this operation.


    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
              "meta": {
                "reference": 2479,
                "taxRate": 10,
                "tax": 0,
                "subtotal": -0.02,
                "lineItems": [
                  {
                    "price": "-0.02",
                    "quantity": 1,
                    "details": "",
                    "item": "Item Name"
                  }
                ]
              },
              "transactionId": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1",
              "printReceipt": "Merchant",
              "paymentType": "Credit",
              "register": "4f1b-f10a",
              "total": 0.02
            }

 
+ Response 200 (application/json)

            {
              "id": "4be11b7e-21cb-4c9e-ba8f-5e173d13d7b7",
              "invoice_id": "",
              "reference_id": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1",
              "recurring_transaction_id": "",
              "auth_id": null,
              "type": "refund",
              "source": "terminalservice.dejavoo",
              "is_merchant_present": true,
              "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
              "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
              "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
              "payment_method_id": "bf1aee65-dad9-4b74-8800-a75e435e3e7b",
              "is_manual": true,
              "success": true,
              "message": "",
              "meta": {
                "lineItems": [
                  {
                    "item": "",
                    "details": "",
                    "quantity": 1,
                    "price": "0.01"
                  }
                ],
                "subtotal": 0.01,
                "tax": 0,
                "taxRate": 10,
                "isBulkInvoice": false,
                "taxOverride": false,
                "update_inventory": true,
                "reference": 2477,
                "RegisterId": 3594291,
                "ResultCode": 0,
                "RespMSG": "Approved Offline",
                "Message": "Approved",
                "AuthCode": 145599,
                "PNRef": 810618212223,
                "PaymentType": "Credit",
                "TransType": "Return",
                "SN": 118816524647,
                "ExtData": {
                  "Amount": "0.01",
                  "InvNum": "10",
                  "CardType": "VISA",
                  "BatchNum": "56",
                  "Tip": "0.00",
                  "CashBack": "0.00",
                  "Fee": "0.00",
                  "AcntLast4": "0281",
                  "Name": "YOU/A GIFT FOR",
                  "SVC": "0.00",
                  "TotalAmt": "0.01",
                  "DISC": "0.00",
                  "Donation": "0.00",
                  "SHFee": "0.00",
                  "RwdPoints": "0",
                  "RwdBalance": "0",
                  "RwdIssued": "",
                  "EBTFSLedgerBalance": "",
                  "EBTFSAvailBalance": "",
                  "EBTFSBeginBalance": "",
                  "EBTCashLedgerBalance": "",
                  "EBTCashAvailBalance": "",
                  "EBTCashBeginBalance": "",
                  "RewardCode": "",
                  "AcqRefData": "",
                  "ProcessData": "",
                  "RefNo": "",
                  "RewardQR": "",
                  "Language": "English",
                  "EntryType": "Swipe",
                  "table_num": "0",
                  "clerk_id": "",
                  "ticket_num": "",
                  "ControlNum": "",
                  "TaxCity": "0.00",
                  "TaxState": "0.00",
                  "Cust1": "",
                  "Cust1Value": "",
                  "Cust2": "",
                  "Cust2Value": "",
                  "Cust3": "",
                  "Cust3Value": "",
                  "AcntFirst4": "4941"
                },
                "CVMResult": 2,
                "cancelled": false,
                "gatewayStatus": 200,
                "gatewayStatusText": "OK",
                "printReceipt": "Both",
                "paymentType": "Credit",
                "type": "refund",
                "registerId": "4f1b-f10a",
                "registerStatusPort": "3594291",
                "registerNickname": "Tech Area Z8 (3594291)",
                "registerSerial": "124124",
                "registerType": "dejavoo"
              },
              "total": 0.01,
              "method": "card",
              "pre_auth": false,
              "is_captured": 0,
              "last_four": "5114",
              "interchange_code": "",
              "interchange_fee": null,
              "batch_id": "",
              "batched_at": "2018-04-16 19:09:37",
              "emv_response": "",
              "avs_response": "",
              "cvv_response": "",
              "pos_entry": "",
              "pos_salesperson": "",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2018-04-16 19:09:37",
              "updated_at": "2018-04-16 19:09:37",
              "total_refunded": 0,
              "is_refundable": false,
              "is_voided": false,
              "is_voidable": false,
              "schedule_id": null,
              "child_captures": [],
              "parent_auth": null,
              "customer": {
                "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "firstname": "A",
                "lastname": "Customer",
                "company": "",
                "email": "",
                "cc_emails": [],
                "cc_sms": null,
                "phone": "",
                "address_1": "",
                "address_2": "",
                "address_city": "",
                "address_state": "",
                "address_zip": "",
                "address_country": "USA",
                "notes": "",
                "reference": "",
                "options": "",
                "created_at": "2018-02-23 22:32:19",
                "updated_at": "2018-02-23 22:32:19",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": false
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "bf1aee65-dad9-4b74-8800-a75e435e3e7b",
                "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
                "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "nickname": "VISA: YOU/A GIFT FOR (ending in: 0281)",
                "has_cvv": 0,
                "is_default": 1,
                "method": "card",
                "person_name": "YOU/A GIFT FOR",
                "card_type": "visa",
                "card_last_four": "0281",
                "card_exp": "992099",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "",
                "address_country": "",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-04-16 19:09:36",
                "updated_at": "2018-04-16 19:09:36",
                "card_exp_datetime": "2107-03-31 23:59:59",
                "customer": {
                  "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                  "firstname": "A",
                  "lastname": "Customer",
                  "company": "",
                  "email": "",
                  "cc_emails": [],
                  "cc_sms": null,
                  "phone": "",
                  "address_1": "",
                  "address_2": "",
                  "address_city": "",
                  "address_state": "",
                  "address_zip": "",
                  "address_country": "USA",
                  "notes": "",
                  "reference": "",
                  "options": "",
                  "created_at": "2018-02-23 22:32:19",
                  "updated_at": "2018-02-23 22:32:19",
                  "deleted_at": null,
                  "allow_invoice_credit_card_payments": true,
                  "gravatar": false
                }
              },
              "user": {
                "id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "system_admin": true,
                "name": "David Johnson",
                "email": "demo1@abc.com",
                "email_verification_sent_at": "2017-05-16 17:35:16",
                "email_verified_at": "2017-05-16 17:35:33",
                "is_api_key": false,
                "acknowledgments": {
                  "tutorial": true,
                  "godviewWelcome": true
                },
                "created_at": "2016-05-12 15:57:19",
                "updated_at": "2018-04-16 18:08:55",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/1cd5aef1d36d07e495abb73061f857d4",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }

+ Response 400 (application/json)

        {
            "success": false,
            "message": "User Cancelled",
            "gatewayStatus": 200,
            "gatewayStatusText": "OK",
            "cancelled": true,
            "status": 400
        }

+ Response 422 (application/json)

        {
            "validation": "register not found",
            "status": 422,
            "message": "Validation Error"
        }

### Refund [POST /terminal/refund]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

(Advanced)
For processing refunds, we highly recommend using [void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/terminals/void-or-refund-(omni-picks-for-you)).
Only use this route if you are CERTAIN the transaction has already batched.

Wakes terminal with request for user to insert card for a refund.

+ Request (application/json)

    **Attributes**
    
    * `total` (required, number, min:. .01) this float is required and will be the amount a customer is charged.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        - will be blindly stored and returned during a `GET` operation.
        - values in meta may also appear in an email receipt if the template calls for it.
        - the Fattmerchant front-end uses `subtotal`, `tax`, `memo`, `lineItems = []`
        
    * `printReceipt` (optional, string) Possible values: `No`, `Merchant`, `Customer`, `Both`. (defaults to `Both`)
    * `paymentType` (optional, string) Possible values: `Credit`, `Debit`, `Check`, `Gift`, `Loyalty`
    * `transactionId`: (required, string) The id of the transaction being refunded.
    * `register`: (required, string) The id of the register performing this operation.


    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body

            {
              "meta": {
                "reference": 2479,
                "taxRate": 10,
                "tax": 0,
                "subtotal": -0.02,
                "lineItems": [
                  {
                    "price": "-0.02",
                    "quantity": 1,
                    "details": "",
                    "item": "Item Name"
                  }
                ]
              },
              "transactionId": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1",
              "printReceipt": "Merchant",
              "paymentType": "Credit",
              "register": "4f1b-f10a",
              "total": 0.02
            }

 
+ Response 200 (application/json)

            {
              "id": "4be11b7e-21cb-4c9e-ba8f-5e173d13d7b7",
              "invoice_id": "",
              "reference_id": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1",
              "recurring_transaction_id": "",
              "auth_id": null,
              "type": "refund",
              "source": "terminalservice.dejavoo",
              "is_merchant_present": true,
              "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
              "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
              "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
              "payment_method_id": "bf1aee65-dad9-4b74-8800-a75e435e3e7b",
              "is_manual": true,
              "success": true,
              "message": "",
              "meta": {
                "lineItems": [
                  {
                    "item": "",
                    "details": "",
                    "quantity": 1,
                    "price": "0.01"
                  }
                ],
                "subtotal": 0.01,
                "tax": 0,
                "taxRate": 10,
                "isBulkInvoice": false,
                "taxOverride": false,
                "update_inventory": true,
                "reference": 2477,
                "RegisterId": 3594291,
                "ResultCode": 0,
                "RespMSG": "Approved Offline",
                "Message": "Approved",
                "AuthCode": 145599,
                "PNRef": 810618212223,
                "PaymentType": "Credit",
                "TransType": "Return",
                "SN": 118816524647,
                "ExtData": {
                  "Amount": "0.01",
                  "InvNum": "10",
                  "CardType": "VISA",
                  "BatchNum": "56",
                  "Tip": "0.00",
                  "CashBack": "0.00",
                  "Fee": "0.00",
                  "AcntLast4": "0281",
                  "Name": "YOU/A GIFT FOR",
                  "SVC": "0.00",
                  "TotalAmt": "0.01",
                  "DISC": "0.00",
                  "Donation": "0.00",
                  "SHFee": "0.00",
                  "RwdPoints": "0",
                  "RwdBalance": "0",
                  "RwdIssued": "",
                  "EBTFSLedgerBalance": "",
                  "EBTFSAvailBalance": "",
                  "EBTFSBeginBalance": "",
                  "EBTCashLedgerBalance": "",
                  "EBTCashAvailBalance": "",
                  "EBTCashBeginBalance": "",
                  "RewardCode": "",
                  "AcqRefData": "",
                  "ProcessData": "",
                  "RefNo": "",
                  "RewardQR": "",
                  "Language": "English",
                  "EntryType": "Swipe",
                  "table_num": "0",
                  "clerk_id": "",
                  "ticket_num": "",
                  "ControlNum": "",
                  "TaxCity": "0.00",
                  "TaxState": "0.00",
                  "Cust1": "",
                  "Cust1Value": "",
                  "Cust2": "",
                  "Cust2Value": "",
                  "Cust3": "",
                  "Cust3Value": "",
                  "AcntFirst4": "4941"
                },
                "CVMResult": 2,
                "cancelled": false,
                "gatewayStatus": 200,
                "gatewayStatusText": "OK",
                "printReceipt": "Both",
                "paymentType": "Credit",
                "type": "refund",
                "registerId": "4f1b-f10a",
                "registerStatusPort": "3594291",
                "registerNickname": "Tech Area Z8 (3594291)",
                "registerSerial": "124124",
                "registerType": "dejavoo"
              },
              "total": 0.01,
              "method": "card",
              "pre_auth": false,
              "is_captured": 0,
              "last_four": "5114",
              "interchange_code": "",
              "interchange_fee": null,
              "batch_id": "",
              "batched_at": "2018-04-16 19:09:37",
              "emv_response": "",
              "avs_response": "",
              "cvv_response": "",
              "pos_entry": "",
              "pos_salesperson": "",
              "receipt_email_at": null,
              "receipt_sms_at": null,
              "created_at": "2018-04-16 19:09:37",
              "updated_at": "2018-04-16 19:09:37",
              "total_refunded": 0,
              "is_refundable": false,
              "is_voided": false,
              "is_voidable": false,
              "schedule_id": null,
              "child_captures": [],
              "parent_auth": null,
              "customer": {
                "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "firstname": "A",
                "lastname": "Customer",
                "company": "",
                "email": "",
                "cc_emails": [],
                "cc_sms": null,
                "phone": "",
                "address_1": "",
                "address_2": "",
                "address_city": "",
                "address_state": "",
                "address_zip": "",
                "address_country": "USA",
                "notes": "",
                "reference": "",
                "options": "",
                "created_at": "2018-02-23 22:32:19",
                "updated_at": "2018-02-23 22:32:19",
                "deleted_at": null,
                "allow_invoice_credit_card_payments": true,
                "gravatar": false
              },
              "child_transactions": [],
              "files": [],
              "payment_method": {
                "id": "bf1aee65-dad9-4b74-8800-a75e435e3e7b",
                "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
                "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "nickname": "VISA: YOU/A GIFT FOR (ending in: 0281)",
                "has_cvv": 0,
                "is_default": 1,
                "method": "card",
                "person_name": "YOU/A GIFT FOR",
                "card_type": "visa",
                "card_last_four": "0281",
                "card_exp": "992099",
                "bank_name": null,
                "bank_type": null,
                "bank_holder_type": null,
                "address_1": null,
                "address_2": null,
                "address_city": null,
                "address_state": null,
                "address_zip": "",
                "address_country": "",
                "purged_at": null,
                "deleted_at": null,
                "created_at": "2018-04-16 19:09:36",
                "updated_at": "2018-04-16 19:09:36",
                "card_exp_datetime": "2107-03-31 23:59:59",
                "customer": {
                  "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
                  "firstname": "A",
                  "lastname": "Customer",
                  "company": "",
                  "email": "",
                  "cc_emails": [],
                  "cc_sms": null,
                  "phone": "",
                  "address_1": "",
                  "address_2": "",
                  "address_city": "",
                  "address_state": "",
                  "address_zip": "",
                  "address_country": "USA",
                  "notes": "",
                  "reference": "",
                  "options": "",
                  "created_at": "2018-02-23 22:32:19",
                  "updated_at": "2018-02-23 22:32:19",
                  "deleted_at": null,
                  "allow_invoice_credit_card_payments": true,
                  "gravatar": false
                }
              },
              "user": {
                "id": "dbc85118-3309-4129-b966-0108c0fb18a0",
                "system_admin": true,
                "name": "David Johnson",
                "email": "demo1@abc.com",
                "email_verification_sent_at": "2017-05-16 17:35:16",
                "email_verified_at": "2017-05-16 17:35:33",
                "is_api_key": false,
                "acknowledgments": {
                  "tutorial": true,
                  "godviewWelcome": true
                },
                "created_at": "2016-05-12 15:57:19",
                "updated_at": "2018-04-16 18:08:55",
                "deleted_at": null,
                "gravatar": "//www.gravatar.com/avatar/1cd5aef1d36d07e495abb73061f857d4",
                "team_admin": null,
                "team_enabled": null,
                "team_role": null,
                "merchant_options": [],
                "is_portal": false
              }
            }

+ Response 400 (application/json)

        {
            "success": false,
            "message": "User Cancelled",
            "gatewayStatus": 200,
            "gatewayStatusText": "OK",
            "cancelled": true,
            "status": 400
        }

+ Response 422 (application/json)

        {
            "validation": "register not found",
            "status": 422,
            "message": "Validation Error"
        }

### Void [POST /terminal/void]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

(Advanced)
For processing voids, we highly recommend using [void-or-refund](https://fattmerchant.docs.apiary.io/#reference/0/terminals/void-or-refund-(omni-picks-for-you)).
Only use this route if you are CERTAIN the transaction has NOT BEEN batched.

Wakes terminal with request for user to insert card for a void.

+ Request (application/json)

    **Attributes**
    
    * `total` (required, number, min:. .01) this float is required and will be the amount of the void.
    * `meta` (required, json literal) i.e. `{"tax":2,"subtotal":10}` can contain any json object
        - will be blindly stored and returned during a `GET` operation.
        - values in meta may also appear in an email receipt if the template calls for it.
        - the Fattmerchant front-end uses `subtotal`, `tax`, `memo`, `lineItems = []`
        
    * `printReceipt` (optional, string) Possible values: `No`, `Merchant`, `Customer`, `Both`. (defaults to `Both`)
    * `paymentType` (optional, string) Possible values: `Credit`, `Debit`, `Check`, `Gift`, `Loyalty`
    * `transactionId`: (required, string) The id of the transaction being voided.
    * `invoiceId`: (optional, string) The id of the invoice attributed to this charge.
    * `register`: (required, string) The id of the register performing this operation.


    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
            
            {
              "meta": {
                "reference": 2479,
                "taxRate": 10,
                "tax": 0,
                "subtotal": -0.02,
                "lineItems": [
                  {
                    "price": "-0.02",
                    "quantity": 1,
                    "details": "",
                    "item": "Item Name"
                  }
                ]
              },
              "transactionId": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1",
              "printReceipt": "Merchant",
              "paymentType": "Credit",
              "register": "4f1b-f10a",
              "total": 0.02
            }

+ Response 200 (application/json)

        {
          "id": "796998bc-8d7d-42ab-bdbd-1c9c6c94f801",
          "invoice_id": "",
          "reference_id": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1",
          "recurring_transaction_id": "",
          "auth_id": null,
          "type": "void",
          "source": "terminalservice.dejavoo",
          "is_merchant_present": true,
          "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
          "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
          "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
          "payment_method_id": "e422a5a1-0088-4038-ae22-7a6d17aaf599",
          "is_manual": true,
          "success": true,
          "message": "",
          "meta": {
            "lineItems": [
              {
                "item": "",
                "details": "",
                "quantity": 1,
                "price": "0.01"
              }
            ],
            "subtotal": 0.01,
            "tax": 0,
            "taxRate": 10,
            "isBulkInvoice": false,
            "taxOverride": false,
            "update_inventory": true,
            "reference": 2477,
            "RegisterId": 3594291,
            "ResultCode": 0,
            "RespMSG": "Approved Offline",
            "Message": "Approved",
            "AuthCode": 145599,
            "PNRef": 810618212223,
            "PaymentType": "Credit",
            "TransType": "Void Sale",
            "SN": 118816524647,
            "ExtData": {
              "Amount": "0.01",
              "InvNum": "11",
              "CardType": "VISA",
              "BatchNum": "56",
              "Tip": "0.00",
              "CashBack": "0.00",
              "Fee": "0.00",
              "AcntLast4": "0281",
              "Name": "",
              "SVC": "0.00",
              "TotalAmt": "0.01",
              "DISC": "0.00",
              "Donation": "0.00",
              "SHFee": "0.00",
              "RwdPoints": "0",
              "RwdBalance": "0",
              "RwdIssued": "",
              "EBTFSLedgerBalance": "",
              "EBTFSAvailBalance": "",
              "EBTFSBeginBalance": "",
              "EBTCashLedgerBalance": "",
              "EBTCashAvailBalance": "",
              "EBTCashBeginBalance": "",
              "RewardCode": "",
              "AcqRefData": "",
              "ProcessData": "",
              "RefNo": "",
              "RewardQR": "",
              "Language": "English",
              "EntryType": "Manual",
              "table_num": "0",
              "clerk_id": "",
              "ticket_num": "",
              "ControlNum": "",
              "TaxCity": "0.00",
              "TaxState": "0.00",
              "Cust1": "",
              "Cust1Value": "",
              "Cust2": "",
              "Cust2Value": "",
              "Cust3": "",
              "Cust3Value": "",
              "AcntFirst4": "4941"
            },
            "CVMResult": 2,
            "cancelled": false,
            "gatewayStatus": 200,
            "gatewayStatusText": "OK",
            "printReceipt": "Both",
            "paymentType": "Credit",
            "type": "void",
            "registerId": "4f1b-f10a",
            "registerStatusPort": "3594291",
            "registerNickname": "Tech Area Z8 (3594291)",
            "registerSerial": "124124",
            "registerType": "dejavoo",
            "refId": "5114aea7-5c7f-40ab-8a62-84f239e4b2b1"
          },
          "total": 0.01,
          "method": "card",
          "pre_auth": false,
          "is_captured": 0,
          "last_four": "5114",
          "interchange_code": "",
          "interchange_fee": null,
          "batch_id": "",
          "batched_at": "2018-04-16 19:22:51",
          "emv_response": "",
          "avs_response": "",
          "cvv_response": "",
          "pos_entry": "",
          "pos_salesperson": "",
          "receipt_email_at": null,
          "receipt_sms_at": null,
          "created_at": "2018-04-16 19:22:51",
          "updated_at": "2018-04-16 19:22:51",
          "total_refunded": 0,
          "is_refundable": false,
          "is_voided": false,
          "is_voidable": false,
          "schedule_id": null,
          "child_captures": [],
          "parent_auth": null,
          "customer": {
            "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
            "firstname": "A",
            "lastname": "Customer",
            "company": "",
            "email": "",
            "cc_emails": [],
            "cc_sms": null,
            "phone": "",
            "address_1": "",
            "address_2": "",
            "address_city": "",
            "address_state": "",
            "address_zip": "",
            "address_country": "USA",
            "notes": "",
            "reference": "",
            "options": "",
            "created_at": "2018-02-23 22:32:19",
            "updated_at": "2018-02-23 22:32:19",
            "deleted_at": null,
            "allow_invoice_credit_card_payments": true,
            "gravatar": false
          },
          "child_transactions": [],
          "files": [],
          "payment_method": {
            "id": "e422a5a1-0088-4038-ae22-7a6d17aaf599",
            "customer_id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
            "merchant_id": "27fad5e4-0210-4c91-9596-417b0ea0dbb1",
            "user_id": "dbc85118-3309-4129-b966-0108c0fb18a0",
            "nickname": "VISA: YOU/A GIFT FOR (ending in: 0281)",
            "has_cvv": 0,
            "is_default": 1,
            "method": "card",
            "person_name": "YOU/A GIFT FOR",
            "card_type": "visa",
            "card_last_four": "0281",
            "card_exp": "992099",
            "bank_name": null,
            "bank_type": null,
            "bank_holder_type": null,
            "address_1": null,
            "address_2": null,
            "address_city": null,
            "address_state": null,
            "address_zip": "",
            "address_country": "",
            "purged_at": null,
            "deleted_at": "2018-04-16 18:55:32",
            "created_at": "2018-04-16 18:55:31",
            "updated_at": "2018-04-16 18:55:32",
            "card_exp_datetime": "2107-03-31 23:59:59",
            "customer": {
              "id": "2a503ed1-99ea-4b35-a30a-605253f7c05a",
              "firstname": "A",
              "lastname": "Customer",
              "company": "",
              "email": "",
              "cc_emails": [],
              "cc_sms": null,
              "phone": "",
              "address_1": "",
              "address_2": "",
              "address_city": "",
              "address_state": "",
              "address_zip": "",
              "address_country": "USA",
              "notes": "",
              "reference": "",
              "options": "",
              "created_at": "2018-02-23 22:32:19",
              "updated_at": "2018-02-23 22:32:19",
              "deleted_at": null,
              "allow_invoice_credit_card_payments": true,
              "gravatar": false
            }
          },
          "user": {
            "id": "dbc85118-3309-4129-b966-0108c0fb18a0",
            "system_admin": true,
            "name": "David Johnson",
            "email": "demo1@abc.com",
            "email_verification_sent_at": "2017-05-16 17:35:16",
            "email_verified_at": "2017-05-16 17:35:33",
            "is_api_key": false,
            "acknowledgments": {
              "tutorial": true,
              "godviewWelcome": true
            },
            "created_at": "2016-05-12 15:57:19",
            "updated_at": "2018-04-16 18:08:55",
            "deleted_at": null,
            "gravatar": "//www.gravatar.com/avatar/1cd5aef1d36d07e495abb73061f857d4",
            "team_admin": null,
            "team_enabled": null,
            "team_role": null,
            "merchant_options": [],
            "is_portal": false
          }
        }

+ Response 400 (application/json)

        {
            "success": false,
            "message": "User Cancelled",
            "gatewayStatus": 200,
            "gatewayStatusText": "OK",
            "cancelled": true,
            "status": 400
        }

+ Response 422 (application/json)

        {
            "validation": "register not found",
            "status": 422,
            "message": "Validation Error"
        }

### Print [POST /terminal/print]
_(please click this box ^^ for more information)_

Print a message on your terminal using the actual paper printer. The string within the `message` field will be printed.

+ Request (application/json)

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body 
        
            {
                 "message": "Hello, World",
                 "register": "4f1b-f10a"
            }
            
+ Response 200 (application/json)
    
        {
          "RegisterId": 3594291,
          "Message": "Success",
          "cancelled": false,
          "gatewayStatus": 200,
          "gatewayStatusText": "OK",
          "success": true,
          "RespMSG": "undefined"
        }

### Prompt (Input) [POST /terminal/promptInput]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

Wakes terminal with request for user to input text. Returns a number or string of the user's input.

+ Request (application/json)

    **Attributes**
    
    
        * `title` (string, optional) Title for this prompt, displayed on the top of the terminal screen. Default is "" (empty string).
        * `register`: (required, string) The id of the register performing this operation.
        
        

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
            
            {
                "register": "3594291",
                "title": "Loyalty Number",
            }

+ Response 200 (application/json)
    
        {
            "input": "G164"
        }

### Prompt (Choice) [POST /terminal/promptChoice]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

Wakes terminal with request for user to select a choice. Returns the `choice` and the `index` of the choice within the provided `choices` array.

+ Request (application/json)

    **Attributes**
    
        * `register`: (string, required) The id of the register performing this operation.
        * `title` (string, optional) Title for this prompt, displayed on the top of the terminal screen. Default is "" (empty string).
        * `choices` (array, required) Choices to present to the user. 

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json
            
    + Body
            
            {
                "title": "Credit or Debit",
                "choices": ["Credit", "Debit"]
            }

+ Response 200 (application/json)
    
        {
            "index": 0,
            "choice": "Credit"
        }

### Get Transaction Status [GET /terminal/{registerId}/status/{transactionId}]
_(please click this box ^^ for more information)_

**Note: Valid Register Required**

(Advanced)

Wakes terminal with request for data about the supplied transaction. This call requires a register id, and for the given transaction to be in the current batch.

The response isn't the same response as the `POST terminal/charge`, or `POST terminal/charge/queue` or the `GET transaction/{id}` route either.
The response is the data from the terminal which normally we don't expose.

**Please be aware that this call queries the terminal directly, will cause the terminal to be busy for several seconds, and will not work correctly if the terminal is already busy.**

**If you are polling for transaction data** it's recommended to use the [`GET transaction/{id}` route](https://fattmerchant.docs.apiary.io/#reference/0/transactions/get-a-transaction's-information) instead.

This route simply gives you a way to get data straight from the terminal just in case you need to.

- If an invalid transaction id is given, the response will be a 422.
- If the transaction exists within our API, but not on the device's batch, the response (shown below) is a 200
- If the device is busy, the response is a 200, (also shown below)
- If the device isn't busy, and the transaction is found in the batch, you will get a 200 and the response is the first 200 shown below.

+ Request (application/json)

    **URL Params**
    
    * `registerId`: (required, string) The id of the register where this transaction id located (the device)
    * `transactionId`: (required, string) The id of the transaction you want the info about

    + Headers
    
            Authorization: Bearer insert_api_key_here
            Accept: application/json

+ Response 200 (application/json)

            {
                "RefId": "fb1a60b1-2186-4a2b-9c02-b2c01e736d99",
                "RegisterId": 3594291,
                "ResultCode": "",
                "RespMSG": "APPROVAL 02051D",
                "Message": "Approved",
                "AuthCode": "02051D",
                "PNRef": 835318402983,
                "PaymentType": "Credit",
                "TransType": "Sale",
                "SN": 118816524647,
                "ExtData": {
                    "Amount": "",
                    "InvNum": "4",
                    "CardType": "VISA",
                    "BatchNum": "70",
                    "Tip": "0.00",
                    "CashBack": "0.00",
                    "Fee": "0.00",
                    "AcntLast4": "4301",
                    "Name": "JOHNSON/DAVID",
                    "SVC": "0.00",
                    "TotalAmt": "0.01",
                    "DISC": "0.00",
                    "Donation": "0.00",
                    "SHFee": "0.00",
                    "RwdPoints": "0",
                    "RwdBalance": "0",
                    "RwdIssued": "",
                    "EBTFSLedgerBalance": "",
                    "EBTFSAvailBalance": "",
                    "EBTFSBeginBalance": "",
                    "EBTCashLedgerBalance": "",
                    "EBTCashAvailBalance": "",
                    "EBTCashBeginBalance": "",
                    "RewardCode": "",
                    "AcqRefData": "",
                    "ProcessData": "",
                    "RefNo": "",
                    "RewardQR": "",
                    "Language": "English",
                    "EntryType": "CHIP",
                    "table_num": "0",
                    "clerk_id": "",
                    "ticket_num": "",
                    "ControlNum": "",
                    "TaxCity": "0.00",
                    "TaxState": "0.00",
                    "Cust1": "",
                    "Cust1Value": "",
                    "Cust2": "",
                    "Cust2Value": "",
                    "Cust3": "",
                    "Cust3Value": "",
                    "AcntFirst4": "4147",
                    "TaxAmount": "0.00"
                },
                "EMVData": {
                    "AID": "A0000000031010",
                    "AppName": "CHASE VISA",
                    "TVR": "0080008800",
                    "TSI": "E800",
                    "IAD": "A07EEBA094234F9C3030",
                    "ARC": "00"
                },
                "CVMResult": 2,
                "cancelled": false,
                "gatewayStatus": 200,
                "gatewayStatusText": "OK",
                "success": true
            }

+ Response 200 (application/json)

            {
                "Message": "Error",
                "ResultCode": 2,
                "RespMSG": "Terminal in use",
                "cancelled": false,
                "gatewayStatus": 200,
                "gatewayStatusText": "OK",
                "success": false
            }

+ Response 200 (application/json)

            {
                "RefId": "9084e510-471f-4091-875f-6b732e825c77",
                "Message": "Not found",
                "cancelled": false,
                "gatewayStatus": 200,
                "gatewayStatusText": "OK",
                "success": true,
                "RespMSG": "undefined"
            }

+ Response 422 (application/json)

            {
                "validation": "Transaction not found",
                "status": 422,
                "message": "Validation Error"
            }
            

## Webhooks [/webhook]

You can configure webhooks via the API to be notified about events that happen in your account.

### Webhook events


+ `create_customer` - A customer is created
+ `create_invoice` - An invoice is created - includes invoices created by an invoice schedule
+ `create_item` - An item is created
+ `create_scheduled_invoice` - An invoice schedule is created
+ `create_transaction` - A transaction is created - includes when a transaction is created with Fattmerchant.js
+ `create_user` - A user is created
+ `create_webhook` - A webhook is created
+ `delete_item` - An item is deleted
+ `delete_scheduled_invoice` - An invoice schedule is deleted
+ `delete_webhook` - A webhook is deleted
+ `update_item` - An item is updated
+ `send_invoice` - An invoice is sent via email or text
+ `set_branding` - Branding is set
+ `set_gateway` - A gateway is set
+ `set_plan` - A plan is set
+ `update_customer` - A customer is updated
+ `update_invoice` - An invoice is updated
+ `update_scheduled_invoice` - An invoice schedule is updated
+ `update_transaction` - A transaction is updated
+ `update_user` - A user is updated

### Create new Webhook [POST /webhook{?target_url,event}]
_(please click this box ^^ for more information)_

A webhook endpoint must have a target url and an event. 
You can also create webhooks in the webhooks settings section of the Omni Dashboard.

+ Parameters

    + target_url (string, required) - The URL which will accept the data when the webhook fires.

    + event (enum, required) - The event which will trigger the webhook.

        + Members
            + `create_customer`
            + `create_invoice`
            + `create_item`
            + `create_scheduled_invoice`
            + `create_transaction`
            + `create_user`
            + `create_webhook`
            + `delete_item`
            + `delete_scheduled_invoice`
            + `delete_webhook`
            + `update_item`
            + `send_invoice`
            + `set_branding`
            + `set_gateway`
            + `set_plan`
            + `update_customer`
            + `update_invoice`
            + `update_scheduled_invoice`
            + `update_transaction`
            + `update_user`

+ Request (application/json)

    + Headers

            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
             "target_url": "https://requestb.in/13q0j",
             "event": "update_transaction"
            }
 

+ Response 200 (application/json)

        {
            "id": "a1069804-48f3-48fe-aa3f-654fbbc395aa",
            "user_id": "user1",
            "merchant_id": "merchant1",
            "reference_id": null,
            "url": "https://requestb.in/13q0j",
            "event": "update_transaction",
            "created_at": "2020-03-20 02:29:30",
            "updated_at": "2020-03-20 02:29:30",
            "deleted_at": null
        }
        
+ Response 422 (application/json)

        {
            "target_url": [
                "The target url field is required."
            ],
            "event": [
                "The event field is required."
            ]
        }
        
### Create new Webhook for all of my Merchants [POST /webhook{?target_url,event,fire_for_all_merchants}]
_(please click this box ^^ for more information)_

(ADVANCED)
**Note: Authentication Token and Team Admin Status Required**

This route is used for users whose api key is tied to multiple merchants. It offers the ability to create a webhook that fires for all of your merchants.

A webhook endpoint must have a target url and an event. The fire_for_all_merchants parameter is an optional parameter which will create the webhook for all of your merchants.
If this parameter is set to true, `merchant_id` will be `null` in the response body.

+ Parameters

    + target_url (string, required) - The URL which will accept the data when the webhook fires.

    + fire_for_all_merchants (boolean, optional) - Defaults to false. If true, the webhook will be created for all merchants that are associated with your api key.
    
    + event (enum, required) - The event which will trigger the webhook.

        + Members
            + `create_customer`
            + `create_invoice`
            + `create_item`
            + `create_scheduled_invoice`
            + `create_transaction`
            + `create_user`
            + `create_webhook`
            + `delete_item`
            + `delete_scheduled_invoice`
            + `delete_webhook`
            + `update_item`
            + `send_invoice`
            + `set_branding`
            + `set_gateway`
            + `set_plan`
            + `update_customer`
            + `update_invoice`
            + `update_scheduled_invoice`
            + `update_transaction`
            + `update_user`

+ Request (application/json)

    + Headers

            Authorization: Bearer insert_api_key_here
            Accept: application/json

    + Body

            {
             "target_url": "https://requestb.in/13q0j",
             "fire_for_all_merchants": true,      
             "event": "update_transaction"
            }
 

+ Response 200 (application/json)

        {
            "id": "a1069804-48f3-48fe-aa3f-654fbbc395aa",
            "user_id": "user1",
            "merchant_id": null,
            "reference_id": null,
            "url": "https://requestb.in/13q0j",
            "event": "update_transaction",
            "created_at": "2020-03-20 02:29:30",
            "updated_at": "2020-03-20 02:29:30",
            "deleted_at": null
        }
        
+ Response 422 (application/json)

        {
            "target_url": [
                "The target url field is required."
            ],
            "event": [
                "The event field is required."
            ]
        }


### Get All Webhooks [GET /webhook{?per_page,page}]
_(please click this box ^^ for more information)_

This will return all Webhooks that you created for your merchant(s). This response comes with pagination. You can use the `per_page` and `page` parameters to determine how the data will come back.

+ Parameters

    + per_page (integer|min:1|max:200, optional) - How many webhook objects should return per page. Defaults to 20.

    + page (string, optional) - Which page should return. Defaults to return 1st page


+ Request (application/json)

    + Headers

            Authorization: Bearer insert_api_key_here
            Accept: application/json
 

+ Response 200 (application/json)
        
        {
            "current_page": 2,
            "data": [
                {
                    "id": "25fb488a-c907-4e6c-87db-086150c5fa79",
                    "user_id": "user1",
                    "merchant_id": "merchant2",
                    "reference_id": null,
                    "url": "https://requestb.in/13q0jl11",
                    "event": "create_item",
                    "created_at": "2020-03-03 15:34:23",
                    "updated_at": "2020-03-03 15:34:23",
                    "deleted_at": null
                },
                {
                    "id": "280e68e6-fe5e-44dc-8b2c-df5bea7e9ac4",
                    "user_id": "user1",
                    "merchant_id": "merchant2",
                    "reference_id": null,
                    "url": "https://requestb.in/13q0jl11",
                    "event": "create_item",
                    "created_at": "2020-03-04 21:26:19",
                    "updated_at": "2020-03-04 21:26:19",
                    "deleted_at": null
                },
                {
                    "id": "2a43bdef-8577-401b-8ba8-7e195243287e",
                    "user_id": "user1",
                    "merchant_id": "merchant2",
                    "reference_id": null,
                    "url": "https://eni6l96xhnaqg.x.pipedream.net/",
                    "event": "create_transaction",
                    "created_at": "2020-03-05 19:23:51",
                    "updated_at": "2020-03-05 19:23:51",
                    "deleted_at": null
                },
                {
                    "id": "3158600c-d431-4b9a-9cca-5ad334239997",
                    "user_id": "user1",
                    "merchant_id": null,
                    "reference_id": null,
                    "url": "https://requestb.in/13q0jl11",
                    "event": "create_item",
                    "created_at": "2020-03-02 23:18:58",
                    "updated_at": "2020-03-02 23:18:58",
                    "deleted_at": null
                },
                {
                    "id": "34bf75ab-7906-468c-a636-4381fbe318c0",
                    "user_id": "user1",
                    "merchant_id": "merchant1",
                    "reference_id": "8994e803-2e16-4bb0-b5ba-47fd9b447a0a",
                    "url": "http://localhost:3006/fm/webhook/update_invoice/8994e803-2e16-4bb0-b5ba-47fd9b447a0a",
                    "event": "update_invoice",
                    "created_at": "2019-09-11 14:52:30",
                    "updated_at": "2019-09-11 14:52:30",
                    "deleted_at": null
                }
            ],
            "first_page_url": "https://apiprod.fattlabs.com/webhook?page=1",
            "from": 6,
            "last_page": 8,
            "last_page_url": "https://apiprod.fattlabs.com/webhook?page=8",
            "next_page_url": "https://apiprod.fattlabs.com/webhook?page=3",
            "path": "https://apiprod.fattlabs.com",
            "per_page": "5",
            "prev_page_url": "https://apiprod.fattlabs.com/webhook?page=1",
            "to": 10,
            "total": 39
        }
        

### Get Webhook by ID [GET /webhook/{id}]
_(please click this box ^^ for more information)_

Retrieves the webhook matching the given `id` and then returns details about the webhook found in the 200 response. 


+ Request (application/json)

    + Headers

            Authorization: Bearer insert_api_key_here
            Accept: application/json
 

+ Response 200 (application/json)

        {
            "id": "cf1c6275-ff7c-4c23-ae70-4740b2ca2d32",
            "user_id": "user1",
            "merchant_id": "merchant1",
            "reference_id": "8994e803-2e16-4bb0-b5ba-47fd9b447a0a",
            "url": "http://localhost:3006/fm/webhook/update_item/8994e803-2e16-4bb0-b5ba-47fd9b447a0a",
            "event": "update_item",
            "created_at": "2019-09-11 14:52:30",
            "updated_at": "2020-05-01 14:32:55",
            "deleted_at": "2020-05-01 14:32:55"
        }
        
+ Response 422 (application/json)

        {
            "id": [
                "Webhook could not be found"
        }
       

### Delete a Webhook [DELETE /webhook/{id}]
_(please click this box ^^ for more information)_

This resource will soft delete a webhook in the database making it inaccessable via the `GET webhook` resource.

+ Request (application/json)

    + Headers

            Authorization: Bearer insert_api_key_here
            Accept: application/json


+ Response 200 (application/json)

        {
            "id": "cf1c6275-ff7c-4c23-ae70-4740b2ca2d32",
            "user_id": "user1",
            "merchant_id": "merchant1",
            "reference_id": "8994e803-2e16-4bb0-b5ba-47fd9b447a0a",
            "url": "http://localhost:3006/fm/webhook/update_item/8994e803-2e16-4bb0-b5ba-47fd9b447a0a",
            "event": "update_item",
            "created_at": "2019-09-11 14:52:30",
            "updated_at": "2020-05-01 14:32:55",
            "deleted_at": "2020-05-01 14:32:55"
        }
        
+ Response 422 (application/json)

        {
            "id": [
                "Webhook could not be found"
        }