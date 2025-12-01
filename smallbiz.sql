-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Nov 25, 2025 at 11:52 PM
-- Server version: 8.0.44
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smallbiz`
--

-- --------------------------------------------------------

--
-- Table structure for table `contains`
--

CREATE TABLE `contains` (
  `M_ID` int NOT NULL,
  `Ing_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `contains`
--

INSERT INTO `contains` (`M_ID`, `Ing_ID`) VALUES
(1, 1),
(6, 1),
(11, 1),
(3, 2),
(4, 2),
(5, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(5, 7),
(9, 7),
(16, 7),
(9, 8),
(10, 9),
(7, 10),
(8, 11),
(2, 12),
(3, 12),
(4, 12),
(5, 12),
(7, 12),
(8, 12),
(9, 12),
(10, 12),
(1, 13),
(6, 13),
(11, 13),
(11, 14),
(12, 14),
(13, 14),
(14, 15),
(14, 16),
(15, 16),
(20, 16),
(14, 17),
(15, 17),
(20, 17),
(15, 18),
(16, 19),
(19, 19),
(17, 20),
(17, 21),
(17, 22),
(12, 23),
(13, 24),
(18, 25),
(18, 26),
(18, 27),
(19, 28),
(20, 29),
(20, 30);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CID` int NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Contact` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`CID`, `Name`, `Contact`) VALUES
(1, 'Ava Patel', 'ava@example.com'),
(2, 'Liam Chen', 'liam@example.com'),
(3, 'Noah Davis', 'noah@example.com'),
(4, 'Emma Johnson', 'emma@example.com'),
(5, 'Olivia Garcia', 'olivia@example.com'),
(6, 'Mason Wright', 'mason@example.com'),
(7, 'Sophia Lee', 'sophia@example.com'),
(8, 'James Walker', 'james@example.com'),
(9, 'Isabella Nguyen', 'isabella@example.com'),
(10, 'Ethan Rivera', 'ethan@example.com'),
(11, 'Mia Thompson', 'mia@example.com'),
(12, 'Lucas Perez', 'lucas@example.com'),
(13, 'Amelia Martinez', 'amelia@example.com'),
(14, 'Harper Moore', 'harper@example.com'),
(15, 'Elijah Clark', 'elijah@example.com'),
(16, 'Aiden Hall', 'aiden@example.com'),
(17, 'Charlotte Lewis', 'charlotte@example.com'),
(18, 'Henry Young', 'henry@example.com'),
(19, 'Evelyn King', 'evelyn@example.com'),
(20, 'Jacob Scott', 'jacob@example.com');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `EID` int NOT NULL,
  `Wages` decimal(10,2) DEFAULT NULL,
  `Time_off` int DEFAULT NULL,
  `Employee_since` date DEFAULT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `Contact` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`EID`, `Wages`, `Time_off`, `Employee_since`, `Name`, `manager_id`, `Contact`) VALUES
