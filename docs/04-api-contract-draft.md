# API Contract Draft

## POST /api/v1/public/registrations

Creates a public registration submission.

### Request

```json
{
  "locale": "zh-CN",
  "studentName": "张三",
  "age": 15,
  "studentEmail": "student@example.com",
  "phone": "+86 13800000000",
  "locationText": "北京 / China",
  "trackCode": "ai-core",
  "guardianName": "李女士",
  "guardianRelationship": "母亲",
  "guardianPhone": "+86 13900000000",
  "guardianEmail": "guardian@example.com",
  "guardianConsent": true,
  "materials": [
    {
      "title": "项目仓库",
      "kind": "code",
      "url": "https://github.com/example/project",
      "description": "AI learning prototype"
    }
  ],
  "submissionSummary": "希望展示 AI 辅助科学学习工具。",
  "privacyAgreed": true
}
```

### Success

```json
{
  "registrationId": "reg_...",
  "status": "submitted",
  "submittedAt": "2026-06-03T00:00:00.000Z",
  "emailQueued": true
}
```

### Validation Error

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Registration data is invalid.",
  "fields": {
    "age": "年龄范围暂定为 13-16 岁。"
  }
}
```

### Duplicate Email

```json
{
  "code": "DUPLICATE_EMAIL",
  "message": "该邮箱已经提交过报名，一个邮箱仅代表一个人。"
}
```

## Admin Endpoints

- `POST /api/v1/admin/session`
- `GET /api/v1/admin/registrations?status=all&q=...`
- `GET /api/v1/admin/registrations/:id`
- `PATCH /api/v1/admin/registrations/:id/status`
- `GET /api/v1/admin/registrations/export.csv`
