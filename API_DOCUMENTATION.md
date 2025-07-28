# API Documentation - NedaPay Base MiniKit

## 📡 API Overview

The NedaPay Base MiniKit provides a comprehensive REST API for managing payments, analytics, invoices, and loyalty programs. All APIs are built using Next.js 14 App Router with TypeScript.

## 🔗 Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

## 📊 Analytics API

### Get Analytics Data
**Endpoint**: `GET /api/analytics`

**Description**: Retrieves aggregated analytics data including revenue, customer metrics, and performance trends.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `7d` | Time period: `24h`, `7d`, `30d`, `90d` |
| `userId` | string | No | - | Filter by specific user ID |

**Request Example**:
```bash
GET /api/analytics?period=30d&userId=user_123
```

**Response Format**:
```json
{
  "success": true,
  "analytics": {
    "period": "30 days",
    "revenue": 15750.50,
    "customers": 234,
    "redemptions": 456,
    "engagement": 78.5,
    "trend": "up",
    "percentageChange": 12.3
  },
  "chartData": [
    {
      "date": "2024-01-01",
      "revenue": 1250.00,
      "customers": 15,
      "redemptions": 23
    }
  ],
  "topRewards": [
    {
      "id": "reward_1",
      "name": "10% Off Coffee",
      "redemptions": 89,
      "revenue": 445.50,
      "engagement": 85.2
    }
  ]
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid period parameter",
  "code": "INVALID_PERIOD"
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized
- `500`: Internal Server Error

## 🧾 Mock Transaction API

### Get Transactions
**Endpoint**: `GET /api/mock/transactions`

**Description**: Retrieves mock transaction data for development and testing.

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | `10` | Number of transactions to return |
| `offset` | number | No | `0` | Pagination offset |
| `status` | string | No | - | Filter by status: `completed`, `pending`, `failed` |

**Response Format**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "tx_123",
      "amount": 25.50,
      "currency": "USDC",
      "status": "completed",
      "customerName": "John Doe",
      "timestamp": "2024-01-15T10:30:00Z",
      "type": "payment",
      "description": "Coffee purchase"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## 📄 Invoice Sync API

### Sync Invoices
**Endpoint**: `GET /api/mock/invoices/sync`

**Description**: Retrieves synchronized invoice data.

**Response Format**:
```json
{
  "success": true,
  "invoices": [
    {
      "id": "inv_123",
      "customerName": "Jane Smith",
      "customerEmail": "jane@example.com",
      "amount": 150.00,
      "currency": "USDC",
      "status": "paid",
      "items": [
        {
          "description": "Web Development",
          "quantity": 1,
          "price": 150.00
        }
      ],
      "createdAt": "2024-01-15T09:00:00Z",
      "paidAt": "2024-01-15T09:15:00Z"
    }
  ]
}
```

## 🔐 Authentication APIs

### Wallet Authentication
**Endpoint**: `POST /api/mock/auth/wallet`

**Description**: Authenticates user via wallet connection.

**Request Body**:
```json
{
  "address": "0x1234567890abcdef...",
  "signature": "0xabcdef123456...",
  "message": "Sign in to NedaPay"
}
```

**Response Format**:
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "address": "0x1234567890abcdef...",
    "isBusinessOwner": true,
    "profile": {
      "name": "John's Coffee Shop",
      "email": "john@coffeeshop.com"
    }
  },
  "token": "jwt_token_here"
}
```

### Privy Session
**Endpoint**: `GET /api/mock/auth/privy-session`

**Description**: Retrieves current Privy session information.

**Headers**:
```
Authorization: Bearer jwt_token_here
```

**Response Format**:
```json
{
  "success": true,
  "session": {
    "userId": "user_123",
    "isActive": true,
    "expiresAt": "2024-01-16T10:30:00Z"
  }
}
```

## 🏥 Health Check API

### Health Status
**Endpoint**: `GET /api/mock/health`

**Description**: Returns application health status.

**Response Format**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "blockchain": "connected",
    "analytics": "operational"
  }
}
```

## 🌐 Farcaster Integration

### Farcaster Manifest
**Endpoint**: `GET /.well-known/farcaster.json`

**Description**: Provides Farcaster frame configuration.

**Response Format**:
```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg...",
    "payload": "eyJkb21haW4iOiJuZWRhcGF5LmNvbSJ9",
    "signature": "MHg..."
  }
}
```

## 🔧 Error Handling

### Standard Error Format
All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error",
    "validation": "Validation details"
  }
}
```

### Common Error Codes
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Malformed request | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Input validation failed | 422 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## 🔒 Authentication & Authorization

### Wallet-Based Authentication
The application uses wallet-based authentication through Base MiniKit:

1. **Connect Wallet**: User connects Coinbase Wallet
2. **Sign Message**: User signs authentication message
3. **Verify Signature**: Server verifies signature
4. **Issue Token**: JWT token issued for session

### Authorization Levels
- **Public**: No authentication required
- **User**: Wallet connection required
- **Business Owner**: Business verification required
- **Admin**: Administrative privileges

## 📝 Request/Response Examples

### Creating an Invoice (Conceptual)
```bash
# Request
POST /api/invoices
Content-Type: application/json
Authorization: Bearer jwt_token

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "items": [
    {
      "description": "Coffee",
      "quantity": 2,
      "price": 5.00
    }
  ],
  "currency": "USDC"
}

# Response
{
  "success": true,
  "invoice": {
    "id": "inv_123",
    "total": 10.00,
    "paymentLink": "https://nedapay.com/pay/inv_123",
    "qrCode": "data:image/png;base64,..."
  }
}
```

## 🧪 Testing APIs

### Using cURL
```bash
# Test analytics endpoint
curl -X GET "http://localhost:3000/api/analytics?period=7d" \
  -H "Content-Type: application/json"

# Test with authentication
curl -X GET "http://localhost:3000/api/mock/auth/privy-session" \
  -H "Authorization: Bearer your_jwt_token"
```

### Using Postman
1. Import the API collection (create if needed)
2. Set environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `auth_token`: Your JWT token
3. Test each endpoint with sample data

### Using JavaScript/Fetch
```javascript
// Analytics API call
const fetchAnalytics = async (period = '7d') => {
  try {
    const response = await fetch(`/api/analytics?period=${period}`);
    const data = await response.json();
    
    if (data.success) {
      return data.analytics;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Analytics fetch failed:', error);
    throw error;
  }
};

// Usage
fetchAnalytics('30d')
  .then(analytics => console.log(analytics))
  .catch(error => console.error(error));
```

## 🚀 Production Considerations

### Rate Limiting
Implement rate limiting for production:
```javascript
// Example rate limiting middleware
const rateLimit = {
  '/api/analytics': '100 requests per hour',
  '/api/mock/transactions': '1000 requests per hour',
  '/api/mock/auth/wallet': '10 requests per minute'
};
```

### Caching Strategy
- **Analytics**: Cache for 5 minutes
- **Transactions**: Cache for 1 minute
- **Static data**: Cache for 1 hour

### Security Headers
```javascript
// Add security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000'
};
```

## 📊 API Monitoring

### Key Metrics to Monitor
- Response times
- Error rates
- Request volume
- Authentication failures
- Rate limit hits

### Logging
All API requests should log:
- Timestamp
- HTTP method and path
- Response status
- Response time
- User ID (if authenticated)
- Error details (if applicable)

---

**API Documentation Version**: 1.0  
**Last Updated**: January 2024  
**Maintained by**: NedaPay Development Team
