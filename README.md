# Gamyeon Backoffice API Server

AI 면접 플랫폼 **가면(Gamyeon)** 의 백오피스 관리 API 서버입니다.

## 기술 스택

- **NestJS 11** + TypeScript
- **JWT** 기반 인증 (Passport)
- **bcrypt** 비밀번호 해싱
- Mock 인메모리 데이터 (DB 연동 예정)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 값을 수정합니다. 필수 항목:

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `ADMIN_PASSWORD_HASH` | bcrypt 해시 비밀번호 (프로덕션 권장) | - |
| `JWT_SECRET` | JWT 서명 시크릿 키 | - |
| `JWT_EXPIRES_IN` | 토큰 만료 시간 | `8h` |
| `PORT` | 서버 포트 | `3002` |
| `FRONTEND_URL` | 프론트엔드 URL (CORS) | `http://localhost:3001` |
| `AWS_REGION` | Secrets Manager를 읽을 AWS 리전 | `ap-northeast-2` |
| `DB_SECRET_ID` | DB 자격증명이 들어있는 Secrets Manager ID | - |

### 3. 실행

```bash
# 개발 모드 (watch)
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

### 4. 테스트

```bash
npm run test
```

## 운영 시크릿 관리

운영 환경에서는 `DB_PASSWORD`를 `.env`나 Consul KV 대신 AWS Secrets Manager에서 읽을 수 있습니다.

1. Secrets Manager에 JSON 시크릿을 생성합니다.

```json
{
  "DB_USERNAME": "gamyeon_backoffice",
  "DB_PASSWORD": "change-me"
}
```

2. 앱 부트스트랩 env에 아래 값을 설정합니다.

```env
AWS_REGION=ap-northeast-2
DB_SECRET_ID=prod/gamyeon/backoffice/db
```

3. EC2 인스턴스 역할에 `secretsmanager:GetSecretValue` 권한을 추가합니다.

앱은 시작 시 `Consul KV -> Secrets Manager` 순서로 env를 로드하므로, 같은 키가 있으면 Secrets Manager 값이 최종 적용됩니다.

## API 엔드포인트

모든 API는 `/api/v1` 접두사를 사용하며, `@Public()` 표기가 없는 엔드포인트는 JWT 인증이 필요합니다.

### Auth (인증)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/auth/login` | 관리자 로그인 | 불필요 |
| `GET` | `/api/v1/auth/me` | 로그인 정보 조회 | 필요 |

### Dashboard (대시보드)

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/v1/dashboard/kpi` | KPI 지표 |
| `GET` | `/api/v1/dashboard/signup-trend` | 가입 추이 (`?days=13`) |
| `GET` | `/api/v1/dashboard/interview-completion` | 면접 완료율 |
| `GET` | `/api/v1/dashboard/report-analysis` | 리포트 분석율 |
| `GET` | `/api/v1/dashboard/recent-activities` | 최근 활동 (`?limit=20`) |
| `GET` | `/api/v1/dashboard/summary` | 전체 요약 (위 항목 통합) |

### Users (사용자 관리)

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/v1/users` | 사용자 목록 |
| `GET` | `/api/v1/users/:id` | 사용자 상세 |
| `PATCH` | `/api/v1/users/:id/status` | 상태 변경 (ACTIVE/WARNING/SUSPENDED) |
| `GET` | `/api/v1/users/:id/sanctions` | 제재 이력 조회 |

**공통 쿼리 파라미터**: `search`, `status`, `sortBy`, `sortOrder`, `page`, `limit`

### Questions (질문 관리)

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/v1/questions` | 공통질문 목록 |
| `POST` | `/api/v1/questions` | 공통질문 생성 (최소 10자) |
| `PATCH` | `/api/v1/questions/:id` | 공통질문 수정 |
| `DELETE` | `/api/v1/questions/:id` | 공통질문 삭제 (소프트 딜리트) |

### Notices (공지 관리)

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/v1/notices` | 공지 목록 |
| `GET` | `/api/v1/notices/:id` | 공지 상세 |
| `POST` | `/api/v1/notices` | 공지 생성 |
| `PATCH` | `/api/v1/notices/:id` | 공지 수정 |
| `DELETE` | `/api/v1/notices/:id` | 공지 삭제 (소프트 딜리트) |

### Interviews (면접 세션)

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/v1/interviews` | 면접 목록 |
| `GET` | `/api/v1/interviews/:sessionId` | 면접 상세 (질문별 상세 포함) |

### Reports (분석 리포트)

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/v1/reports` | 리포트 목록 |
| `GET` | `/api/v1/reports/:reportId` | 리포트 상세 (피드백, 질문별 결과 포함) |

## 응답 형식

### 성공

```json
{
  "success": true,
  "data": { ... }
}
```

### 오류

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

## 프로젝트 구조

```
src/
├── main.ts                          # 앱 진입점
├── app.module.ts                    # 루트 모듈 (ConfigModule 포함)
├── auth/                            # 인증 모듈
│   ├── auth.module.ts               #   JwtModule.registerAsync 사용
│   ├── auth.service.ts              #   로그인, getMe
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts              #   ConfigService 주입
│   ├── jwt-auth.guard.ts            #   글로벌 가드
│   └── dto/login.dto.ts
├── common/                          # 공통 유틸
│   ├── decorators/public.decorator.ts
│   ├── filters/http-exception.filter.ts
│   └── interceptors/response.interceptor.ts
├── dashboard/                       # 대시보드 모듈
├── users/                           # 사용자 관리 모듈
├── questions/                       # 질문 관리 모듈
├── notices/                         # 공지 관리 모듈
├── interviews/                      # 면접 세션 모듈
└── reports/                         # 분석 리포트 모듈
```

## 인증 흐름

1. `POST /api/v1/auth/login` — 이메일/비밀번호로 JWT 토큰 발급
2. 이후 요청 시 `Authorization: Bearer <token>` 헤더 포함
3. `JwtAuthGuard`가 글로벌로 적용되어 모든 라우트 보호 (`@Public()` 제외)

## 현재 제한사항

- 인메모리 Mock 데이터 사용 (서버 재시작 시 초기화)
