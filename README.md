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
  - `user_id`: 계좌 소유자 ID (Discord ID)
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
  - `fromAccountId`: 출금 계좌번호
  - `toAccountId`: 입금 계좌번호
  - `amount`: 이체 금액
  - `description`: 거래 설명 (선택 사항)
  - `path`: 거래 경로 (예: `1_2_3` - 토지 1 → 토지 2 → 토지 3)
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
  - `item_id`: 품목이 되는 아이템 ID
  - `count`: 품목 수량
  - `price`: 품목 가격
  - `description`: 품목 설명 (선택 사항)
  - `market_id`: 품목이 판매되는 시장 ID
  - `path`: 품목 거래 경로 (예: `1_2_3` - 토지 1 → 토지 2 → 토지 3)
  - `account_id`: 품목 시장 등록 시 운송비를 지불하고 판매 대금을 입금할 계좌번호
- **`GET` /products/{productId}**: 특정 시장 품목 상세 조회
- **`POST` /products/{productId}/buy**: 시장 품목 구매
  - `account_id`: 구매자가 지불할 계좌번호
  - `count`: 구매할 품목 수량
  - `path`: 품목 거래 경로 (예: `1_2_3` - 토지 1 → 토지 2 → 토지 3)

```mysql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    item_id INTEGER,
    quantity INTEGER,
    price DECIMAL(20, 2),
    description TEXT,
    owner_id VARCHAR(255),
    market_id INTEGER,
    account_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (market_id) REFERENCES buildings(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
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
  - `type`: 국민 유형 (예: `'person'`, `'corporation'`)
- **`PUT` /admin/people/{personId}**: 국민 정보 업데이트 (관리자 권한 필요)
- **`DELETE` /admin/people/{personId}**: 국민 삭제 (관리자 권한 필요)

```mysql
CREATE TABLE people (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    residence INTEGER UNIQUE,
    type ENUM('person', 'corporation') DEFAULT 'person',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (residence) REFERENCES buildings(id),
);
```

#### 법인 API `/admin/corporations`

- **`POST` /admin/corporations/{corporationId}/members**: 법인에 구성원 추가 (법인 회원 혹은 관리자 권한 필요)
  - `user_id`: 추가할 구성원 ID (Discord ID)
- **`DELETE` /admin/corporations/{corporationId}/members**: 법인에서 구성원 제거 (법인 회원 혹은 관리자 권한 필요)
  - `user_id`: 제거할 구성원 ID (Discord ID)

```mysql
CREATE TABLE corporation_members (
    corporation_id VARCHAR(255),
    user_id VARCHAR(255),
    PRIMARY KEY (corporation_id, user_id),
    FOREIGN KEY (corporation_id) REFERENCES people(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
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
    date_expiry DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 경제 API `/admin/economy`

- **`POST` /admin/economy/print**: 화폐 발행 (관리자 권한 필요)
  - `amount`: 발행할 화폐 양
  - `account`: 화폐를 입금할 계좌번호
- **`POST` /admin/economy/burn**: 화폐 소각 (관리자 권한 필요)
  - `amount`: 소각할 화폐 양
  - `account`: 화폐를 출금할 계좌번호

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
- **`POST` /items/{itemId}/craft**: 아이템 제작
  - `quantity`: 제작할 아이템 수량

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

### 7. 알림 API `/notifications`

- **`GET` /notifications**: 사용자 알림 목록 조회
- **`POST` /notifications/{notificationId}/read**: 알림 읽음 처리

```mysql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 8. 지도 API `/maps`

- **`GET` /maps/path/[path]**: 지도 경로 조회
  - `1_2_3`: 토지 1 → 토지 2 → 토지 3

#### 토지 API `/maps/lands`

- **`GET` /maps/lands**: 토지 목록 조회
- **`POST` /maps/lands**: 새 토지 생성
  - `name`: 토지 이름
  - `x`: 토지 X 좌표
  - `y`: 토지 Y 좌표
  - `color`: 토지 색상 (예: `#FF0000`)
  - `account_id`: 토지 개발 비용을 지불할 계좌번호
  - `free`: 토지 개발 무료 여부 (관리자 권한 필요)
- **`GET` /maps/lands/{landId}**: 특정 토지 상세 조회
- **`PUT` /maps/lands/{landId}**: 토지 정보 업데이트 (지주)
- **`DELETE` /maps/lands/{landId}**: 토지 삭제 (관리자 권한 필요)
- **`GET` /maps/lands/{landId}/fertility**: 토지 비옥도 조회
  - `level`: 비옥도 단계 (예: `1`, `2`, `3`)
  - `account_id`: 비옥도 조회 비용을 지불할 계좌번호
- **`GET` /maps/lands/{landId}/solidity**: 토지 강도 조회
  - `level`: 강도 단계 (예: `1`, `2`, `3`)
  - `account_id`: 강도 조회 비용을 지불할 계좌번호

```mysql
CREATE TABLE lands (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    owner_id VARCHAR(255),
    position POINT NOT NULL,
    color VARCHAR(6),
    fertility FLOAT DEFAULT RAND(),
    solidity FLOAT DEFAULT RAND(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    SPATIAL INDEX(position)
);
```

#### 건물 API `/maps/buildings`

- **`GET` /maps/buildings**: 건물 목록 조회
- **`GET` /maps/lands/{landId}/buildings**: 건물 목록 조회
- **`POST` /maps/lands/{landId}/buildings**: 새 건물 생성
  - `name`: 건물 이름
  - `land_id`: 건물이 위치한 토지 ID
  - `type`: 건물 유형 (예: `'주거'`, `'사무'`, `'시장'`, `'농장'`)
  - `account_id`: 건물 건설 비용을 지불할 계좌번호
  - `free`: 건물 건설 무료 여부 (관리자 권한 필요)
- **`GET` /maps/buildings/{buildingId}**: 특정 건물 상세 조회
- **`PUT` /maps/buildings/{buildingId}**: 건물 정보 업데이트 (건물주)
- **`DELETE` /maps/buildings/{buildingId}**: 건물 삭제 (관리자 권한 필요)

```mysql
CREATE TABLE buildings (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    owner_id VARCHAR(255),
    land_id INTEGER,
    type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (land_id) REFERENCES lands(id)
);
```

##### 추수 API `/maps/buildings/{buildingId}/harvest`

- **`GET` /maps/buildings/{buildingId}/harvest**: 건물 수확 정보 조회
- **`POST` /maps/buildings/{buildingId}/harvest**: 건물 수확 처리

```mysql
CREATE TABLE harvests (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    building_id INTEGER,
    quantity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);
```

#### 도로 API `/maps/roads`

- **`GET` /maps/roads**: 도로 목록 조회
- **`POST` /maps/roads**: 새 도로 생성
  - `name`: 도로 이름
  - `land_a_id`: 도로가 연결하는 토지 A ID
  - `land_b_id`: 도로가 연결하는 토지 B ID
- **`GET` /maps/roads/{roadId}**: 특정 도로 상세 조회
- **`PUT` /maps/roads/{roadId}**: 도로 정보 업데이트 (도로주)
- **`DELETE` /maps/roads/{roadId}**: 도로 삭제 (관리자 권한 필요)

```mysql
CREATE TABLE roads (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    owner_id VARCHAR(255),
    land_a_id INTEGER,
    land_b_id INTEGER,
    line LINESTRING NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (land_a_id) REFERENCES lands(id),
    FOREIGN KEY (land_b_id) REFERENCES lands(id),
    SPATIAL INDEX(line)
);
```

#### 철도 API `/maps/rails`

- **`GET` /maps/rails**: 철도 목록 조회
- **`POST` /maps/rails**: 새 철도 생성
  - `name`: 철도 이름
  - `land_a_id`: 철도가 연결하는 토지 A ID
  - `land_b_id`: 철도가도로 연결하는 토지 B ID
  - `free`: 철도 건설 무료 여부 (관리자 권한 필요)
- **`GET` /maps/rails/{railId}**: 특정 철도 상세
- **`PUT` /maps/rails/{railId}**: 철도 정보 업데이트 (철도주)
- **`DELETE` /maps/rails/{railId}**: 철도 삭제 (관리자 권한 필요)

```mysql
CREATE TABLE rails (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    owner_id VARCHAR(255),
    land_a_id INTEGER,
    land_b_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (land_a_id) REFERENCES lands(id),
    FOREIGN KEY (land_b_id) REFERENCES lands(id)
);
```
