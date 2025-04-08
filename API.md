# 💳 Payment and Search API Documentation

This documentation outlines three key endpoints for handling payments using the **Paystack** API:

1. `POST /api/users/verify-payment` - Verify a payment after transaction completion.
2. `POST /api/users/make-payment` - Initialize a new payment.
3. `POST /api/vendors/save-payment` - Create and store vendor payment (subaccount) details.
4. `POST /api/users/restaurant-search` - Search for restaurants

All endpoints require authentication and a valid Paystack secret key stored in `process.env.PAYSTACK_SECRET_KEY`.

---

## 📌 `POST /api/users/verify-payment`

### Description
Verifies a completed transaction using Paystack's `transaction/verify` endpoint.

### Authorization
🔒 Requires the user to be authenticated.

### Request Body
```json
{
  "reference": "transaction_reference"
}
```

### Response
#### ✅ Success (HTTP 200)
```json
{
  "message": "Succesful",
  "data": {
    ...
  }
}
```

#### ❌ Error Responses
- `403 Unauthorized`: User not logged in.
- `400 Bad Request`: Missing reference.
- `500 Server Error`: Paystack error or server misconfiguration.


---

## 📌 `POST /api/users/make-payment`

### Description
Initializes a new transaction with Paystack and returns an authorization URL.

### Authorization
🔒 Requires the user to be authenticated.

### Request Body
```json
{
  "amount": 5000,
  "email": "customer@example.com",
  "subaccount": "SUB_ACCT_code"
}
```

- `amount` should be in **naira** (will be converted to **kobo**).
- `subaccount` is the Paystack subaccount code of the vendor.

### Response
#### ✅ Success (HTTP 200)
```json
{
  "messaage": "success",
  "data": {
    "authorization_url": "https://paystack.com/pay/...",
    "ref": "ref_123456"
  }
}
```

#### ❌ Error Responses
- `403 Unauthorized`: User not logged in.
- `400 Bad Request`: Missing required fields.
- `500 Server Error`: Paystack error or server misconfiguration.


---

## 📌 `POST /api/vendors/save-payment`

### Description
Creates a **subaccount** on Paystack for the vendor, allowing split payments. Also saves the subaccount info to the `Vendor` database model.

### Authorization
🔒 Requires the user to be authenticated as a vendor.

### Request Body
```json
{
  "business_name": "Vendor Ltd",
  "bank_code": "058",
  "account_number": "0123456789",
  "percentage_charge": 10.5
}
```

### Response
#### ✅ Success (HTTP 201)
```json
{
  "message": "Payment Details Added successfully.",
  "data": {
    "subaccount_code": "SUB_ACCT_code",
    ...
  },
  "user": {
    "_id": "...",
    "paymentDetails": {
      ...
    }
  }
}
```

#### ❌ Error Responses
- `403 Unauthorized`: Vendor not logged in.
- `400 Bad Request`: Missing required payment info.
- `500 Server Error`: Paystack or database error.


---

## 📌 `GET /api/users/restauraant-search?query="search query"`

### Description
Search for restaurants by query

### Authorization
🔒 Requires the user to be authenticated.


### Response
#### ✅ Success (HTTP 200)
```json
{
  "message": "Search Results",
  "data": [
    {
      "email": "string",
      "_id": "string",
      ...
    }
  ]
}
```

#### ❌ Error Responses
- `403 Unauthorized`: User not logged in.
- `500 Server Error`: Search error or server misconfiguration.


---

## ⚙️ Environment Variable

| Variable                | Description                          |
|-------------------------|--------------------------------------|
| `PAYSTACK_SECRET_KEY`   | Your Paystack secret key (required)  |

---

## 🛑 Error Handling

All endpoints return appropriate error responses with status codes:
- `400`: Missing input data.
- `403`: Unauthorized access.
- `500`: Server or external API error.

Errors include a helpful message and optionally a detailed error object.

---

## 📝 Notes
- Make sure to secure your Paystack secret key.
- All payments are in **NGN** (Nigerian Naira) and **amounts must be converted to kobo** when calling Paystack.
- Subaccounts are necessary to enable split payments for vendors.

---