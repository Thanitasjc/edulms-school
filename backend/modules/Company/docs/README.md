# Company Module

## Endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/v1/companies` | `company.view` |
| POST | `/api/v1/companies` | `company.create` |
| GET | `/api/v1/companies/{id}` | `company.view` |
| PUT/PATCH | `/api/v1/companies/{id}` | `company.update` |
| DELETE | `/api/v1/companies/{id}` | `company.delete` |
| POST | `/api/v1/companies/{id}/restore` | `company.restore` |

## Notes

- Soft deletes enabled
- Activity log on mutations
- Unique slug generation handled in `CompanyService`
- Super admin bypasses permission checks via `Gate::before`
