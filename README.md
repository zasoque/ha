# 하은행

> 하은행 디지털 금융 플랫폼 구축 프로젝트

## API

API 기본 URL: `https://ha.zasoque.org/api/v1`

### 1. 사용자 인증 API

Discord OAuth2를 사용하여 사용자 인증을 처리할거야.

- **`GET` /auth/login**: 사용자 로그인 리다이렉션 URL
- **`GET` /auth/logout**: 사용자 로그아웃

```mysql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY
);
```

### 2. 계좌 관리 API

- **`GET` /accounts**: 사용자 계좌 목록 조회
- **`POST` /accounts**: 새 계좌 생성
- **`GET` /accounts/{accountId}**: 특정 계좌 상세 조회
- **`PUT` /accounts/{accountId}**: 계좌 정보 업데이트
- **`DELETE` /accounts/{accountId}**: 계좌 삭제

```mysql
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    balance DECIMAL(20, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. 거래 API

- **`GET` /transactions**: 거래 내역 조회
- **`POST` /transactions/transfer**: 계좌 간 이체 거래 생성
  - `fromAccountId`: 출금 계좌 ID
  - `toAccountId`: 입금 계좌 ID
  - `amount`: 이체 금액
  - `description`: 거래 설명 (선택 사항)
- **`GET` /transactions/{transactionId}**: 특정 거래 상세 조회

```mysql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    account_id INTEGER,
    amount DECIMAL(20, 2),
    type ENUM('deposit', 'withdrawal', 'transfer'),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```
