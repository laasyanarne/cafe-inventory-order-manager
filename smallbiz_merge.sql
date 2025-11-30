-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: smallbiz
-- ------------------------------------------------------
-- Server version 8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
 /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
 /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 /*!50503 SET NAMES utf8mb4 */;
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
  CONSTRAINT `fk_contains_menu` FOREIGN KEY (`M_ID`) REFERENCES `menu_items` (`M_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 /*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contains`
--

LOCK TABLES `contains` WRITE;
/*!40000 ALTER TABLE `contains` DISABLE KEYS */;
INSERT INTO `contains` VALUES 
(1,1),(6,1),(11,1),
(3,2),(4,2),(5,2),(7,2),(8,2),(9,2),(10,2),
(5,7),(9,7),(16,7),
(9,8),
(10,9),
(7,10),
(8,11),
(2,12),(3,12),(4,12),(5,12),(7,12),(8,12),(9,12),(10,12),
(1,13),(6,13),(11,13),
(11,14),(12,14),(13,14),
(14,15),
(14,16),(15,16),(20,16),
(14,17),(15,17),(20,17),
(15,18),
(16,19),(19,19),
(17,20),(17,21),(17,22),
(12,23),
(13,24),
(18,25),(18,26),(18,27),
(19,28),
(20,29),(20,30);
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
INSERT INTO `customer` VALUES
(1,'Ava Patel','ava@example.com'),
(2,'Liam Chen','liam@example.com'),
(3,'Noah Davis','noah@example.com'),
(4,'Emma Johnson','emma@example.com'),
(5,'Olivia Garcia','olivia@example.com'),
(6,'Mason Wright','mason@example.com'),
(7,'Sophia Lee','sophia@example.com'),
(8,'James Walker','james@example.com'),
(9,'Isabella Nguyen','isabella@example.com'),
(10,'Ethan Rivera','ethan@example.com'),
(11,'Mia Thompson','mia@example.com'),
(12,'Lucas Perez','lucas@example.com'),
(13,'Amelia Martinez','amelia@example.com'),
(14,'Harper Moore','harper@example.com'),
(15,'Elijah Clark','elijah@example.com'),
(16,'Aiden Hall','aiden@example.com'),
(17,'Charlotte Lewis','charlotte@example.com'),
(18,'Henry Young','henry@example.com'),
(19,'Evelyn King','evelyn@example.com'),
(20,'Jacob Scott','jacob@example.com');
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
  KEY `fk_employee_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 /*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES
(30,35.00,5,'2025-11-17','Jacob Ryan',1,'jryan@gmail.com'),
(32,15.00,5,'2025-11-18','Alice Brown',30,'abrown@gmail.com'),
(33,50.00,5,'2025-11-18','Karmen George',30,'kgeorge@gmail.com'),
(34,20.00,10,'2025-11-18','Neha Bijoy',30,'nbijoy@gmail.com'),
(35,15.00,5,'2025-11-18','Amisha Adepu',30,'aadepu@gmail.com'),
(36,15.00,5,'2025-11-18','Laasya Narne',30,'lnarne@gmail.com'),
(37,15.00,5,'2025-11-18','Maitri Pathak',30,'mpathak@gmail.com'),
(38,15.00,5,'2025-11-18','Dohhyun Oh',30,'doh@gmail.com');
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
INSERT INTO `ingredients` VALUES
(1,'Coffee Beans'),
(2,'Milk'),
(3,'Almond Milk'),
(4,'Coconut Milk'),
(5,'Soy Milk'),
(6,'Oat Milk'),
(7,'Chocolate Syrup'),
(8,'Peppermint Syrup'),
(9,'Gingerbread Syrup'),
(10,'Nutella'),
(11,'Marshmallow Syrup'),
(12,'Espresso Shot'),
(13,'Sugar'),
(14,'Ice'),
(15,'Croissant Dough'),
(16,'Butter'),
(17,'Eggs'),
(18,'Pastry Dough'),
(19,'Cocoa Powder'),
(20,'Kataifi/Phyllo Shreds'),
(21,'Sweet Cheese/Cream'),
(22,'Rose/Orange Blossom Syrup'),
(23,'Mango Pulp'),
(24,'Strawberry Pulp'),
(25,'Baklava Phyllo'),
(26,'Pistachios/Walnuts'),
(27,'Honey Syrup'),
(28,'Mascarpone'),
(29,'Blueberries'),
(30,'Flour');
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
INSERT INTO `inventory` VALUES
(1,4.00,'Fridge A'),
(2,-18.00,'Freezer B'),
(3,22.00,'Pantry C'),
(4,4.00,'Fridge B'),
(5,4.00,'Fridge C'),
(6,-18.00,'Freezer C'),
(7,-18.00,'Freezer D'),
(8,22.00,'Pantry D'),
(9,22.00,'Pantry E'),
(10,5.00,'Walk-in Cooler'),
(11,-20.00,'Deep Freezer'),
(12,18.00,'Dry Storage A'),
(13,18.00,'Dry Storage B'),
(14,10.00,'Beverage Cooler'),
(15,8.00,'Dessert Fridge'),
(16,2.00,'Prep Fridge'),
(17,22.00,'Spice Rack'),
(18,22.00,'Back Pantry'),
(19,0.00,'Ice Box'),
(20,6.00,'Dairy Fridge');
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
INSERT INTO `inventory_items` VALUES
(1,1),
(1,2),
(4,2),
(14,2),
(16,2),
(20,2),
(1,3),
(2,4),
(1,6),
(10,6),
(1,7),
(2,9),
(1,10),
(1,12),
(1,13),
(12,13),
(13,13),
(2,14),
(11,14),
(19,14),
(1,15),
(2,15),
(3,16),
(4,16),
(3,17),
(3,18),
(8,19),
(18,19),
(3,20),
(1,21),
(5,21),
(2,22),
(17,22),
(3,23),
(3,24),
(3,25),
(6,26),
(7,27),
(15,28),
(9,29),
(9,30);
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 /*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `M_ID` int NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`M_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 /*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--
a
LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES
(1,'Regular Coffee','Hot Drink',1.85),
(2,'Espresso','Hot Drink',2.48),
(3,'Cappuccino','Hot Drink',3.50),
(4,'Latte','Hot Drink',3.75),
(5,'Mocha','Hot Drink',4.00),
(6,'Turkish Coffee','Hot Drink',3.25),
(7,'Nutella Latte','Specialty',4.50),
(8,'Campfire Latte','Specialty',4.50),
(9,'Peppermint Mocha Latte','Seasonal',3.00),
(10,'Ginger Bread Latte','Seasonal',3.00),
(11,'Iced Coffee','Cold Drink',3.25),
(12,'Mango Madness Smoothie','Smoothie',4.50),
(13,'Strawberry Madness Smoothie','Smoothie',4.50),
(14,'Breakfast Croissant','Breakfast',6.50),
(15,'Breakfast Pastry','Breakfast',5.99),
(16,'Chocolate Cup','Dessert',5.49),
(17,'Kenafa Cup','Dessert',4.99),
(18,'Baklava','Dessert',3.25),
(19,'Tiramisu Cup','Dessert',5.95),
(20,'Blueberry Muffin','Dessert',3.25);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 /*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
(1,'hot chocolate','hot drink',4.99,3,'2025-10-24 00:45:13'),
(2,'lassi','mango drink',4.99,3,'2025-10-24 00:46:21'),
(4,'ice cream','creamy dessert',5.00,6,'2025-11-14 03:32:16'),
(6,'smoothie','fruit drink',4.87,3,'2025-11-14 09:29:54'),
(7,'halva','middle eastern snack',4.00,3,'2025-11-14 09:30:29'),
(8,'water','drink',3.00,4,'2025-11-14 09:30:45'),
(9,'lemonade','citrus drink',3.00,4,'2025-11-14 09:31:13'),
(10,'watermelon','fruit',2.00,4,'2025-11-14 09:31:22'),
(11,'cake','red velvet cake',6.00,4,'2025-11-14 09:32:00'),
(12,'sandwich','blt',5.00,3,'2025-11-14 09:32:33'),
(13,'chips','lays',2.00,5,'2025-11-14 09:33:30'),
(14,'blueberry muffin','customer favorite',6.00,3,'2025-11-14 09:34:10'),
(15,'cookies','chocolate chip',3.00,7,'2025-11-14 09:34:32'),
(16,'bagel','seasme',3.00,6,'2025-11-14 09:34:50'),
(17,'croissants','pastry',3.00,10,'2025-11-14 09:35:16'),
(18,'cinnamon roll','sweet dessert',4.00,9,'2025-11-14 09:36:30'),
(19,'donuts','glazed',2.00,5,'2025-11-14 09:36:43'),
(20,'soup','broccoli cheddar',9.99,4,'2025-11-14 09:37:07'),
(21,'parfaits','blueberry and strawberry topped with granola',4.00,0,'2025-11-14 09:38:04'),
(22,'avacado toast','topped with chilli pepper flakes',4.00,3,'2025-11-14 09:38:54'),
(23,'apple','granny smith',1.00,3,'2025-11-14 09:39:17');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
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
INSERT INTO `transactions` VALUES
(1,1),
(2,2),
(3,3),
(4,4),
(5,5),
(6,6),
(7,7),
(8,8),
(9,9),
(10,10),
(11,11),
(12,12),
(13,13),
(14,14),
(15,15),
(16,16),
(17,17),
(18,18),
(19,19),
(20,20);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
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
  CONSTRAINT `fk_ti_menu` FOREIGN KEY (`M_ID`) REFERENCES `menu_items` (`M_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ti_txn` FOREIGN KEY (`txn_id`) REFERENCES `transactions` (`txn_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 /*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_items`
--

LOCK TABLES `transaction_items` WRITE;
/*!40000 ALTER TABLE `transaction_items` DISABLE KEYS */;
INSERT INTO `transaction_items` VALUES
(1,1,2),
(1,9,1),
(2,2,1),
(2,19,2),
(3,5,1),
(3,10,1),
(3,20,1),
(4,4,1),
(4,11,2),
(5,9,1),
(5,15,1),
(6,16,2),
(7,17,1),
(7,19,1),
(8,10,2),
(8,18,1),
(9,3,1),
(9,12,1),
(10,2,1),
(10,13,1),
(11,1,1),
(11,5,1),
(11,14,1),
(12,7,2),
(13,8,2),
(13,20,1),
(14,12,1),
(14,15,1),
(15,9,1),
(15,16,1),
(16,17,2),
(17,3,1),
(17,10,1),
(17,19,1),
(18,4,1),
(18,11,2),
(19,18,1),
(19,19,2),
(20,1,1),
(20,13,1),
(20,14,1);
/*!40000 ALTER TABLE `transaction_items` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `user_account`
--

DROP TABLE IF EXISTS `user_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 /*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_account` (
  `EID` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `Access_level` varchar(50) NOT NULL,
  PRIMARY KEY (`EID`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 /*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_account`
--  (Your data only — teammate rows ignored)
--

LOCK TABLES `user_account` WRITE;
/*!40000 ALTER TABLE `user_account` DISABLE KEYS */;
INSERT INTO `user_account` VALUES
(30,'jryan@gmail.com','$2b$12$wcu3djZXbjeKuQvIElRMiu7VyH339KssIjZaP2w2qrGhkqkYEc/ZS','manager'),
(32,'abrown@gmail.com','$2b$12$8WprHP1HyXj56779lYzYD.W1GrkNDlAWw7E7.8QDrdNISBYwTyYXa','employee'),
(33,'kgeorge@gmail.com','$2b$12$t9DUxsoaFyuy/640ctCEI.peMEr1mkd9fkLrMVyBfM7KUnt1SQmkG','manager'),
(34,'nbijoy@gmail.com','$2b$12$W7drWg7kvpszyEz21Lf9c.hTfb1I4Jiaobgej9kz5SGGakQLvKT3m','employee'),
(35,'aadepu@gmail.com','$2b$12$LftxQE1C.UuZbu5mKFJr0ONlUV9njrqIfp7pLUauEe5ynUzERlANq','employee'),
(36,'lnarne@gmail.com','$2b$12$p0BgXCSPq8.BP4KN.QfmVuZ4DbMg36ZQfJ4/6hFLiwDUzCKx5v4Da','employee'),
(37,'mpathak@gmail.com','$2b$12$wxzVThEKdPN4kf3xs6j8.Op2q.CvFdxNNwmdE/8BmytJoUAwr.zZq','employee'),
(38,'doh@gmail.com','$2b$12$eQ0LrkqzDqm.yRq/o6SQkuRmTKFwRdX.yWWhXcBgELlbPiIAvbIXu','employee');
/*!40000 ALTER TABLE `user_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Restore SQL settings
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
 /*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
 /*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
 /*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
 /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
 /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
 /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
 /*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed Unified File
