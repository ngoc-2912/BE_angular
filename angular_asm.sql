-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th4 19, 2026 lúc 01:07 PM
-- Phiên bản máy phục vụ: 8.0.44
-- Phiên bản PHP: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `angular_asm`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attributes`
--

CREATE TABLE `attributes` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Đang đổ dữ liệu cho bảng `attributes`
--

INSERT INTO `attributes` (`id`, `name`) VALUES
(1, 'Màu sắc'),
(2, 'Kích thước');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attribute_values`
--

CREATE TABLE `attribute_values` (
  `id` int NOT NULL,
  `attribute_id` int NOT NULL,
  `value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

CREATE TABLE `carts` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 6, '2026-04-15 07:14:58', '2026-04-15 07:14:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int NOT NULL,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Thiết bị nhà bếp', 'thiet-bi-nha-bep', 'Các dụng cụ và thiết bị dùng trong nhà bếp', '0', '2026-04-19 08:27:16', '2026-04-19 08:27:16'),
(2, 'Điện gia dụng', 'dien-gia-dung', 'Thiết bị điện dùng trong gia đình', '0', '2026-04-19 08:27:16', '2026-04-19 08:27:16'),
(3, 'Thiết bị làm sạch', 'thiet-bi-lam-sach', 'Máy hút bụi, máy giặt, dụng cụ vệ sinh', '0', '2026-04-19 08:27:16', '2026-04-19 08:27:16'),
(4, 'Đồ dùng phòng ngủ', 'do-dung-phong-ngu', 'Đèn, quạt, vật dụng phòng ngủ', '0', '2026-04-19 08:27:16', '2026-04-19 08:27:16'),
(5, 'Thiết bị chăm sóc cá nhân', 'thiet-bi-cham-soc-ca-nhan', 'Máy sấy tóc, bàn ủi, thiết bị cá nhân', '0', '2026-04-19 08:27:16', '2026-04-19 08:27:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `payment_method` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `user_id` int DEFAULT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('0','1','2','3') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `code`, `full_name`, `payment_method`, `email`, `phone`, `address`, `note`, `user_id`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ORD-2001', 'Gia Bảo', 'COD', 'baovietnames@gmail.com', '0987654322', 'Bình Thuận', 'Giao nhanh', 2, 900000.00, '1', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(2, 'ORD-2002', 'Minh Được', 'COD', 'tranminhduoc2006@gmail.com', '0987654322', 'Cần Thơ', '', 6, 720000.00, '2', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(3, 'ORD-2003', 'Như Ngọc', 'BANK', 'test1@gmail.com', '0987654322', 'Sóc Trăng', 'Gói cẩn thận', 7, 2390000.00, '1', '2026-04-19 10:16:50', '2026-04-19 10:17:32'),
(4, 'ORD-2004', 'Khang Huỳnh', 'COD', 'test2@gmail.com', '0987654322', 'Hậu Giang', '', 8, 530000.00, '1', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(5, 'ORD-2005', 'Gia Bảo', 'BANK', 'baovietnames@gmail.com', '0987654322', 'An Giang', '', 9, 5000000.00, '2', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(6, 'ORD-2006', 'Minh Được', 'COD', 'test@gmail.com', '0987654322', 'Vĩnh Long', '', 10, 5500000.00, '1', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(7, 'ORD-2007', 'Như Ngọc', 'COD', 'test1@gmail.com', '0987654322', 'Cần Thơ', 'Call trước khi giao', 2, 840000.00, '0', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(8, 'ORD-2008', 'Khang Huỳnh', 'BANK', 'test2@gmail.com', '0987654322', 'Bạc Liêu', '', 6, 530000.00, '2', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(9, 'ORD-2009', 'Gia Bảo', 'COD', 'baovietnames@gmail.com', '0987654322', 'Cà Mau', '', 8, 180000.00, '1', '2026-04-19 10:16:50', '2026-04-19 10:16:50'),
(10, 'ORD-2010', 'Minh Được', 'COD', 'tranminhduoc2006@gmail.com', '0987654322', 'Cần Thơ', 'Không gọi', 9, 470000.00, '0', '2026-04-19 10:16:50', '2026-04-19 10:16:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_details`
--

CREATE TABLE `order_details` (
  `id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 650000.00),
(2, 1, 13, 1, 250000.00),
(3, 2, 2, 1, 520000.00),
(4, 2, 14, 1, 200000.00),
(5, 3, 3, 1, 1500000.00),
(6, 3, 4, 1, 890000.00),
(7, 4, 5, 1, 120000.00),
(8, 4, 10, 1, 180000.00),
(9, 4, 11, 1, 350000.00),
(10, 5, 6, 1, 4800000.00),
(11, 5, 9, 1, 450000.00),
(12, 6, 7, 1, 5500000.00),
(13, 7, 8, 1, 390000.00),
(14, 7, 9, 1, 450000.00),
(15, 8, 10, 1, 180000.00),
(16, 8, 11, 1, 350000.00),
(17, 9, 10, 1, 180000.00),
(18, 10, 13, 1, 250000.00),
(19, 10, 14, 1, 220000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `price` decimal(12,2) NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '1',
  `category_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `image`, `status`, `category_id`, `created_at`, `updated_at`) VALUES
(1, 'Nồi cơm điện Sharp 1.8L', 'noi-com-dien-sharp-1-8l', 'Nồi cơm điện nấu nhanh, giữ ấm tốt', 650000.00, 'https://mediamart.vn/images/uploads/2024/cc384e28-72ae-49a3-b4a1-3e7b1dd4a69f.jpg', '1', 1, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(2, 'Bếp gas đôi Sunhouse', 'bep-gas-doi-sunhouse', 'Bếp gas đôi tiết kiệm gas', 520000.00, 'https://bizweb.dktcdn.net/thumb/grande/100/444/251/products/0-78.jpg?v=1712470318387', '0', 1, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(3, 'Nồi chiên không dầu 5L', 'noi-chien-khong-dau-5l', 'Chiên nướng ít dầu, tốt cho sức khỏe', 1500000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8h4kasxufJvBt7OkIrrWyn8eUaeVedaS1ZQ&s', '0', 1, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(4, 'Máy xay sinh tố Philips', 'may-xay-sinh-to-philips', 'Xay trái cây nhanh, công suất mạnh', 890000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY4hq_zYDClL2eYrdYqfPEp2TNtEg7-bGsug&s', '0', 1, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(5, 'Lò vi sóng Sharp 20L', 'lo-vi-song-sharp-20l', 'Hâm nóng và rã đông nhanh', 1200000.00, 'https://thegioidodung.vn/wp-content/uploads/2024/10/lo-vi-song-co-sharp-r-208vn-ws-20-lit-vietmart.jpg', '0', 1, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(6, 'Tủ lạnh Toshiba 180L', 'tu-lanh-toshiba-180l', 'Tủ lạnh tiết kiệm điện, 2 cánh', 4800000.00, 'https://cdn.tgdd.vn/Products/Images/1943/202857/toshiba-gr-b22vu-ukg-1-2-org-1-700x467.jpg', '0', 2, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(7, 'Máy giặt LG 8kg', 'may-giat-lg-8kg', 'Giặt sạch, vận hành êm', 5500000.00, 'https://cdn.tgdd.vn/Products/Images/1944/202867/lg-fc1408s5w-11-300x300.jpg', '0', 3, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(8, 'Máy hút bụi cầm tay mini', 'may-hut-bui-mini', 'Nhỏ gọn, hút bụi hiệu quả', 390000.00, 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/may_hut_bui_cam_tay_mini_2025_01_9a5b3875c6.jpg', '0', 3, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(9, 'Quạt đứng Asia 5 cánh', 'quat-dung-asia-5-canh', 'Gió mạnh, tiết kiệm điện', 450000.00, 'https://dienmaygiadungsaigon.vn/wp-content/uploads/2025/09/Quat-dung-Asia-5-canh-VY539790-55W-450x450.jpg', '0', 4, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(10, 'Đèn LED bàn học cảm ứng', 'den-led-ban-hoc-cam-ung', 'Ánh sáng dịu, cảm ứng tiện lợi', 180000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsdSHu_6rOPsOWJTnZCUA3hmYMN74uiABoBg&s', '0', 4, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(11, 'Bàn ủi hơi nước Panasonic', 'ban-ui-hoi-nuoc-panasonic', 'Ủi nhanh, không làm cháy vải', 350000.00, 'https://kingshop.vn/data/images/Ban-la-hoi-nuoc-Panasonic-NIE410T-0.jpg', '0', 5, '2026-04-19 08:27:49', '2026-04-19 08:27:49'),
(12, 'Máy sấy tóc Dyson mini', 'may-say-toc-dyson-mini', 'Sấy nhanh, bảo vệ tóc', 1800000.00, 'https://cdn2.fptshop.com.vn/unsafe/800x0/may_say_toc_dyson_cua_nuoc_nao_2_5b16ce0c61.jpg', '1', 5, '2026-04-19 08:27:49', '2026-04-19 12:45:13'),
(13, 'Bình đun siêu tốc 1.7L', 'binh-dun-sieu-toc-1.7l', 'Đun nước nhanh trong vài phút', 250000.00, 'https://ecalite.com/Uploads/am-dun-sieu-toc-cao-cap-ecalite-ek-g1723-17l.png', '1', 2, '2026-04-19 08:27:49', '2026-04-19 12:45:04'),
(14, 'Ấm siêu tốc inox 2L', 'am-sieu-toc-inox-2l', 'Inox bền, đun nước nhanh', 220000.00, 'https://bizweb.dktcdn.net/100/075/453/products/20sk3.jpg?v=1575435042633', '1', 2, '2026-04-19 08:27:49', '2026-04-19 12:44:55'),
(15, 'Máy lọc nước RO Kangaroo', 'may-loc-nuoc-ro-kangaroo', 'Lọc sạch 7 lõi, nước tinh khiết', 3200000.00, 'https://kangaroovietnam.vn/Uploads/may-loc-nuoc-ro-kangaroo-vtu-kg08-6-loi.jpg', '1', 2, '2026-04-19 08:27:49', '2026-04-19 13:05:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `role` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `active` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `address`, `role`, `active`, `created_at`, `updated_at`) VALUES
(2, 'Nguyễn Văn A', 'test@gmail.com', '$2b$10$JEC8dCCpDha4KYwoVfqWc.HYXD4iZE8iA8ErxITsI1KaH/o6ol4FS', NULL, NULL, '1', '1', '2026-04-10 17:45:45', '2026-04-15 04:09:09'),
(6, 'duocne', 'tranminhduoc2006@gmail.com', '$2b$10$x4VWg5BE7C6ERvejbWu29ucEBMOMAXlFc/HAH9ziJZyhRIzYaIsSi', NULL, NULL, '0', '1', '2026-04-15 05:14:47', '2026-04-15 05:14:47'),
(7, 'hello', 'test1@gmail.com', '$2b$10$JCL9RAQ5KQw3hIBfkWr87.SjaTwtMDs1Yp8MCRdUewkEFCuTta/fm', NULL, NULL, '0', '0', '2026-04-15 05:16:22', '2026-04-15 05:16:22'),
(8, 'Gia Bao', 'tranminhduoc20061@gmail.com', '$2b$10$UhYS81m.OqHJMoDlDOhLkuyefa8tDjeIJxazJ.4kuXrB5TaPocECK', NULL, NULL, '0', '1', '2026-04-15 07:02:09', '2026-04-15 07:02:09'),
(9, 'tran minh duoc', 'test2@gmail.com', '$2b$10$j9crWD8jMfUZ0HNkFLUk/OAN52HqLTC5v5PdjfAF7thdRtUfyPXFm', NULL, NULL, '0', '1', '2026-04-15 11:46:26', '2026-04-15 11:46:26'),
(10, 'Gia Bảo', 'baovietnames@gmail.com', '$2y$10$3r5O1CNEmALy3.TNRmCHluvSXk6P5G7HEvZPlo.4.n91xTHh8pCS.', '0987654322', 'Bình Thuận', '0', '1', '2026-04-19 08:25:05', '2026-04-19 08:25:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `variants`
--

CREATE TABLE `variants` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Đang đổ dữ liệu cho bảng `variants`
--

INSERT INTO `variants` (`id`, `product_id`, `name`, `price`, `image`, `sku`, `created_at`, `updated_at`) VALUES
(5, 15, 'Mẫu 1', 120000.00, 'https://res.cloudinary.com/djiddcpul/image/upload/v1776601635/uk0uckwap5chv49khubr.jpg', 'M01', '2026-04-19 12:27:14', '2026-04-19 12:27:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `variant_values`
--

CREATE TABLE `variant_values` (
  `variant_id` int NOT NULL,
  `attribute_value_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attribute_id` (`attribute_id`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `fk_cart_items_variant` (`variant_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `variants`
--
ALTER TABLE `variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `variant_values`
--
ALTER TABLE `variant_values`
  ADD PRIMARY KEY (`variant_id`,`attribute_value_id`),
  ADD KEY `attribute_value_id` (`attribute_value_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `variants`
--
ALTER TABLE `variants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `attribute_values_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `variants`
--
ALTER TABLE `variants`
  ADD CONSTRAINT `variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `variant_values`
--
ALTER TABLE `variant_values`
  ADD CONSTRAINT `variant_values_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `variant_values_ibfk_2` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
