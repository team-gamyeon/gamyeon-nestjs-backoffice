# API 명세서 (현재 동작 기준)

> 기준: 현재 `src` 코드 구현 상태 (2026-03-13)
> Base URL 예시: `http://localhost:3002`
>
> 불변사항:
> 이 문서는 프론트엔드/백엔드 협업 기준 명세서이며, 작업 중 임의로 변경하면 안 됩니다.
> 명세 변경은 사용자(오너)의 명시적 승인 이후에만 가능합니다.
> 구현 변경이 필요하더라도 먼저 이 명세를 기준으로 영향도를 확인하고 승인 후 수정합니다.

## 1. 공통

### 1.1 인증 방식
- 기본적으로 모든 API는 JWT 인증 필요
- 예외(Public):
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `GET /health`

인증 헤더:
```http
Authorization: Bearer <accessToken>
```

또는 쿠키:
```http
Cookie: admin_token=<accessToken>
```

### 1.2 공통 응답 포맷

성공:
```json
{
  "success": true,
  "data": {}
}
```

실패:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "설명"
  }
}
```

### 1.3 페이지네이션 공통 쿼리
- `page` (기본 `1`, 최소 `1`)
- `limit` (기본 `20`, 최소 `1`, 최대 `100`)
- `sortOrder` (`asc` | `desc`, 기본 `desc`)

---

## 2. 시스템

### 2.1 헬스체크
- `GET /health`
- Auth: 불필요
- Response `data`:
```json
{
  "status": "ok"
}
```

---

## 3. 인증(Auth)

### 3.1 로그인
- `POST /api/v1/auth/login`
- Auth: 불필요
- Body:
```json
{
  "email": "admin@gamyeon.com",
  "password": "password123"
}
```
- Response `data`:
```json
{
  "accessToken": "jwt",
  "expiresIn": 28800,
  "refreshToken": "jwt",
  "refreshExpiresIn": 1209600
}
```

### 3.2 토큰 갱신
- `POST /api/v1/auth/refresh`
- Auth: 불필요
- Body:
```json
{
  "refreshToken": "jwt"
}
```
- Response: 로그인 응답과 동일

### 3.3 내 정보 조회
- `GET /api/v1/auth/me`
- Auth: 필요
- Response `data`:
```json
{
  "email": "admin@gamyeon.com",
  "role": "SUPER_ADMIN"
}
```

---

## 4. 대시보드(Dashboard)

### 4.1 KPI
- `GET /api/v1/dashboard/kpi`
- Response `data`:
```json
{
  "totalUsers": { "value": 0 },
  "totalNotices": { "value": 0 },
  "pausedInterviews": { "value": 0 },
  "analyzingReports": { "value": 0 }
}
```

### 4.2 가입 추이
- `GET /api/v1/dashboard/signup-trend?days=13`
- Query:
  - `days` (선택, 기본 `13`)
- Response `data`:
```json
{
  "period": "최근 13일",
  "items": [
    { "date": "2026-03-01", "count": 0 }
  ]
}
```

### 4.3 면접 완료율
- `GET /api/v1/dashboard/interview-completion`
- Response `data`:
```json
{
  "completionRate": 0,
  "segments": [
    { "label": "FINISHED", "count": 0, "percentage": 0 }
  ]
}
```

### 4.4 리포트 분석 현황
- `GET /api/v1/dashboard/report-analysis`
- Response `data`:
```json
{
  "completionRate": 0,
  "totalCount": 0,
  "segments": [
    { "label": "COMPLETED", "count": 0, "percentage": 0 }
  ]
}
```

### 4.5 최근 활동
- `GET /api/v1/dashboard/recent-activities?limit=20`
- Query:
  - `limit` (선택, 기본 `20`)
- Response `data`:
```json
{
  "items": [
    {
      "type": "USER_JOINED",
      "message": "새 유저 홍길동님이 가입했습니다",
      "createdAt": "2026-03-13T00:00:00.000Z"
    }
  ]
}
```

### 4.6 대시보드 요약
- `GET /api/v1/dashboard/summary`
- Response `data`: 위 4.1~4.5 묶음

---

## 5. 사용자(Users)

### 5.1 사용자 목록
- `GET /api/v1/users`
- Query:
  - `status`: `ACTIVE | WARNED | BANNED | WITHDREW`
  - `search`: 닉네임/이메일 부분검색
  - `sortBy`: `createdAt | updatedAt` (기본 `createdAt`)
  - 공통 페이지네이션 쿼리
- Response `data`:
```json
{
  "totalCount": 0,
  "filteredCount": 0,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": 1,
      "nickname": "홍길동",
      "email": "hong@example.com",
      "provider": "GOOGLE",
      "status": "ACTIVE",
      "createdAt": "2026-03-13T00:00:00.000Z",
      "updatedAt": "2026-03-13T00:00:00.000Z"
    }
  ]
}
```

### 5.2 사용자 상세
- `GET /api/v1/users/:id`
- Response `data`:
```json
{
  "id": 1,
  "nickname": "홍길동",
  "email": "hong@example.com",
  "provider": "GOOGLE",
  "status": "ACTIVE",
  "withdrawnAt": null,
  "createdAt": "2026-03-13T00:00:00.000Z",
  "updatedAt": "2026-03-13T00:00:00.000Z",
  "sanctions": [
    {
      "id": "uuid",
      "type": "WARNED",
      "reason": "사유",
      "createdAt": "2026-03-13T00:00:00.000Z"
    }
  ]
}
```

### 5.3 사용자 상태 변경
- `PATCH /api/v1/users/:id/status`
- Body:
```json
{
  "status": "WARNED",
  "reason": "정책 위반"
}
```
- `status`: `ACTIVE | WARNED | BANNED | WITHDREW`
- Response `data`:
```json
{
  "id": 1,
  "status": "WARNED",
  "updatedAt": "2026-03-13T00:00:00.000Z"
}
```

### 5.4 사용자 제재 이력
- `GET /api/v1/users/:id/sanctions`
- Response `data`:
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "WARNED",
      "reason": "사유",
      "createdAt": "2026-03-13T00:00:00.000Z"
    }
  ]
}
```

