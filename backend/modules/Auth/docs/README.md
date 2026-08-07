# Auth Module

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create company + admin user |
| POST | `/api/v1/auth/login` | No | Issue Sanctum token |
| GET | `/api/v1/auth/me` | Yes | Current user + enabled modules |
| POST | `/api/v1/auth/logout` | Yes | Revoke current token |
| POST | `/api/v1/auth/logout-all` | Yes | Revoke all tokens |

## Register payload

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string",
  "company_name": "string",
  "phone": "string|null"
}
```

## Security

- Rate limited login/register (`throttle:10,1`)
- Password hashed via Eloquent cast
- Inactive users cannot login
- Tenant context resolved after authentication