(30, 35.00, 5, '2025-11-17', 'Jacob Ryan', 1, 'jryan@gmail.com'),
(32, 15.00, 5, '2025-11-18', 'Alice Brown', 30, 'abrown@gmail.com'),
(33, 50.00, 5, '2025-11-18', 'Karmen George', 30, 'kgeorge@gmail.com'),
(34, 20.00, 10, '2025-11-18', 'Neha Bijoy', 30, 'nbijoy@gmail.com'),
(35, 15.00, 5, '2025-11-18', 'Amisha Adepu', 30, 'aadepu@gmail.com'),
(36, 15.00, 5, '2025-11-18', 'Laasya Narne', 30, 'lnarne@gmail.com'),
(37, 15.00, 5, '2025-11-18', 'Maitri Pathak', 30, 'mpathak@gmail.com'),
(38, 15.00, 5, '2025-11-18', 'Dohhyun Oh', 30, 'doh@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `Ing_ID` int NOT NULL,
  `item_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`Ing_ID`, `item_name`) VALUES
(1, 'Coffee Beans'),
(2, 'Milk'),
(3, 'Almond Milk'),
(4, 'Coconut Milk'),
(5, 'Soy Milk'),
(6, 'Oat Milk'),
(7, 'Chocolate Syrup'),
(8, 'Peppermint Syrup'),
(9, 'Gingerbread Syrup'),
(10, 'Nutella'),
(11, 'Marshmallow Syrup'),
(12, 'Espresso Shot'),
(13, 'Sugar'),
(14, 'Ice'),
(15, 'Croissant Dough'),
(16, 'Butter'),
(17, 'Eggs'),
(18, 'Pastry Dough'),
(19, 'Cocoa Powder'),
(20, 'Kataifi/Phyllo Shreds'),
(21, 'Sweet Cheese/Cream'),
(22, 'Rose/Orange Blossom Syrup'),
(23, 'Mango Pulp'),
(24, 'Strawberry Pulp'),
(25, 'Baklava Phyllo'),
(26, 'Pistachios/Walnuts'),
(27, 'Honey Syrup'),
(28, 'Mascarpone'),
(29, 'Blueberries'),
(30, 'Flour'),
(31, 'Earl Grey Tea'),
(32, 'Black Tea'),
(33, 'Chai Concentrate'),
(34, 'Matcha Powder'),
(35, 'Taro Powder'),
(36, 'Turmeric Powder'),
(37, 'Pumpkin Sauce'),
(38, 'Vanilla Syrup'),
(39, 'Caramel Syrup'),
(40, 'Brown Sugar Syrup'),
(41, 'Lavender Syrup'),
(42, 'Elderflower Syrup'),
(43, 'Honey'),
(44, 'Blueberry Syrup'),
(45, 'Strawberry Syrup'),
(46, 'Raspberry Syrup'),
(47, 'Watermelon Juice'),
(48, 'Thai Tea Base'),
(49, 'Cold Brew Concentrate'),
(50, 'Date Syrup'),
(51, 'Pistachio Sauce'),
(52, 'Cookie Butter'),
(53, 'Coconut Flakes'),
(54, 'Black Sesame Paste'),
(55, 'Ice Cream'),
(56, 'Sparkling Water'),
(57, 'Orange Soda'),
(58, 'Apricot Syrup'),
(59, 'Almond Syrup'),
(60, 'Tamarind Syrup'),
(61, 'Cardamom'),
(62, 'Sahlab Mix'),
(63, 'cherry syrup'),
(64, 'Cream Cheese'),
(65, 'Granola'),
(66, 'Yogurt'),
(67, 'Waffle Mix'),
(68, 'Maple Syrup'),
(69, 'Chicken Breast'),
(70, 'Cheddar Cheese'),
(71, 'Tomato'),
(72, 'Lettuce'),
(73, 'Fresh Berries'),
(74, 'Avocado'),
(75, 'Olive Oil'),
(76, 'Chili Flakes'),
(77, 'Cream Cheese Filling'),
(78, 'Banana Bread Mix'),
(79, 'Chocolate Chips'),
(80, 'Oats'),
(81, 'Whole Dates'),
(82, 'Whipped Cream'),
(83, 'Powdered Sugar'),
(84, 'Lemon Juice'),
(85, 'Lime Juice'),
(86, 'Fresh Mint');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `Inv_ID` int NOT NULL,
  `Temperature` decimal(6,2) DEFAULT NULL,
  `Storage_location` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`Inv_ID`, `Temperature`, `Storage_location`) VALUES
(1, 4.00, 'Fridge A'),
(2, -18.00, 'Freezer B'),
(3, 22.00, 'Pantry C'),
(4, 4.00, 'Fridge B'),
(5, 4.00, 'Fridge C'),
(6, -18.00, 'Freezer C'),
(7, -18.00, 'Freezer D'),
(8, 22.00, 'Pantry D'),
(9, 22.00, 'Pantry E'),
(10, 5.00, 'Walk-in Cooler'),
(11, -20.00, 'Deep Freezer'),
(12, 18.00, 'Dry Storage A'),
(13, 18.00, 'Dry Storage B'),
(14, 10.00, 'Beverage Cooler'),
(15, 8.00, 'Dessert Fridge'),
(16, 2.00, 'Prep Fridge'),
(17, 22.00, 'Spice Rack'),
(18, 22.00, 'Back Pantry'),
(19, 0.00, 'Ice Box'),
(20, 6.00, 'Dairy Fridge');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

CREATE TABLE `inventory_items` (
  `Inv_ID` int NOT NULL,
  `Ing_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`Inv_ID`, `Ing_ID`) VALUES