---

## 6. 질문(Questions)

### 6.1 질문 목록
- `GET /api/v1/questions`
- Query:
  - `status`: `ACTIVE | INACTIVE | DELETED`
  - `search`
  - `from`, `to` (ISO date, `YYYY-MM-DD`)
  - `sortBy`: `createdAt | updatedAt` (기본 `createdAt`)
  - 공통 페이지네이션 쿼리
- Response `data`:
```json
{
  "totalCount": 0,
  "filteredCount": 0,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": "uuid",
      "content": "질문 내용",
      "status": "ACTIVE",
      "createdAt": "2026-03-13T00:00:00.000Z",
      "updatedAt": "2026-03-13T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

### 6.2 질문 생성
- `POST /api/v1/questions`
- Body:
```json
{
  "content": "최소 10자 이상 질문 내용입니다.",
  "status": "ACTIVE"
}
```
- `status` 생략 시 `ACTIVE`

### 6.3 질문 수정
- `PATCH /api/v1/questions/:id`
- Body:
```json
{
  "content": "수정된 질문 내용",
  "status": "INACTIVE"
}
```

### 6.4 질문 삭제(소프트 삭제)
- `DELETE /api/v1/questions/:id`
- Response `data`:
```json
{
  "id": "uuid",
  "status": "DELETED",
  "deletedAt": "2026-03-13T00:00:00.000Z"
}
```

---

## 7. 공지사항(Notices)

### 7.1 카테고리(뱃지) 값
- `NOTICE`
- `UPDATE`
- `GUIDE`
- `EVENT`
- `MAINTENANCE`

### 7.2 공지 목록
- `GET /api/v1/notices`
- Query:
  - `search`
  - `category`: 위 카테고리 값
  - `from`, `to` (ISO date, `YYYY-MM-DD`)
  - `sortBy`: `createdAt | updatedAt` (기본 `createdAt`)
  - 공통 페이지네이션 쿼리
- Response `data`:
```json
{
  "totalCount": 0,
  "filteredCount": 0,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": 1,
      "title": "공지 제목",
      "content": "공지 내용",
      "category": "NOTICE",
      "createdAt": "2026-03-13T00:00:00.000Z",
      "updatedAt": "2026-03-13T00:00:00.000Z",
      "images": []
    }
  ]
}
```

### 7.3 공지 상세
- `GET /api/v1/notices/:id`
- Response: 공지 + `images[]`

### 7.4 공지 생성
- `POST /api/v1/notices`
- Body:
```json
{
  "title": "공지 제목",
  "content": "공지 내용",
  "category": "UPDATE"
}
```
- `category` 생략 시 `NOTICE`

### 7.5 공지 수정
- `PATCH /api/v1/notices/:id`
- Body:
```json
{
  "title": "수정 제목",
  "content": "수정 내용",
  "category": "EVENT"
}
```

### 7.6 공지 이미지 추가(URL)
- `POST /api/v1/notices/:id/images`
- Body:
```json
{
  "imageUrl": "https://example.com/image.png",
  "sortOrder": 0
}
```

### 7.7 공지 이미지 업로드(파일)
- `POST /api/v1/notices/:id/images/upload`
- Content-Type: `multipart/form-data`
- Form fields:
  - `file` (필수, image/*)
  - `sortOrder` (선택)

### 7.8 공지 이미지 삭제
- `DELETE /api/v1/notices/:id/images/:imageId`

### 7.9 공지 삭제
- `DELETE /api/v1/notices/:id`
- Response `data`:
```json
{
  "id": 1
}
```

---

## 8. 면접(Interviews)

### 8.1 면접 목록
- `GET /api/v1/interviews`
- Query:
  - `status`: `READY | IN_PROGRESS | PAUSED | FINISHED`
  - `search`: 유저 닉네임/이메일
  - `from`, `to` (ISO date, `YYYY-MM-DD`)
  - `sortBy`: `createdAt | startedAt | durationSeconds` (기본 `createdAt`)
  - 공통 페이지네이션 쿼리
- Response `data`:
```json
{
  "totalCount": 0,
  "filteredCount": 0,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": 1,
      "userId": 1,
      "title": "면접 제목",
      "status": "FINISHED",
      "startedAt": "2026-03-13T00:00:00.000Z",
      "finishedAt": "2026-03-13T00:30:00.000Z",
      "pausedAt": null,
      "durationSeconds": 1800,
      "totalPausedSeconds": 0,
      "createdAt": "2026-03-13T00:00:00.000Z",
      "updatedAt": "2026-03-13T00:30:00.000Z",
      "user": {}
    }
  ]
}
```

### 8.2 면접 상세
- `GET /api/v1/interviews/:id`
- Response: 단건 `InterviewEntity` (user relation 포함)

---

## 9. 리포트(Reports)

### 9.1 리포트 목록
- `GET /api/v1/reports`
- Query:
  - `status`: `COMPLETED | IN_PROGRESS | FAILED`
  - `search`: 리포트 ID / 사용자 닉네임
  - `sortBy`: `completedAt | createdAt | score` (기본 `completedAt`)
  - 공통 페이지네이션 쿼리
- Response `data`:
```json
{
  "totalCount": 0,
  "filteredCount": 0,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "reportId": "RPT-20260313-0001",
      "interviewId": 1,
      "userId": 1,
      "jobCategory": "프론트엔드",
      "status": "COMPLETED",
      "score": 84.5,
      "feedback": "총평",
      "completedAt": "2026-03-13T00:40:00.000Z",
      "createdAt": "2026-03-13T00:35:00.000Z",
      "user": {},
      "questionResults": []
    }
  ]
}
```

### 9.2 리포트 상세
- `GET /api/v1/reports/:reportId`
- Response: 단건 `ReportEntity` (user, questionResults relation 포함)

---

## 10. 현재 코드 기준 주요 에러 코드

- Auth:
  - `INVALID_CREDENTIALS`
  - `INVALID_REFRESH_TOKEN`
- Users:
  - `USER_NOT_FOUND`
  - `INVALID_STATUS_TRANSITION`
- Questions:
  - `QUESTION_NOT_FOUND`
  - `QUESTION_DELETED`
  - `ALREADY_DELETED`
- Notices:
  - `NOTICE_NOT_FOUND`
  - `NOTICE_IMAGE_NOT_FOUND`
  - `NOTICE_IMAGE_REQUIRED`
  - `INVALID_NOTICE_IMAGE_TYPE`
  - `S3_CONFIG_MISSING`
  - `NOTICE_IMAGE_UPLOAD_FAILED`
- Interviews:
  - `INTERVIEW_NOT_FOUND`
- Reports:
  - `REPORT_NOT_FOUND`
