# 하은행

> 하은행 디지털 금융 플랫폼 구축 프로젝트

## API

API 기본 URL: `https://ha.zasoque.org/api/v1`

### 1. 사용자 인증 API `/auth`

Discord OAuth2를 사용하여 사용자 인증을 처리할거야.

- **`GET` /auth/login**: 사용자 로그인 리다이렉션 URL
- **`GET` /auth/logout**: 사용자 로그아웃

```mysql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY
);
```

### 2. 계좌 관리 API `/accounts`

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

### 3. 거래 API `/transactions`

- **`GET` /transactions**: 거래 내역 조회
- **`POST` /transactions/transfer**: 계좌 간 이체 거래 생성
  - `fromAccountId`: 출금 계좌 ID
  - `toAccountId`: 입금 계좌 ID
  - `amount`: 이체 금액
  - `description`: 거래 설명 (선택 사항)
- **`GET` /transactions/{transactionId}**: 특정 거래 상세 조회
- **`GET` /transactions/accounts/{accountId}**: 특정 계좌 거래 내역 조회

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

### 4. 시장 API `/products`

- **`GET` /products**: 시장 품목 조회
  - URL 쿼리 매개변수:
    - `page`: 페이지 번호 (기본값: 1)
    - `limit`: 페이지당 품목 수 (기본값: 20)
- **`POST` /products**: 새 시장 품목 생성
  - `name`: 품목 이름
  - `price`: 품목 가격
  - `description`: 품목 설명 (선택 사항)
- **`GET` /products/{marketId}**: 특정 시장 품목 상세 조회
- **`PUT` /products/{marketId}**: 시장 품목 정보 업데이트
- **`DELETE` /products/{marketId}**: 시장 품목 삭제

```mysql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    price DECIMAL(20, 2),
    description TEXT,
    owner_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### 5. 관리자 API `/admin`

#### 관리자 목록 API `/admin/users`

- **`GET` /admin/users**: 모든 관리자 목록 조회 (관리자 권한 필요)
- **`POST` /admin/users**: 새 사용자 생성 (관리자 권한 필요)
  - `id`: 사용자 ID (Discord ID)
- **`DELETE` /admin/users/{userId}**: 사용자 삭제 (관리자 권한 필요)

```mysql
CREATE TABLE admin_users (
    id VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES users(id)
);
```

#### 국민 API `/admin/people`

- **`GET` /admin/people**: 모든 국민 목록 조회 (관리자 권한 필요)
  - URL 쿼리 매개변수:
    - `page`: 페이지 번호 (기본값: 1)
    - `limit`: 페이지당 국민 수 (기본값: 20)
- **`POST` /admin/people**: 새 국민 생성 (관리자 권한 필요)
  - `id`: 국민 ID (Discord ID)
  - `name`: 국민 이름
  - `residence`: 국민 거주지
- **`PUT` /admin/people/{personId}**: 국민 정보 업데이트 (관리자 권한 필요)
- **`DELETE` /admin/people/{personId}**: 국민 삭제 (관리자 권한 필요)

```mysql
CREATE TABLE people (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    residence VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id)
);
```

#### 사증 API `/admin/visas`

- **`GET` /admin/visas**: 모든 사증 목록 조회 (관리자 권한 필요)
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 사증 수 (기본값: 20)
- **`POST` /admin/visas**: 새 사증 생성 (관리자 권한 필요)
  - `user_id`: 사증 소유자 ID (Discord ID)
  - `type`: 사증 유형 (예: `'관광'`, `'체험'`)
  - `date_issued`: 사증 발급 날짜

```mysql
CREATE TABLE visas (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    type VARCHAR(255),
    date_issued DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 경제 API `/admin/economy`

- **`POST` /admin/economy/print**: 화폐 발행 (관리자 권한 필요)
  - `amount`: 발행할 화폐 양
  - `account`: 화폐를 입금할 계좌 ID

### 6. 아이템 API `/items`

- **`GET` /items**: 아이템 목록 조회
  - URL 쿼리 매개변수:
    - `page`: 페이지 번호 (기본값: 1)
    - `limit`: 페이지당 아이템 수 (기본값: 50)
- **`POST` /items**: 새 아이템 생성
  - `name`: 아이템 이름
  - `description`: 아이템 설명 (선택 사항)
- **`GET` /items/{itemId}**: 특정 아이템 상세 조회
- **`PUT` /items/{itemId}**: 아이템 정보 업데이트
- **`DELETE` /items/{itemId}**: 아이템 삭제

```mysql
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    description TEXT,
    maker VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (maker) REFERENCES users(id)
);
```

#### 인벤토리 API `/inventory`

- **`GET` /inventory**: 사용자 인벤토리 조회
- **`POST` /inventory/users/{userId}**: 인벤토리에 아이템 추가 (관리자 권한 필요)
  - `item_id`: 추가할 아이템 ID
  - `quantity`: 추가할 아이템 수량
- **`DELETE` /inventory/users/{userId}**: 인벤토리에서 아이템 제거 (관리자 권한 필요)
  - `item_id`: 제거할 아이템 ID
  - `quantity`: 제거할 아이템 수량
- **`POST` /inventory/transfer**: 아이템 주기
  - `to_user_id`: 도착 사용자 ID
  - `item_id`: 이체할 아이템 ID
  - `quantity`: 이체할 아이템 수량

```mysql
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    item_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
```
