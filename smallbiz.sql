-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: smallbiz
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contains`
--

DROP TABLE IF EXISTS `contains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contains` (
  `M_ID` int NOT NULL,
  `Ing_ID` int NOT NULL,
  PRIMARY KEY (`M_ID`,`Ing_ID`),
  KEY `fk_contains_ing` (`Ing_ID`),
  CONSTRAINT `fk_contains_ing` FOREIGN KEY (`Ing_ID`) REFERENCES `ingredients` (`Ing_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_contains_menu` FOREIGN KEY (`M_ID`) REFERENCES `menu items` (`M_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contains`
--

LOCK TABLES `contains` WRITE;
/*!40000 ALTER TABLE `contains` DISABLE KEYS */;
INSERT INTO `contains` VALUES (1,1),(6,1),(11,1),(3,2),(4,2),(5,2),(7,2),(8,2),(9,2),(10,2),(5,7),(9,7),(16,7),(9,8),(10,9),(7,10),(8,11),(2,12),(3,12),(4,12),(5,12),(7,12),(8,12),(9,12),(10,12),(1,13),(6,13),(11,13),(11,14),(12,14),(13,14),(14,15),(14,16),(15,16),(20,16),(14,17),(15,17),(20,17),(15,18),(16,19),(19,19),(17,20),(17,21),(17,22),(12,23),(13,24),(18,25),(18,26),(18,27),(19,28),(20,29),(20,30);
/*!40000 ALTER TABLE `contains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `CID` int NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`CID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Ava Patel','ava@example.com'),(2,'Liam Chen','liam@example.com'),(3,'Noah Davis','noah@example.com'),(4,'Emma Johnson','emma@example.com'),(5,'Olivia Garcia','olivia@example.com'),(6,'Mason Wright','mason@example.com'),(7,'Sophia Lee','sophia@example.com'),(8,'James Walker','james@example.com'),(9,'Isabella Nguyen','isabella@example.com'),(10,'Ethan Rivera','ethan@example.com'),(11,'Mia Thompson','mia@example.com'),(12,'Lucas Perez','lucas@example.com'),(13,'Amelia Martinez','amelia@example.com'),(14,'Harper Moore','harper@example.com'),(15,'Elijah Clark','elijah@example.com'),(16,'Aiden Hall','aiden@example.com'),(17,'Charlotte Lewis','charlotte@example.com'),(18,'Henry Young','henry@example.com'),(19,'Evelyn King','evelyn@example.com'),(20,'Jacob Scott','jacob@example.com');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `EID` int NOT NULL,
  `Wages` decimal(10,2) DEFAULT NULL,
  `Time_off` int DEFAULT NULL,
  `Employee_since` date DEFAULT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `Contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`EID`),
  KEY `fk_employee_manager` (`manager_id`),
  CONSTRAINT `fk_employee_manager` FOREIGN KEY (`manager_id`) REFERENCES `employee` (`EID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,26.50,10,'2021-05-12','M. Carter',NULL,'m.carter@company.com'),(2,28.00,12,'2020-08-01','S. Nguyen',NULL,'s.nguyen@company.com'),(3,27.25,8,'2019-11-03','J. Patel',NULL,'j.patel@company.com'),(4,18.00,5,'2023-01-10','K. Brown',1,'k.brown@company.com'),(5,17.75,4,'2023-03-18','A. Wilson',1,'a.wilson@company.com'),(6,19.25,6,'2022-09-07','R. Torres',2,'r.torres@company.com'),(7,18.75,5,'2022-10-21','E. Kim',2,'e.kim@company.com'),(8,17.25,3,'2024-02-02','D. White',3,'d.white@company.com'),(9,19.00,2,'2024-04-14','L. Adams',3,'l.adams@company.com'),(10,18.50,4,'2023-07-30','B. Flores',1,'b.flores@company.com'),(11,19.75,6,'2022-06-11','C. Murphy',2,'c.murphy@company.com'),(12,18.25,5,'2023-09-19','J. Green',1,'j.green@company.com'),(13,20.00,7,'2021-12-05','T. Rivera',2,'t.rivera@company.com'),(14,17.50,3,'2024-01-22','P. Brooks',3,'p.brooks@company.com'),(15,18.25,4,'2023-05-28','N. Price',1,'n.price@company.com'),(16,18.75,4,'2024-03-15','S. Patel',1,'s.patel@company.com'),(17,19.10,5,'2024-04-05','O. Bennett',2,'o.bennett@company.com'),(18,17.90,3,'2024-05-20','Y. Romero',2,'y.romero@company.com'),(19,18.40,4,'2024-06-10','G. Fisher',3,'g.fisher@company.com'),(20,19.60,6,'2024-07-01','H. Wang',3,'h.wang@company.com');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `Ing_ID` int NOT NULL,
  `item_name` varchar(100) NOT NULL,
  PRIMARY KEY (`Ing_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredients`
--

LOCK TABLES `ingredients` WRITE;
/*!40000 ALTER TABLE `ingredients` DISABLE KEYS */;
INSERT INTO `ingredients` VALUES (1,'Coffee Beans'),(2,'Milk'),(3,'Almond Milk'),(4,'Coconut Milk'),(5,'Soy Milk'),(6,'Oat Milk'),(7,'Chocolate Syrup'),(8,'Peppermint Syrup'),(9,'Gingerbread Syrup'),(10,'Nutella'),(11,'Marshmallow Syrup'),(12,'Espresso Shot'),(13,'Sugar'),(14,'Ice'),(15,'Croissant Dough'),(16,'Butter'),(17,'Eggs'),(18,'Pastry Dough'),(19,'Cocoa Powder'),(20,'Kataifi/Phyllo Shreds'),(21,'Sweet Cheese/Cream'),(22,'Rose/Orange Blossom Syrup'),(23,'Mango Pulp'),(24,'Strawberry Pulp'),(25,'Baklava Phyllo'),(26,'Pistachios/Walnuts'),(27,'Honey Syrup'),(28,'Mascarpone'),(29,'Blueberries'),(30,'Flour');
/*!40000 ALTER TABLE `ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `Inv_ID` int NOT NULL,
  `Temperature` decimal(6,2) DEFAULT NULL,
  `Storage_location` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Inv_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,4.00,'Fridge A'),(2,-18.00,'Freezer B'),(3,22.00,'Pantry C'),(4,4.00,'Fridge B'),(5,4.00,'Fridge C'),(6,-18.00,'Freezer C'),(7,-18.00,'Freezer D'),(8,22.00,'Pantry D'),(9,22.00,'Pantry E'),(10,5.00,'Walk-in Cooler'),(11,-20.00,'Deep Freezer'),(12,18.00,'Dry Storage A'),(13,18.00,'Dry Storage B'),(14,10.00,'Beverage Cooler'),(15,8.00,'Dessert Fridge'),(16,2.00,'Prep Fridge'),(17,22.00,'Spice Rack'),(18,22.00,'Back Pantry'),(19,0.00,'Ice Box'),(20,6.00,'Dairy Fridge');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `Inv_ID` int NOT NULL,
  `Ing_ID` int NOT NULL,
  PRIMARY KEY (`Inv_ID`,`Ing_ID`),
  KEY `fk_invitems_ing` (`Ing_ID`),
  CONSTRAINT `fk_invitems_ing` FOREIGN KEY (`Ing_ID`) REFERENCES `ingredients` (`Ing_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_invitems_inv` FOREIGN KEY (`Inv_ID`) REFERENCES `inventory` (`Inv_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
INSERT INTO `inventory_items` VALUES (1,1),(1,2),(4,2),(14,2),(16,2),(20,2),(1,3),(2,4),(1,6),(10,6),(1,7),(2,9),(1,10),(1,12),(1,13),(12,13),(13,13),(2,14),(11,14),(19,14),(1,15),(2,15),(3,16),(4,16),(3,17),(3,18),(8,19),(18,19),(3,20),(1,21),(5,21),(2,22),(17,22),(3,23),(3,24),(3,25),(6,26),(7,27),(15,28),(9,29),(9,30);
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu items`
--

DROP TABLE IF EXISTS `menu items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu items` (
  `M_ID` int NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`M_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu items`
--

LOCK TABLES `menu items` WRITE;
/*!40000 ALTER TABLE `menu items` DISABLE KEYS */;
INSERT INTO `menu items` VALUES (1,'Regular Coffee','Hot Drink',1.85),(2,'Espresso','Hot Drink',2.48),(3,'Cappuccino','Hot Drink',3.50),(4,'Latte','Hot Drink',3.75),(5,'Mocha','Hot Drink',4.00),(6,'Turkish Coffee','Hot Drink',3.25),(7,'Nutella Latte','Specialty',4.50),(8,'Campfire Latte','Specialty',4.50),(9,'Peppermint Mocha Latte','Seasonal',3.00),(10,'Ginger Bread Latte','Seasonal',3.00),(11,'Iced Coffee','Cold Drink',3.25),(12,'Mango Madness Smoothie','Smoothie',4.50),(13,'Strawberry Madness Smoothie','Smoothie',4.50),(14,'Breakfast Croissant','Breakfast',6.50),(15,'Breakfast Pastry','Breakfast',5.99),(16,'Chocolate Cup','Dessert',5.49),(17,'Kenafa Cup','Dessert',4.99),(18,'Baklava','Dessert',3.25),(19,'Tiramisu Cup','Dessert',5.95),(20,'Blueberry Muffin','Dessert',3.25);
/*!40000 ALTER TABLE `menu items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shifts` (
  `EID` int NOT NULL,
  `Start_Time` time NOT NULL,
  `End_Time` time NOT NULL,
  PRIMARY KEY (`EID`,`Start_Time`,`End_Time`),
  CONSTRAINT `fk_shift_employee` FOREIGN KEY (`EID`) REFERENCES `employee` (`EID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shifts`
--

LOCK TABLES `shifts` WRITE;
/*!40000 ALTER TABLE `shifts` DISABLE KEYS */;
INSERT INTO `shifts` VALUES (4,'09:00:00','17:00:00'),(4,'11:00:00','19:00:00'),(5,'10:00:00','18:00:00'),(5,'12:00:00','20:00:00'),(6,'12:00:00','20:00:00'),(6,'13:00:00','21:00:00'),(7,'08:00:00','16:00:00'),(7,'14:00:00','22:00:00'),(8,'08:00:00','16:00:00'),(8,'14:00:00','22:00:00'),(9,'07:00:00','15:00:00'),(9,'11:00:00','19:00:00'),(10,'07:00:00','15:00:00'),(10,'12:00:00','20:00:00'),(11,'09:00:00','17:00:00'),(11,'15:00:00','23:00:00'),(12,'16:00:00','00:00:00'),(13,'17:00:00','01:00:00'),(14,'09:00:00','17:00:00'),(15,'10:00:00','18:00:00');
/*!40000 ALTER TABLE `shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `EID` int NOT NULL,
  `Ing_ID` int NOT NULL,
  PRIMARY KEY (`EID`,`Ing_ID`),
  KEY `fk_stocks_ing` (`Ing_ID`),
  CONSTRAINT `fk_stocks_emp` FOREIGN KEY (`EID`) REFERENCES `employee` (`EID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stocks_ing` FOREIGN KEY (`Ing_ID`) REFERENCES `ingredients` (`Ing_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (4,1),(4,2),(8,3),(9,4),(10,5),(11,6),(5,7),(7,8),(6,10),(6,12),(12,13),(7,14),(8,19),(10,21),(9,22),(13,23),(14,24),(15,25),(11,28),(12,29);
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_items`
--

DROP TABLE IF EXISTS `transaction_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_items` (
  `txn_id` int NOT NULL,
  `M_ID` int NOT NULL,
  `Quantity` int NOT NULL,
  PRIMARY KEY (`txn_id`,`M_ID`),
  KEY `fk_ti_menu` (`M_ID`),
  CONSTRAINT `fk_ti_menu` FOREIGN KEY (`M_ID`) REFERENCES `menu items` (`M_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ti_txn` FOREIGN KEY (`txn_id`) REFERENCES `transactions` (`txn_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_items`
--

LOCK TABLES `transaction_items` WRITE;
/*!40000 ALTER TABLE `transaction_items` DISABLE KEYS */;
INSERT INTO `transaction_items` VALUES (1,1,2),(1,9,1),(2,2,1),(2,19,2),(3,5,1),(3,10,1),(3,20,1),(4,4,1),(4,11,2),(5,9,1),(5,15,1),(6,16,2),(7,17,1),(7,19,1),(8,10,2),(8,18,1),(9,3,1),(9,12,1),(10,2,1),(10,13,1),(11,1,1),(11,5,1),(11,14,1),(12,7,2),(13,8,2),(13,20,1),(14,12,1),(14,15,1),(15,9,1),(15,16,1),(16,17,2),(17,3,1),(17,10,1),(17,19,1),(18,4,1),(18,11,2),(19,18,1),(19,19,2),(20,1,1),(20,13,1),(20,14,1);
/*!40000 ALTER TABLE `transaction_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `txn_id` int NOT NULL,
  `CID` int DEFAULT NULL,
  PRIMARY KEY (`txn_id`),
  KEY `fk_txn_customer` (`CID`),
  CONSTRAINT `fk_txn_customer` FOREIGN KEY (`CID`) REFERENCES `customer` (`CID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10),(11,11),(12,12),(13,13),(14,14),(15,15),(16,16),(17,17),(18,18),(19,19),(20,20);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user account`
--

DROP TABLE IF EXISTS `user account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_account` (
  `EID` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `Access_level` varchar(50) NOT NULL,
  PRIMARY KEY (`EID`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `fk_useracct_employee` FOREIGN KEY (`EID`) REFERENCES `employee` (`EID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user account`
--

LOCK TABLES `user account` WRITE;
/*!40000 ALTER TABLE `user account` DISABLE KEYS */;
/* User accounts will be created through registration */
/*!40000 ALTER TABLE `user account` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

-- ------------------------------------------------------
-- Table structure for table `products`
-- ------------------------------------------------------

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

-- ------------------------------------------------------
-- Dumping data for table `products`
-- ------------------------------------------------------

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products`
  (`id`, `name`, `description`, `price`, `stock`, `created_at`)
VALUES
  (1, 'coffee', 'americano', 4.99, 3, '2025-10-24 00:45:13'),
  (2, 'lassi', 'mango drink', 4.99, 3, '2025-10-24 00:46:21');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 14:32:00