(1, 1),
(1, 2),
(4, 2),
(14, 2),
(16, 2),
(20, 2),
(1, 3),
(2, 4),
(1, 6),
(10, 6),
(1, 7),
(2, 9),
(1, 10),
(1, 12),
(1, 13),
(12, 13),
(13, 13),
(2, 14),
(11, 14),
(19, 14),
(1, 15),
(2, 15),
(3, 16),
(4, 16),
(3, 17),
(3, 18),
(8, 19),
(18, 19),
(3, 20),
(1, 21),
(5, 21),
(2, 22),
(17, 22),
(3, 23),
(3, 24),
(3, 25),
(6, 26),
(7, 27),
(15, 28),
(9, 29),
(9, 30);

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `M_ID` int NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`M_ID`, `item_name`, `Category`, `Price`) VALUES
(1, 'Regular Coffee', 'Hot Drink', 1.85),
(2, 'Espresso', 'Hot Drink', 2.48),
(3, 'Cappuccino', 'Hot Drink', 3.50),
(4, 'Latte', 'Hot Drink', 3.75),
(5, 'Mocha', 'Hot Drink', 4.00),
(6, 'Turkish Coffee', 'Hot Drink', 3.25),
(7, 'Nutella Latte', 'Specialty', 4.50),
(8, 'Campfire Latte', 'Specialty', 4.50),
(9, 'Peppermint Mocha Latte', 'Seasonal', 3.00),
(10, 'Ginger Bread Latte', 'Seasonal', 3.00),
(11, 'Iced Coffee', 'Cold Drink', 3.25),
(12, 'Mango Madness Smoothie', 'Smoothie', 4.50),
(13, 'Strawberry Madness Smoothie', 'Smoothie', 4.50),
(14, 'Breakfast Croissant', 'Breakfast', 6.50),
(15, 'Breakfast Pastry', 'Breakfast', 5.99),
(16, 'Chocolate Cup', 'Dessert', 5.49),
(17, 'Kenafa Cup', 'Dessert', 4.99),
(18, 'Baklava', 'Dessert', 3.25),
(19, 'Tiramisu Cup', 'Dessert', 5.95),
(20, 'Blueberry Muffin', 'Dessert', 3.25);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `created_at`) VALUES
(1, 'hot chocolate', 'hot drink', 4.99, 3, '2025-10-24 00:45:13'),
(2, 'lassi', 'mango drink', 4.99, 3, '2025-10-24 00:46:21'),
(4, 'ice cream', 'creamy dessert', 5.00, 6, '2025-11-14 03:32:16'),
(6, 'smoothie', 'fruit drink', 4.87, 3, '2025-11-14 09:29:54'),
(7, 'halva', 'middle eastern snack', 4.00, 3, '2025-11-14 09:30:29'),
(8, 'water', 'drink', 3.00, 4, '2025-11-14 09:30:45'),
(9, 'lemonade', 'citrus drink', 3.00, 4, '2025-11-14 09:31:13'),
(10, 'watermelon', 'fruit', 2.00, 4, '2025-11-14 09:31:22'),
(11, 'cake', 'red velvet cake', 6.00, 4, '2025-11-14 09:32:00'),
(12, 'sandwich', 'blt', 5.00, 3, '2025-11-14 09:32:33'),
(13, 'chips', 'lays', 2.00, 5, '2025-11-14 09:33:30'),
(14, 'blueberry muffin', 'customer favorite', 6.00, 3, '2025-11-14 09:34:10'),
(15, 'cookies', 'chocolate chip', 3.00, 7, '2025-11-14 09:34:32'),
(16, 'bagel', 'seasme', 3.00, 6, '2025-11-14 09:34:50'),
(17, 'croissants', 'pastry', 3.00, 10, '2025-11-14 09:35:16'),
(18, 'cinnamon roll', 'sweet dessert', 4.00, 9, '2025-11-14 09:36:30'),
(19, 'donuts', 'glazed', 2.00, 5, '2025-11-14 09:36:43'),
(20, 'soup', 'broccoli cheddar', 9.99, 4, '2025-11-14 09:37:07'),
(21, 'parfaits', 'blueberry and strawberry topped with granola', 4.00, 0, '2025-11-14 09:38:04'),
(22, 'avacado toast', 'topped with chilli pepper flakes', 4.00, 3, '2025-11-14 09:38:54'),
(23, 'apple', 'granny smith', 1.00, 3, '2025-11-14 09:39:17'),
(29, 'House Brew', 'Freshly brewed house drip coffee.', 3.25, 40, '2025-11-21 02:10:30'),
(30, 'Americano', 'Espresso diluted with hot water for a bold, smooth cup.', 3.75, 35, '2025-11-21 02:10:30'),
(31, 'Cafe Latte', 'Creamy espresso drink with plenty of steamed milk.', 4.75, 35, '2025-11-21 02:10:30'),
(32, 'Caramel Macchiato', 'Layered espresso drink with vanilla and caramel drizzle.', 5.25, 30, '2025-11-21 02:10:30'),
(33, 'Chai Latte', 'Spiced black tea blended with steamed milk.', 4.75, 30, '2025-11-21 02:10:30'),
(34, 'London Fog Latte', 'Earl Grey tea with steamed milk and vanilla.', 4.75, 30, '2025-11-21 02:10:30'),
(35, 'Korean Citrus Tea', 'Warm citrus tea with marmalade style fruit and peel.', 4.75, 25, '2025-11-21 02:10:30'),
(36, 'Breve', 'Rich espresso drink made with steamed half and half.', 4.75, 25, '2025-11-21 02:10:30'),
(37, 'Hot Tea', 'Classic hot tea in a variety of blends.', 3.50, 40, '2025-11-21 02:10:30'),
(38, 'Hot Chocolate', 'Steamed milk blended with rich cocoa.', 4.00, 35, '2025-11-21 02:10:30'),
(39, 'Matcha Latte', 'Japanese green tea powder whisked with milk.', 5.00, 30, '2025-11-21 02:10:30'),
(40, 'Taro Latte', 'Creamy latte flavored with sweet taro.', 4.75, 28, '2025-11-21 02:10:30'),
(41, 'Golden Match Mountain', 'Matcha latte with warming turmeric and spices.', 5.25, 25, '2025-11-21 02:10:30'),
(42, 'Turmeric Mountain', 'Turmeric latte with warming spices and steamed milk.', 5.25, 25, '2025-11-21 02:10:30'),
(43, 'Espresso Shot', 'Concentrated shot of rich espresso.', 2.50, 60, '2025-11-21 02:10:30'),
(44, 'Cortado', 'Equal parts espresso and steamed milk for a balanced sip.', 3.75, 35, '2025-11-21 02:10:30'),
(45, 'Flat White', 'Velvety microfoam poured over smooth espresso.', 4.75, 30, '2025-11-21 02:10:30'),
(46, 'Hot Lebanese Latte', 'Warm latte inspired by Lebanese flavors of rose and pistachio.', 5.25, 28, '2025-11-21 02:10:30'),
(47, 'Iced Lebanese Latte', 'Iced latte with Lebanese style rose and pistachio flavors.', 5.25, 26, '2025-11-21 02:10:30'),
(48, 'Hot Pistachio Latte', 'Steamed milk and espresso blended with pistachio syrup.', 5.50, 28, '2025-11-21 02:10:30'),
(49, 'Iced Pistachio Latte', 'Chilled pistachio latte served over ice.', 5.50, 26, '2025-11-21 02:10:30'),
(50, 'Hot Rose Latte', 'Fragrant rose flavored latte with steamed milk.', 5.25, 25, '2025-11-21 02:10:30'),
(51, 'Iced Rose Latte', 'Delicately floral rose latte served on ice.', 5.25, 23, '2025-11-21 02:10:30'),
(52, 'Hot Arabic Date Latte', 'Latte sweetened with rich date syrup.', 5.25, 25, '2025-11-21 02:10:30'),
(53, 'Iced Arabic Date Latte', 'Iced latte sweetened with smooth date syrup.', 5.25, 23, '2025-11-21 02:10:30'),
(54, 'Turkish Coffee', 'Traditional finely ground coffee simmered in a cezve.', 4.25, 30, '2025-11-21 02:10:30'),
(55, 'Arabic Coffee', 'Lightly spiced Arabic style coffee served in small cups.', 4.25, 30, '2025-11-21 02:10:30'),
(56, 'Arabian Karak Tea', 'Strong black tea simmered with milk and spices.', 4.50, 28, '2025-11-21 02:10:30'),
(57, 'Sahlab', 'Thick, creamy pudding style hot drink with milk and starch.', 5.50, 18, '2025-11-21 02:10:30'),
(58, 'Hot Halva Latte', 'Warm latte flavored with black sesame and pistachio halva.', 5.50, 25, '2025-11-21 02:10:30'),
(59, 'Iced Halva Latte', 'Chilled halva flavored latte poured over ice.', 5.50, 23, '2025-11-21 02:10:30'),
(60, 'Hot Habibi Latte', 'Pistachio and honey latte with steamed milk.', 5.50, 25, '2025-11-21 02:10:30'),
(61, 'Iced Habibi Latte', 'Iced latte with pistachio and honey sweetness.', 5.50, 23, '2025-11-21 02:10:30'),
(62, 'Hot Nutella Latte', 'Chocolate hazelnut latte made with Nutella.', 5.50, 28, '2025-11-21 02:10:30'),
(63, 'Iced Nutella Latte', 'Iced latte blended with Nutella for a chocolate hazelnut treat.', 5.50, 26, '2025-11-21 02:10:30'),
(64, 'Hot Turkish Coffee Latte', 'Latte infused with the bold flavor of Turkish coffee.', 5.50, 25, '2025-11-21 02:10:30'),
(65, 'Iced Turkish Coffee Latte', 'Iced latte with strong Turkish coffee notes.', 5.50, 23, '2025-11-21 02:10:30'),
(66, 'Hot Mexican Choco Latte', 'Mocha latte with brown sugar and cinnamon.', 5.50, 25, '2025-11-21 02:10:30'),
(67, 'Iced Mexican Choco Latte', 'Iced mocha latte with cinnamon and brown sugar.', 5.50, 23, '2025-11-21 02:10:30'),
(68, 'Hot Biscoff Latte', 'Latte flavored with cookie butter and warm spices.', 5.50, 25, '2025-11-21 02:10:30'),
(69, 'Iced Biscoff Latte', 'Iced latte blended with Biscoff cookie butter.', 5.50, 23, '2025-11-21 02:10:30'),
(70, 'Salted Vanilla Pumpkin Shaken Espresso', 'Espresso shaken with pumpkin, vanilla and a hint of salt.', 5.75, 24, '2025-11-21 02:10:30'),
(71, 'Hot Salted Vanilla Chai', 'Chai latte finished with salted vanilla sweetness.', 5.25, 25, '2025-11-21 02:10:30'),
(72, 'Iced Salted Vanilla Chai', 'Iced chai latte with salted vanilla syrup.', 5.25, 23, '2025-11-21 02:10:30'),
(73, 'Hot Bourbon Caramel Chai', 'Chai latte with rich bourbon caramel flavor, non alcoholic.', 5.50, 24, '2025-11-21 02:10:30'),
(74, 'Iced Bourbon Caramel Chai', 'Iced chai latte with smooth bourbon caramel flavor.', 5.50, 22, '2025-11-21 02:10:30'),
(75, 'Honey Soda Matcha', 'Sparkling matcha drink lightly sweetened with honey.', 5.50, 22, '2025-11-21 02:10:30'),
(76, 'Orange Soda Espresso', 'Bright orange soda poured over a shot of espresso.', 5.00, 20, '2025-11-21 02:10:30'),
(77, 'Floral Iced Tea Elderflower', 'Iced tea infused with light elderflower syrup.', 4.75, 26, '2025-11-21 02:10:30'),
(78, 'Floral Iced Tea Lavender', 'Iced tea flavored with soothing lavender.', 4.75, 26, '2025-11-21 02:10:30'),
(79, 'Floral Iced Lemonade Elderflower', 'Refreshing lemonade sweetened with elderflower.', 4.75, 26, '2025-11-21 02:10:30'),
(80, 'Floral Iced Lemonade Lavender', 'Lemonade infused with aromatic lavender.', 4.75, 26, '2025-11-21 02:10:30'),
(81, 'Hot Campfire Latte', 'Toasted marshmallow mocha latte served warm.', 5.50, 25, '2025-11-21 02:10:30'),
(82, 'Iced Campfire Latte', 'Iced mocha latte with toasted marshmallow flavor.', 5.50, 23, '2025-11-21 02:10:30'),
(83, 'Hot Red Velvet Latte', 'Cocoa based latte inspired by red velvet cake.', 5.50, 24, '2025-11-21 02:10:30'),
(84, 'Iced Red Velvet Latte', 'Iced latte with red velvet style chocolate flavor.', 5.50, 22, '2025-11-21 02:10:30'),
(85, 'Espresso Con Panna', 'Single or double espresso topped with whipped cream.', 4.25, 30, '2025-11-21 02:10:30'),
(86, 'Hot German Choco Latte', 'Mocha latte with coconut and chocolate notes.', 5.50, 24, '2025-11-21 02:10:30'),
(87, 'Iced German Choco Latte', 'Iced mocha latte inspired by German chocolate cake.', 5.50, 22, '2025-11-21 02:10:30'),
(88, 'Hot Lavender Honey Latte', 'Latte flavored with floral lavender and honey.', 5.25, 24, '2025-11-21 02:10:30'),
(89, 'Iced Lavender Honey Latte', 'Iced latte with lavender and honey sweetness.', 5.25, 22, '2025-11-21 02:10:30'),
(90, 'Iced Coffee Soda', 'Cold brew topped with sparkling water for a fizzy coffee.', 5.00, 24, '2025-11-21 02:10:30'),
(91, 'Hot Blueberry Matcha', 'Matcha latte blended with blueberry flavor.', 5.25, 24, '2025-11-21 02:10:30'),
(92, 'Iced Blueberry Matcha', 'Iced matcha latte with blueberry notes.', 5.25, 22, '2025-11-21 02:10:30'),
(93, 'Summer Berry Lemonade', 'Lemonade flavored with raspberry and strawberry.', 4.75, 30, '2025-11-21 02:10:30'),
(94, 'Watermelon Lemonade', 'Bright, refreshing lemonade made with watermelon.', 4.75, 30, '2025-11-21 02:10:30'),
(102, 'Cold Brew', 'Slow steeped cold brew coffee served over ice.', 4.75, 35, '2025-11-21 02:11:38'),
(103, 'Iced Americano', 'Espresso topped with cold water and ice.', 3.75, 30, '2025-11-21 02:11:38'),
(104, 'Iced Latte', 'Chilled espresso and milk served over ice.', 4.75, 32, '2025-11-21 02:11:38'),
(105, 'Iced Caramel Macchiato', 'Layered iced latte with vanilla and caramel.', 5.25, 30, '2025-11-21 02:11:38'),
(106, 'Iced Chai Latte', 'Spiced chai tea blended with cold milk over ice.', 4.75, 30, '2025-11-21 02:11:38'),
(107, 'Iced London Fog Latte', 'Iced Earl Grey tea with milk and vanilla.', 4.75, 28, '2025-11-21 02:11:38'),
(108, 'Iced Korean Citrus Tea', 'Iced citrus marmalade tea with fruit pieces.', 4.75, 28, '2025-11-21 02:11:38'),
(109, 'Iced Matcha', 'Iced matcha latte made with green tea powder.', 5.00, 30, '2025-11-21 02:11:38'),
(110, 'Iced Taro', 'Iced latte flavored with sweet taro.', 4.75, 28, '2025-11-21 02:11:38'),
(111, 'Iced Thai Tea', 'Sweet Thai tea with milk over ice.', 4.75, 30, '2025-11-21 02:11:38'),
(112, 'Iced Golden Matcha Mountain', 'Iced golden matcha drink with turmeric.', 5.25, 25, '2025-11-21 02:11:38'),
(113, 'Iced Turmeric Latte', 'Iced turmeric latte with spices and milk.', 5.25, 25, '2025-11-21 02:11:38'),
(114, 'Arabic Sharbat Apricot', 'Sweet apricot syrup drink served with water and ice.', 4.50, 25, '2025-11-21 02:12:46'),
(115, 'Arabic Sharbat Almond', 'Almond flavored syrup drink over ice.', 4.50, 25, '2025-11-21 02:12:46'),
(116, 'Arabic Sharbat Date', 'Date syrup sharbat mixed with cold water and ice.', 4.50, 25, '2025-11-21 02:12:46'),
(117, 'Arabic Sharbat Tamarind', 'Tamarind sharbat with a tangy, refreshing taste.', 4.50, 25, '2025-11-21 02:12:46'),
(118, 'Arabic Sharbat Rose', 'Rose scented sharbat served cold over ice.', 4.50, 25, '2025-11-21 02:12:46'),
(119, 'Affogato', 'Shot of hot espresso poured over a scoop of ice cream.', 5.50, 18, '2025-11-21 02:12:46'),
(120, 'Fruit Smoothie', 'Blended fruit smoothie with your choice of fruit and milk.', 6.25, 25, '2025-11-21 02:12:57'),
(121, 'Yogurt Fruit Smoothie', 'Creamy yogurt based smoothie with mixed fruit.', 6.75, 25, '2025-11-21 02:12:57'),
(122, 'Breakfast Smoothie', 'Smoothie with oats, chocolate chips, dates and honey.', 6.75, 22, '2025-11-21 02:12:57'),
(123, 'Egyptian Coconut Smoothie', 'Rich coconut smoothie inspired by Egyptian flavors.', 6.50, 22, '2025-11-21 02:12:57'),
(124, 'Croissant Sandwich', 'Flaky croissant sandwich with savory breakfast fillings.', 7.25, 15, '2025-11-25 22:29:24'),
(125, 'Quiche', 'Savory baked egg pie with cheese and vegetables.', 6.99, 12, '2025-11-25 22:29:24'),
(126, 'Savory Pastry', 'Buttery pastry filled with cheese and herbs.', 5.99, 18, '2025-11-25 22:29:24'),
(127, 'Bagel with Cream Cheese', 'Toasted bagel served with a generous spread of cream cheese.', 4.50, 20, '2025-11-25 22:29:24'),
(128, 'Bagel with Butter', 'Toasted bagel served with melted butter.', 4.50, 20, '2025-11-25 22:29:24'),
(129, 'Plain Croissant', 'Buttery, flaky croissant served warm.', 2.50, 25, '2025-11-25 22:29:24'),
(130, 'Yogurt with Organic Housemade Granola', 'Creamy yogurt topped with organic housemade granola and fruit.', 5.99, 15, '2025-11-25 22:29:24'),
(131, 'Belgian Waffles', 'Crispy Belgian waffles served with butter and syrup.', 7.99, 12, '2025-11-25 22:29:24'),
(132, 'Halwa Breakfast Special', 'Breakfast plate featuring house halwa with eggs and toast.', 8.99, 10, '2025-11-25 22:29:24'),
(133, 'Cheesecake Slice', 'Rich and creamy cheesecake slice.', 5.99, 10, '2025-11-25 22:29:24'),
(134, 'Kunafa', 'Traditional shredded phyllo dessert with sweet cheese and syrup.', 6.50, 10, '2025-11-25 22:29:24'),
(135, 'Date Pastry', 'Sweet pastry filled with spiced date mixture.', 4.99, 12, '2025-11-25 22:29:24'),
(136, 'Kataifi Pastry', 'Crispy shredded phyllo pastry with nuts and syrup.', 4.99, 10, '2025-11-25 22:29:24'),
(137, 'Jam Crumble Bar', 'Buttery crumble bar layered with fruit jam.', 4.25, 12, '2025-11-25 22:29:24'),
(138, 'Baklava', 'Layers of phyllo, nuts and honey syrup.', 4.50, 15, '2025-11-25 22:29:24'),
(139, 'Pistachio Baklava', 'Baklava made with toasted pistachios and honey syrup.', 4.75, 15, '2025-11-25 22:29:24'),
(140, 'Nutella Baklava', 'Baklava drizzled with Nutella chocolate hazelnut spread.', 4.99, 15, '2025-11-25 22:29:24'),
(141, 'Brownie', 'Fudgy chocolate brownie bar.', 3.50, 18, '2025-11-25 22:29:24'),
(142, 'Banana Bread', 'Moist housemade banana bread slice.', 3.75, 16, '2025-11-25 22:29:24');

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `EID` int NOT NULL,
  `Start_Time` time NOT NULL,
  `End_Time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

TRUNCATE TABLE shifts;

INSERT INTO shifts (EID, Start_Time, End_Time) VALUES
(32,'09:00:00','17:00:00'),
(32,'11:00:00','19:00:00'),
(33,'10:00:00','18:00:00'),
(33,'12:00:00','20:00:00'),
(34,'12:00:00','20:00:00'),
(34,'13:00:00','21:00:00'),
(35,'08:00:00','16:00:00'),
(35,'14:00:00','22:00:00'),
(36,'08:00:00','16:00:00'),
(36,'14:00:00','22:00:00'),
(37,'07:00:00','15:00:00'),
(37,'11:00:00','19:00:00'),
(38,'07:00:00','15:00:00'),
(38,'12:00:00','20:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `EID` int NOT NULL,
  `Ing_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

