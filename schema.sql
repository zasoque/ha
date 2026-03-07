/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.1.2-MariaDB, for osx10.21 (arm64)
--
-- Host: sch.shtelo.org    Database: ha_test
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-0+deb13u1 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

DROP DATABASE ha_test;
CREATE DATABASE ha_test CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
USE ha_test;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `balance` decimal(20,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `accounts` VALUES
(29,'1478762737394913460',78.33,'2026-03-06 07:31:30','2026-03-06 14:01:06'),
(30,'834994655133040681',0.00,'2026-03-06 08:27:37','2026-03-06 08:27:37'),
(33,'366565792910671873',0.00,'2026-03-06 08:56:07','2026-03-06 08:56:07'),
(34,'384250860588498955',0.00,'2026-03-06 12:43:18','2026-03-06 12:43:18'),
(35,'279786153945858048',0.00,'2026-03-06 12:46:17','2026-03-06 12:46:17'),
(36,'1185926173956505664',0.00,'2026-03-06 14:13:55','2026-03-06 14:13:55'),
(37,'893819819718234112',0.00,'2026-03-06 14:51:32','2026-03-06 14:51:32'),
(38,'629887752766488617',0.00,'2026-03-06 15:44:35','2026-03-06 15:44:35'),
(41,'51989020063075130',0.00,'2026-03-07 06:28:22','2026-03-07 06:28:22');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `admin_users` VALUES
('1185926173956505664'),
('1478762737394913460'),
('366565792910671873'),
('384250860588498955'),
('834994655133040681'),
('893819819718234112');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `buildings`
--

DROP TABLE IF EXISTS `buildings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `buildings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `land_id` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `land_id` (`land_id`),
  CONSTRAINT `buildings_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `buildings_ibfk_2` FOREIGN KEY (`land_id`) REFERENCES `lands` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buildings`
--

LOCK TABLES `buildings` WRITE;
/*!40000 ALTER TABLE `buildings` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `buildings` VALUES
(4,'도떼기시장','1478762737394913460',5,'시장','2026-03-06 13:24:38','2026-03-06 13:24:38'),
(5,'광장시범아파트 101','1478762737394913460',6,'주거','2026-03-06 13:37:36','2026-03-06 13:37:36'),
(6,'광장시범아파트 102','1478762737394913460',7,'주거','2026-03-06 13:37:59','2026-03-06 13:37:59'),
(7,'광장시범아파트 103','1478762737394913460',8,'주거','2026-03-06 13:38:27','2026-03-06 13:38:27'),
(8,'광장시범아파트 201','1478762737394913460',6,'주거','2026-03-06 13:39:07','2026-03-06 13:39:07'),
(9,'광장시범아파트 301','1478762737394913460',6,'주거','2026-03-06 13:39:26','2026-03-06 13:39:26'),
(10,'광장시범아파트 202','1478762737394913460',7,'주거','2026-03-06 13:39:51','2026-03-06 13:39:51'),
(11,'광장시범아파트 302','1478762737394913460',7,'주거','2026-03-06 13:40:07','2026-03-06 13:40:07'),
(12,'광장시범아파트 402','1478762737394913460',7,'주거','2026-03-06 13:40:22','2026-03-06 13:40:22'),
(13,'광장시범아파트 203','1478762737394913460',8,'주거','2026-03-06 13:40:41','2026-03-06 13:40:41'),
(14,'광장시범아파트 303','1478762737394913460',8,'주거','2026-03-06 13:40:58','2026-03-06 13:40:58'),
(15,'하정부임시청사','1478762737394913460',9,'주거','2026-03-06 13:45:43','2026-03-06 13:45:43');
/*!40000 ALTER TABLE `buildings` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `corporation_members`
--

DROP TABLE IF EXISTS `corporation_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `corporation_members` (
  `corporation_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`corporation_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `corporation_members_ibfk_1` FOREIGN KEY (`corporation_id`) REFERENCES `people` (`id`),
  CONSTRAINT `corporation_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `people` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corporation_members`
--

LOCK TABLES `corporation_members` WRITE;
/*!40000 ALTER TABLE `corporation_members` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `corporation_members` VALUES
('51989020063075130','366565792910671873');
/*!40000 ALTER TABLE `corporation_members` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `harvests`
--

DROP TABLE IF EXISTS `harvests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `harvests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `building_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`),
  CONSTRAINT `harvests_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `harvests`
--

LOCK TABLES `harvests` WRITE;
/*!40000 ALTER TABLE `harvests` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `harvests` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `inventory` VALUES
(7,'366565792910671873',1,5),
(8,'1478762737394913460',3,58),
(9,'51989020063075130',1,1);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `maker` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `maker` (`maker`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`maker`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `items` VALUES
(1,'스치의 사랑','스치가 사랑해주는 아이템. 가지고 있으면 따뜻하다.','366565792910671873','2026-03-03 13:52:54','2026-03-03 13:52:54'),
(2,'공신당 당원증','공신당의 당원임을 증명하는 증서.','384250860588498955','2026-03-03 14:09:40','2026-03-03 14:09:40'),
(3,'테인트','이건 모든 것의 재료가 될 거야.','366565792910671873','2026-03-04 11:14:45','2026-03-04 11:14:45'),
(4,'나뭇가지','이전에는 모냐고 둥지의 일부였다.','834994655133040681','2026-03-06 08:28:45','2026-03-06 08:28:45');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `lands`
--

DROP TABLE IF EXISTS `lands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `position` point NOT NULL,
  `color` varchar(6) DEFAULT NULL,
  `fertility` float DEFAULT rand(),
  `solidity` float DEFAULT rand(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  SPATIAL KEY `position` (`position`),
  CONSTRAINT `lands_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lands`
--

LOCK TABLES `lands` WRITE;
/*!40000 ALTER TABLE `lands` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `lands` VALUES
(5,'중앙광장','1478762737394913460',0x00000000010100000000000000000000000000000000000000,'042a64',0.336299,0.296314,'2026-03-06 13:18:38','2026-03-06 13:18:38'),
(6,'광장동1','1478762737394913460',0x000000000101000000000000000000F03F000000000000F03F,'55d3ad',0.188267,0.130669,'2026-03-06 13:20:47','2026-03-06 13:20:47'),
(7,'광장동2','1478762737394913460',0x000000000101000000000000000000F03F0000000000000000,'e42525',0.574749,0.187692,'2026-03-06 13:21:21','2026-03-06 13:21:21'),
(8,'광장동3','1478762737394913460',0x000000000101000000000000000000F03F000000000000F0BF,'8f1fb7',0.984265,0.0361456,'2026-03-06 13:21:50','2026-03-06 13:21:50'),
(9,'광장동4','1478762737394913460',0x0000000001010000000000000000000000000000000000F0BF,'2228e2',0.832628,0.977482,'2026-03-06 13:22:12','2026-03-06 13:22:12');
/*!40000 ALTER TABLE `lands` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `notifications` VALUES
(1,'366565792910671873','이것은 테스트용 알림이야.',1,'2026-03-04 12:48:48'),
(2,'384250860588498955','계좌번호 undefined번으로 Ñ0.01원이 입금됐어. 현재 잔액은 Ñ0.000.01원이야.',1,'2026-03-04 13:12:06'),
(3,'384250860588498955','계좌번호 17번으로 Ñ0.01원이 입금됐어. 현재 잔액은 Ñ0.02원이야.',1,'2026-03-04 13:16:02'),
(4,'366565792910671873','사용자 ssdxn가 너에게 공신당 당원증 아이템 1개를 보냈어.',1,'2026-03-04 13:17:06'),
(5,'384250860588498955','사용자 sch가 너에게 공신당 당원증 아이템 1개를 보냈어.',1,'2026-03-04 13:17:37'),
(6,'366565792910671873','계좌번호 13번으로 Ñ0.01원이 입금됐어. 현재 잔액은 Ñ1원이야.',1,'2026-03-04 13:19:43'),
(7,'629887752766488617','관리자가 너에게 체험 비자를 발급했어. 발급 날짜는 2026-03-05야.',1,'2026-03-05 03:23:01'),
(8,'366565792910671873','계좌번호 undefined번의 계좌가 삭제됐어.',1,'2026-03-05 13:51:13'),
(9,'366565792910671873','계좌번호 undefined번의 계좌가 삭제됐어.',1,'2026-03-05 13:52:43'),
(10,'366565792910671873','관리자가 13번 계좌에 1원을 입금했어. 현재 잔액은 2.00원이야.',1,'2026-03-05 14:54:20'),
(11,'593036742852870145','관리자가 너에게 체험 비자를 발급했어. 발급 날짜는 2026-03-06야.',0,'2026-03-06 02:40:47'),
(12,'875767258104860753','관리자가 너에게 체험 비자를 발급했어. 발급 날짜는 2026-03-06야.',0,'2026-03-06 03:52:45'),
(13,'366565792910671873','관리자가 13번 계좌에 1원을 입금했어. 현재 잔액은 1.00원이야.',1,'2026-03-06 04:37:09'),
(14,'366565792910671873','관리자가 너를 1에 거주하는 스치으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',1,'2026-03-06 04:53:09'),
(15,'384250860588498955','관리자가 너를 2에 거주하는 진순으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',1,'2026-03-06 04:53:40'),
(16,'384250860588498955','계좌번호 17번으로 Ñ0.99원이 입금됐어. 현재 잔액은 Ñ0.99원이야.',1,'2026-03-06 05:13:50'),
(17,'384250860588498955','테스트시장에서 undefined 1개가 판매되었습니다. Ñ0.01을 획득하였습니다.',1,'2026-03-06 06:28:48'),
(18,'384250860588498955','사용자 sch가 너에게 공신당 당원증 아이템 1개를 보냈어.',1,'2026-03-06 06:30:39'),
(19,'384250860588498955','테스트시장에서 공신당 당원증 1개가 판매되었습니다. Ñ1.00을 획득하였습니다.',1,'2026-03-06 06:31:59'),
(20,'366565792910671873','테스트시장에서 스치의 사랑 1개가 판매되었습니다. Ñ1.00을 획득하였습니다.',1,'2026-03-06 06:33:24'),
(21,'366565792910671873','테스트시장에서 스치의 사랑 1개가 판매되었습니다. Ñ1.00을 획득하였습니다.',1,'2026-03-06 06:38:05'),
(22,'366565792910671873','테스트시장에서 스치의 사랑 1개가 판매되었습니다. Ñ1.00을 획득하였습니다.',1,'2026-03-06 06:39:37'),
(23,'834994655133040681','계좌번호 31번의 계좌가 삭제됐어.',0,'2026-03-06 08:27:46'),
(24,'834994655133040681','계좌번호 32번의 계좌가 삭제됐어.',0,'2026-03-06 08:27:48'),
(25,'355354931026198528','관리자가 너에게 체험 비자를 발급했어. 발급 날짜는 2026-03-06야.',0,'2026-03-06 09:10:48'),
(26,'1478762737394913460','관리자가 너를 관리자에 추가했어. 이제 관리자 권한을 사용할 수 있어.',1,'2026-03-06 12:45:01'),
(27,'893819819718234112','관리자가 너를 관리자에 추가했어. 이제 관리자 권한을 사용할 수 있어.',0,'2026-03-06 13:10:03'),
(28,'1478762737394913460','관리자가 29번 계좌에 200원을 입금했어. 현재 잔액은 200.00원이야.',0,'2026-03-06 13:12:47'),
(29,'1478762737394913460','관리자가 너를 15에 거주하는 하 정부으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',0,'2026-03-06 13:47:13'),
(30,'384250860588498955','관리자가 너를 6에 거주하는 진순으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',1,'2026-03-06 14:07:31'),
(31,'366565792910671873','관리자가 너를 5에 거주하는 스치으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',1,'2026-03-06 14:07:52'),
(32,'834994655133040681','관리자가 너를 10에 거주하는 모냐고으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',0,'2026-03-06 14:08:09'),
(33,'1185926173956505664','관리자가 너를 11에 거주하는 삼쩌모으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',1,'2026-03-06 14:08:22'),
(34,'893819819718234112','관리자가 너를 12에 거주하는 서곰으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',0,'2026-03-06 14:08:51'),
(35,'279786153945858048','관리자가 너를 8에 거주하는 은누으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',0,'2026-03-06 14:09:07'),
(36,'1250431274112520293','관리자가 너를 9에 거주하는 루팡으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',0,'2026-03-06 14:09:35'),
(37,'1292877136541126788','관리자가 너를 7에 거주하는 국제으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',0,'2026-03-06 14:09:44'),
(38,'1407548525700452493','관리자가 너를 13에 거주하는 빙그르르으로 수정했어. 변경된 정보로 서비스를 이용할 수 있어.',0,'2026-03-06 14:09:49'),
(39,'1204286454574882836','관리자가 너에게 체험 비자를 발급했어. 발급 날짜는 2026-03-07야.',0,'2026-03-07 01:14:39'),
(40,'72868850857974225','관리자가 너를 null에 거주하는 슈텔로으로 등록했어.',0,'2026-03-07 03:15:31'),
(41,'72868850857974225','관리자가 너를 등록부에서 삭제했어. 더 이상 서비스를 이용할 수 없어.',0,'2026-03-07 03:21:23'),
(42,'51989020063075130','관리자가 너를 null에 거주하는 슈텔로으로 등록했어.',0,'2026-03-07 03:21:30'),
(43,'366565792910671873','계좌번호 39번의 계좌가 삭제됐어.',1,'2026-03-07 03:26:52'),
(44,'366565792910671873','계좌번호 40번의 계좌가 삭제됐어.',1,'2026-03-07 03:27:47'),
(45,'906041727310262292','관리자가 너에게 체험 비자를 발급했어. 발급 날짜는 2026-03-07야.',0,'2026-03-07 05:39:52'),
(46,'629566961734647808','관리자가 너를 null에 거주하는 안득으로 등록했어.',0,'2026-03-07 06:17:21');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `people`
--

DROP TABLE IF EXISTS `people`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `people` (
  `id` varchar(255) NOT NULL DEFAULT concat(floor(1 + rand() * 9),lpad(floor(rand() * 10000000000000000),16,'0')),
  `name` varchar(255) DEFAULT NULL,
  `residence` int(11) DEFAULT NULL,
  `type` enum('person','corporation') DEFAULT 'person',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_residence` (`residence`),
  CONSTRAINT `fk_people_residence` FOREIGN KEY (`residence`) REFERENCES `buildings` (`id`),
  CONSTRAINT `people_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `people`
--

LOCK TABLES `people` WRITE;
/*!40000 ALTER TABLE `people` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `people` VALUES
('1185926173956505664','삼쩌모',11,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('1250431274112520293','루팡',9,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('1292877136541126788','국제',7,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('1407548525700452493','빙그르르',13,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('1478762737394913460','하 정부',15,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('279786153945858048','은누',8,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('366565792910671873','스치',5,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('384250860588498955','진순',6,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('51989020063075130','슈텔로',NULL,'corporation','2026-03-07 03:21:30','2026-03-07 03:21:30'),
('629566961734647808','안득',NULL,'person','2026-03-07 06:17:21','2026-03-07 06:17:21'),
('834994655133040681','모냐고',10,'person','2026-03-07 03:19:17','2026-03-07 03:19:33'),
('893819819718234112','서곰',12,'person','2026-03-07 03:19:17','2026-03-07 03:19:33');
/*!40000 ALTER TABLE `people` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(20,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `market_id` int(11) DEFAULT NULL,
  `account_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `owner_id` (`owner_id`),
  KEY `market_id` (`market_id`),
  KEY `fk_product_account` (`account_id`),
  CONSTRAINT `fk_product_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `products_ibfk_3` FOREIGN KEY (`market_id`) REFERENCES `buildings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `products` VALUES
(13,3,40,0.20,'따끈따끈한 테인트 팔고있노라','1478762737394913460',4,29,'2026-03-06 14:01:06','2026-03-06 14:01:06');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `rails`
--

DROP TABLE IF EXISTS `rails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `land_a_id` int(11) DEFAULT NULL,
  `land_b_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `land_a_id` (`land_a_id`),
  KEY `land_b_id` (`land_b_id`),
  CONSTRAINT `rails_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `rails_ibfk_2` FOREIGN KEY (`land_a_id`) REFERENCES `lands` (`id`),
  CONSTRAINT `rails_ibfk_3` FOREIGN KEY (`land_b_id`) REFERENCES `lands` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rails`
--

LOCK TABLES `rails` WRITE;
/*!40000 ALTER TABLE `rails` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `rails` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `roads`
--

DROP TABLE IF EXISTS `roads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `land_a_id` int(11) DEFAULT NULL,
  `land_b_id` int(11) DEFAULT NULL,
  `line` linestring NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `land_a_id` (`land_a_id`),
  KEY `land_b_id` (`land_b_id`),
  SPATIAL KEY `line` (`line`),
  CONSTRAINT `roads_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `roads_ibfk_2` FOREIGN KEY (`land_a_id`) REFERENCES `lands` (`id`),
  CONSTRAINT `roads_ibfk_3` FOREIGN KEY (`land_b_id`) REFERENCES `lands` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roads`
--

LOCK TABLES `roads` WRITE;
/*!40000 ALTER TABLE `roads` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `roads` VALUES
(2,'서웅로','1478762737394913460',5,7,0x0000000001020000000200000000000000000000000000000000000000000000000000F03F0000000000000000,'2026-03-06 13:27:21','2026-03-06 13:27:21'),
(3,'차등로','1478762737394913460',6,7,0x00000000010200000002000000000000000000F03F000000000000F03F000000000000F03F0000000000000000,'2026-03-06 13:28:34','2026-03-06 13:28:34'),
(4,'진순로','1478762737394913460',8,7,0x00000000010200000002000000000000000000F03F000000000000F0BF000000000000F03F0000000000000000,'2026-03-06 13:28:54','2026-03-06 13:28:54'),
(5,'스치로','1478762737394913460',9,5,0x000000000102000000020000000000000000000000000000000000F0BF00000000000000000000000000000000,'2026-03-06 13:29:27','2026-03-06 13:29:27');
/*!40000 ALTER TABLE `roads` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `type` enum('deposit','withdrawal','transfer') DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `transactions` VALUES
(67,29,200.00,'deposit','발행','2026-03-06 13:12:47'),
(68,29,-2.00,'withdrawal','토지 개발','2026-03-06 13:18:38'),
(69,29,-2.00,'withdrawal','토지 개발','2026-03-06 13:20:47'),
(70,29,-2.00,'withdrawal','토지 개발','2026-03-06 13:21:21'),
(71,29,-2.00,'withdrawal','토지 개발','2026-03-06 13:21:50'),
(72,29,-2.00,'withdrawal','토지 개발','2026-03-06 13:22:12'),
(73,29,2.34,'withdrawal','땅#5 시장 건축 비용','2026-03-06 13:24:38'),
(74,29,2.48,'withdrawal','땅#6 거주 건축 비용','2026-03-06 13:25:33'),
(75,29,2.55,'withdrawal','땅#6 거주 건축 비용','2026-03-06 13:32:31'),
(76,29,1.15,'withdrawal','땅#6 1층 주거 증축세','2026-03-06 13:37:36'),
(77,29,0.80,'withdrawal','땅#7 1층 주거 증축세','2026-03-06 13:37:59'),
(78,29,4.15,'withdrawal','땅#8 1층 주거 증축세','2026-03-06 13:38:27'),
(79,29,4.59,'withdrawal','땅#6 2층 주거 증축세','2026-03-06 13:39:07'),
(80,29,10.33,'withdrawal','땅#6 3층 주거 증축세','2026-03-06 13:39:26'),
(81,29,3.20,'withdrawal','땅#7 2층 주거 증축세','2026-03-06 13:39:51'),
(82,29,7.19,'withdrawal','땅#7 3층 주거 증축세','2026-03-06 13:40:07'),
(83,29,12.79,'withdrawal','땅#7 4층 주거 증축세','2026-03-06 13:40:22'),
(84,29,16.60,'withdrawal','땅#8 2층 주거 증축세','2026-03-06 13:40:41'),
(85,29,37.35,'withdrawal','땅#8 3층 주거 증축세','2026-03-06 13:40:57'),
(86,29,0.15,'withdrawal','땅#9 1층 주거 증축세','2026-03-06 13:45:43'),
(87,29,0.01,'withdrawal','\"3\" 출품을 위한 운송비','2026-03-06 14:01:06');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(''),
('1185926173956505664'),
('1194172682778972192'),
('1204286454574882836'),
('1250431274112520293'),
('1292877136541126788'),
('1407548525700452493'),
('1470740158625222855'),
('1478762737394913460'),
('260375229174382592'),
('279786153945858048'),
('355354931026198528'),
('366565792910671873'),
('384250860588498955'),
('51989020063075130'),
('593036742852870145'),
('629566961734647808'),
('629887752766488617'),
('72868850857974225'),
('78766657750101452'),
('820976287807307797'),
('834994655133040681'),
('875767258104860753'),
('890160991659245630'),
('893819819718234112'),
('901083123629043713'),
('906041727310262292');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `visas`
--

DROP TABLE IF EXISTS `visas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `visas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `date_expiry` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `visas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visas`
--

LOCK TABLES `visas` WRITE;
/*!40000 ALTER TABLE `visas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `visas` VALUES
(2,'1250431274112520293','단기','2026-02-26','2026-03-04'),
(3,'629887752766488617','단기','2026-02-27','2026-03-05'),
(4,'893819819718234112','체험','2026-02-27','2026-03-26'),
(5,'1185926173956505664','체험','2026-02-27','2026-03-26'),
(6,'1292877136541126788','체험','2026-02-27','2026-03-26'),
(7,'260375229174382592','단기','2026-02-28','2026-03-06'),
(8,'629566961734647808','단기','2026-02-28','2026-03-06'),
(9,'1407548525700452493','체험','2026-03-01','2026-03-31'),
(10,'1194172682778972192','단기','2026-03-02','2026-03-08'),
(11,'1470740158625222855','체험','2026-03-02','2026-04-01'),
(12,'279786153945858048','체험','2026-03-02','2026-04-01'),
(13,'890160991659245630','체험','2026-03-02','2026-04-01'),
(14,'629566961734647808','체험','2026-03-04','2026-04-03'),
(16,'629887752766488617','체험','2026-03-05','2026-04-04'),
(17,'593036742852870145','체험','2026-03-06','2026-04-05'),
(18,'875767258104860753','체험','2026-03-06','2026-04-05'),
(19,'355354931026198528','체험','2026-03-06','2026-04-05'),
(20,'1204286454574882836','체험','2026-03-07','2026-04-06'),
(21,'906041727310262292','체험','2026-03-07','2026-04-06');
/*!40000 ALTER TABLE `visas` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-03-07 16:26:51
