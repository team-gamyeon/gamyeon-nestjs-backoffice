# 1. 빌드 스테이지
# 플랫폼을 명시하여 아키텍처 오류를 방지합니다.
FROM --platform=linux/arm64 node:20-alpine AS builder

WORKDIR /app

# 종속성 설치 (캐시 활용을 위해 소스 복사 전 수행)
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2. 실행 스테이지
FROM --platform=linux/arm64 node:20-alpine AS runner

WORKDIR /app
# 보안 및 성능을 위해 환경 변수 설정
ENV NODE_ENV=production

# 프로덕션용 라이브러리만 설치
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 빌드 스테이지에서 생성된 결과물만 가져옴
COPY --from=builder /app/dist ./dist

# 포트는 3002를 사용하신다고 명시하셨네요.
EXPOSE 3002
CMD ["node", "dist/main"]