TRUNCATE TABLE stocks;

INSERT INTO `stocks` (EID, Ing_ID) VALUES
(32,1),
(32,2),
(33,3),
(34,4),
(35,5),
(36,6),
(37,7),
(38,8),
(32,10),
(33,12),
(34,13),
(35,14),
(36,19),
(37,21),
(38,22),
(32,23),
(33,24),
(34,25),
(35,28),
(36,29);
-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `txn_id` int NOT NULL,
  `CID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`txn_id`, `CID`) VALUES
(24, NULL),
(1, 1),
(2, 2),
(25, 2),
(3, 3),
(4, 4),
(21, 4),
(5, 5),
(6, 6),
(27, 6),
(7, 7),
(8, 8),
(9, 9),
(22, 9),
(10, 10),
(11, 11),
(12, 12),
(28, 12),
(13, 13),
(14, 14),
(15, 15),
(23, 15),
(16, 16),
(17, 17),
(18, 18),
(26, 18),
(19, 19),
(20, 20);

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `txn_id` int NOT NULL,
  `product_id` int NOT NULL,
  `Quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transaction_items`
--

INSERT INTO `transaction_items` (`txn_id`, `product_id`, `Quantity`) VALUES
(1, 1, 1),
(1, 14, 1),
(2, 29, 2),
(2, 30, 1),
(3, 14, 1),
(3, 19, 1),
(3, 33, 1),
(4, 4, 1),
(4, 35, 1),
(5, 32, 1),
(5, 131, 1),
(6, 6, 2),
(6, 21, 1),
(7, 29, 1),
(7, 124, 1),
(8, 120, 1),
(8, 130, 1),
(9, 14, 1),
(9, 39, 1),
(10, 102, 1),
(10, 105, 1),
(11, 11, 1),
(11, 17, 1),
(12, 56, 1),
(12, 132, 1),
(13, 57, 1),
(13, 140, 1),
(14, 68, 1),
(14, 138, 1),
(15, 9, 1),
(15, 142, 1),
(16, 18, 1),
(16, 40, 1),
(17, 83, 1),
(17, 130, 1),
(18, 7, 1),
(18, 34, 1),
(19, 15, 1),
(19, 20, 1),
(20, 10, 1),
(20, 53, 1),
(21, 29, 1),
(21, 129, 1),
(22, 14, 1),
(22, 39, 1),
(23, 37, 1),
(23, 125, 1),
(24, 90, 2),
(25, 54, 1),
(25, 134, 1),
(26, 75, 2),
(27, 22, 1),
(27, 88, 1),
(28, 29, 1),
(28, 119, 1),
(28, 141, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_account`
--

CREATE TABLE `user_account` (
  `EID` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `Access_level` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_account`
--

INSERT INTO `user_account` (`EID`, `email`, `password_hash`, `Access_level`) VALUES
(30, 'jryan@gmail.com', '$2b$12$wcu3djZXbjeKuQvIElRMiu7VyH339KssIjZaP2w2qrGhkqkYEc/ZS', 'manager'),
(32, 'abrown@gmail.com', '$2b$12$8WprHP1HyXj56779lYzYD.W1GrkNDlAWw7E7.8QDrdNISBYwTyYXa', 'employee'),
(33, 'kgeorge@gmail.com', '$2b$12$t9DUxsoaFyuy/640ctCEI.peMEr1mkd9fkLrMVyBfM7KUnt1SQmkG', 'manager'),
(34, 'nbijoy@gmail.com', '$2b$12$W7drWg7kvpszyEz21Lf9c.hTfb1I4Jiaobgej9kz5SGGakQLvKT3m', 'employee'),
(35, 'aadepu@gmail.com', '$2b$12$LftxQE1C.UuZbu5mKFJr0ONlUV9njrqIfp7pLUauEe5ynUzERlANq', 'employee'),
(36, 'lnarne@gmail.com', '$2b$12$p0BgXCSPq8.BP4KN.QfmVuZ4DbMg36ZQfJ4/6hFLiwDUzCKx5v4Da', 'employee'),
(37, 'mpathak@gmail.com', '$2b$12$wxzVThEKdPN4kf3xs6j8.Op2q.CvFdxNNwmdE/8BmytJoUAwr.zZq', 'employee'),
(38, 'doh@gmail.com', '$2b$12$eQ0LrkqzDqm.yRq/o6SQkuRmTKFwRdX.yWWhXcBgELlbPiIAvbIXu', 'employee');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contains`
--
ALTER TABLE `contains`
  ADD PRIMARY KEY (`M_ID`,`Ing_ID`),
  ADD KEY `fk_contains_ing` (`Ing_ID`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CID`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EID`),
  ADD KEY `fk_employee_manager` (`manager_id`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`Ing_ID`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`Inv_ID`);

--
-- Indexes for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`Inv_ID`,`Ing_ID`),
  ADD KEY `fk_invitems_ing` (`Ing_ID`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`M_ID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`EID`,`Start_Time`,`End_Time`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`EID`,`Ing_ID`),
  ADD KEY `fk_stocks_ing` (`Ing_ID`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`txn_id`),
  ADD KEY `fk_txn_customer` (`CID`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`txn_id`,`product_id`),
  ADD KEY `fk_ti_menu` (`product_id`);

--
-- Indexes for table `user_account`
--
ALTER TABLE `user_account`
  ADD PRIMARY KEY (`EID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contains`
--
ALTER TABLE `contains`
  ADD CONSTRAINT `fk_contains_ing` FOREIGN KEY (`Ing_ID`) REFERENCES `ingredients` (`Ing_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contains_menu` FOREIGN KEY (`M_ID`) REFERENCES `menu_items` (`M_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD CONSTRAINT `fk_invitems_ing` FOREIGN KEY (`Ing_ID`) REFERENCES `ingredients` (`Ing_ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invitems_inv` FOREIGN KEY (`Inv_ID`) REFERENCES `inventory` (`Inv_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shifts`
--
ALTER TABLE `shifts`
  ADD CONSTRAINT `fk_shift_employee` FOREIGN KEY (`EID`) REFERENCES `employee` (`EID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `fk_stocks_emp` FOREIGN KEY (`EID`) REFERENCES `employee` (`EID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stocks_ing` FOREIGN KEY (`Ing_ID`) REFERENCES `ingredients` (`Ing_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_txn_customer` FOREIGN KEY (`CID`) REFERENCES `customer` (`CID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `fk_ti_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ti_txn` FOREIGN KEY (`txn_id`) REFERENCES `transactions` (`txn_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
