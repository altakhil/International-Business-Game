-- Seed Data for International Business Game
-- This file contains INSERT statements for board_spaces and properties tables
-- Board layout based on actual game board image (40 positions, clockwise)

-- ============================================
-- BOARD SPACES
-- ============================================
-- Board has 40 positions (0-39)
-- 26 properties + 14 special spaces

INSERT INTO board_spaces (position, name, space_type, property_color, base_price, mortgage_value) VALUES
-- Position 0: START
(0, 'START', 'start', null, 0, 0),

-- Bottom Row (Right to Left): SINGAPORE, MALAYSIA, RAILWAYS, CHINA, PETROLEUM, SAUDI ARABIA, CHANCE, INDIA, JAIL
(1, 'SINGAPORE', 'property', 'BLUE', 3000.00, 1500.00),
(2, 'MALAYSIA', 'property', 'GREEN', 1500.00, 800.00),
(3, 'RAILWAYS', 'property', 'WHITE', 9500.00, 5000.00),
(4, 'CHINA', 'property', 'BLUE', 4500.00, 2250.00),
(5, 'PETROLEUM', 'property', 'WHITE', 5500.00, 1300.00),
(6, 'SAUDI ARABIA', 'property', 'GREEN', 5500.00, 2800.00),
(7, 'CHANCE', 'chance', null, 0, 0),
(8, 'INDIA', 'property', 'BLUE', 4500.00, 2750.00),
(9, 'JAIL', 'jail', null, 0, 0),

-- Left Column (Bottom to Top): AUSTRALIA, UNO, HONGKONG, MEXICO, ROADWAYS, TRAVELLING DUTY, USA, JAPAN, PARTY HOUSE
(10, 'AUSTRALIA', 'property', 'YELLOW', 3300.00, 2000.00),
(11, 'UNO', 'uno', null, 0, 0),
(12, 'HONGKONG', 'property', 'BLUE', 2000.00, 1000.00),
(13, 'MEXICO', 'property', 'YELLOW', 4000.00, 2000.00),
(14, 'ROADWAYS', 'property', 'WHITE', 3500.00, 1800.00),
(15, 'TRAVELLING DUTY', 'travelling_duty', null, 0, 0),
(16, 'USA', 'property', 'YELLOW', 8500.00, 5000.00),
(17, 'JAPAN', 'property', 'BLUE', 2500.00, 1250.00),
(18, 'PARTY HOUSE', 'party_house', null, 0, 0),

-- Top Row (Left to Right): ITALY, CHANCE, BRAZIL, SWITZERLAND, CUSTOM DUTY, AIRWAYS, GERMANY, CANADA, RESORT
(19, 'ITALY', 'property', 'RED', 3500.00, 1000.00),
(20, 'CHANCE', 'chance', null, 0, 0),
(21, 'BRAZIL', 'property', 'YELLOW', 2500.00, 1300.00),
(22, 'SWITZERLAND', 'property', 'RED', 3500.00, 3300.00),
(23, 'CUSTOM DUTY', 'custom', null, 0, 0),
(24, 'AIRWAYS', 'property', 'WHITE', 10500.00, 5500.00),
(25, 'GERMANY', 'property', 'RED', 3500.00, 1750.00),
(26, 'CANADA', 'property', 'YELLOW', 4000.00, 2000.00),
(27, 'RESORT', 'resort', null, 0, 0),

-- Right Column (Top to Bottom): EGYPT, SATELLITE, IRAN, FRANCE, UNO, WATERWAYS, IRAQ, ENGLAND, START (Collect $1500)
(28, 'EGYPT', 'property', 'GREEN', 3200.00, 1500.00),
(29, 'SATELLITE', 'property', 'WHITE', 2000.00, 1250.00),
(30, 'IRAN', 'property', 'GREEN', 2500.00, 1250.00),
(31, 'FRANCE', 'property', 'RED', 2500.00, 1250.00),
(32, 'UNO', 'uno', null, 0, 0),
(33, 'WATERWAYS', 'property', 'WHITE', 9500.00, 2000.00),
(34, 'IRAQ', 'property', 'GREEN', 5000.00, 2500.00),
(35, 'ENGLAND', 'property', 'RED', 2500.00, 3500.00);

-- ============================================
-- PROPERTIES
-- ============================================

-- YELLOW Properties
INSERT INTO properties (space_id, name, property_color, base_price, house_price, hotel_price, mortgage_value, base_rent, rent_1_house, rent_2_houses, rent_3_houses, rent_hotel) VALUES
((SELECT space_id FROM board_spaces WHERE name = 'CANADA'), 'CANADA', 'YELLOW', 4000.00, 4000.00, 4000.00, 2000.00, 400.00, 1400.00, 2800.00, 4200.00, 5200.00),
((SELECT space_id FROM board_spaces WHERE name = 'USA'), 'USA', 'YELLOW', 8500.00, 8500.00, 8500.00, 5000.00, 1000.00, 2000.00, 4000.00, 6000.00, 7000.00),
((SELECT space_id FROM board_spaces WHERE name = 'AUSTRALIA'), 'AUSTRALIA', 'YELLOW', 3300.00, 3300.00, 3300.00, 2000.00, 400.00, 1400.00, 2800.00, 4200.00, 5200.00),
((SELECT space_id FROM board_spaces WHERE name = 'BRAZIL'), 'BRAZIL', 'YELLOW', 2500.00, 2500.00, 2500.00, 1300.00, 300.00, 1300.00, 2600.00, 3900.00, 4900.00),
((SELECT space_id FROM board_spaces WHERE name = 'MEXICO'), 'MEXICO', 'YELLOW', 4000.00, 4000.00, 4000.00, 2000.00, 900.00, 1800.00, 3600.00, 5400.00, 6400.00);

-- RED Properties
INSERT INTO properties (space_id, name, property_color, base_price, house_price, hotel_price, mortgage_value, base_rent, rent_1_house, rent_2_houses, rent_3_houses, rent_hotel) VALUES
((SELECT space_id FROM board_spaces WHERE name = 'SWITZERLAND'), 'SWITZERLAND', 'RED', 3500.00, 6500.00, 6500.00, 3300.00, 700.00, 1700.00, 3400.00, 5100.00, 6100.00),
((SELECT space_id FROM board_spaces WHERE name = 'ENGLAND'), 'ENGLAND', 'RED', 2500.00, 7000.00, 7000.00, 3500.00, 700.00, 1700.00, 3400.00, 5100.00, 6100.00),
((SELECT space_id FROM board_spaces WHERE name = 'FRANCE'), 'FRANCE', 'RED', 2500.00, 2500.00, 2500.00, 1250.00, 300.00, 1300.00, 2600.00, 3900.00, 4900.00),
((SELECT space_id FROM board_spaces WHERE name = 'ITALY'), 'ITALY', 'RED', 3500.00, 2000.00, 2000.00, 1000.00, 200.00, 1200.00, 2400.00, 3600.00, 4600.00),
((SELECT space_id FROM board_spaces WHERE name = 'GERMANY'), 'GERMANY', 'RED', 3500.00, 3500.00, 3500.00, 1750.00, 400.00, 1400.00, 2800.00, 4200.00, 5200.00);

-- GREEN Properties
INSERT INTO properties (space_id, name, property_color, base_price, house_price, hotel_price, mortgage_value, base_rent, rent_1_house, rent_2_houses, rent_3_houses, rent_hotel) VALUES
((SELECT space_id FROM board_spaces WHERE name = 'SAUDI ARABIA'), 'SAUDI ARABIA', 'GREEN', 5500.00, 5500.00, 5500.00, 2800.00, 600.00, 1600.00, 3200.00, 4800.00, 5800.00),
((SELECT space_id FROM board_spaces WHERE name = 'IRAN'), 'IRAN', 'GREEN', 2500.00, 2500.00, 2500.00, 1250.00, 300.00, 1300.00, 2600.00, 3900.00, 4900.00),
((SELECT space_id FROM board_spaces WHERE name = 'IRAQ'), 'IRAQ', 'GREEN', 5000.00, 5000.00, 5000.00, 2500.00, 500.00, 1500.00, 3000.00, 4500.00, 5500.00),
((SELECT space_id FROM board_spaces WHERE name = 'MALAYSIA'), 'MALAYSIA', 'GREEN', 1500.00, 1500.00, 1500.00, 800.00, 200.00, 1200.00, 2400.00, 3600.00, 4600.00),
((SELECT space_id FROM board_spaces WHERE name = 'EGYPT'), 'EGYPT', 'GREEN', 3200.00, 3200.00, 3200.00, 1500.00, 300.00, 1300.00, 2600.00, 3900.00, 4900.00);

-- BLUE Properties
INSERT INTO properties (space_id, name, property_color, base_price, house_price, hotel_price, mortgage_value, base_rent, rent_1_house, rent_2_houses, rent_3_houses, rent_hotel) VALUES
((SELECT space_id FROM board_spaces WHERE name = 'INDIA'), 'INDIA', 'BLUE', 4500.00, 5500.00, 5500.00, 2750.00, 500.00, 1550.00, 3100.00, 4650.00, 5650.00),
((SELECT space_id FROM board_spaces WHERE name = 'HONGKONG'), 'HONGKONG', 'BLUE', 2000.00, 2500.00, 2500.00, 1000.00, 200.00, 1200.00, 2400.00, 3600.00, 4600.00),
((SELECT space_id FROM board_spaces WHERE name = 'SINGAPORE'), 'SINGAPORE', 'BLUE', 3000.00, 3000.00, 3000.00, 1500.00, 300.00, 1300.00, 2600.00, 3900.00, 4900.00),
((SELECT space_id FROM board_spaces WHERE name = 'JAPAN'), 'JAPAN', 'BLUE', 2500.00, 2500.00, 2500.00, 1250.00, 250.00, 1250.00, 2500.00, 3750.00, 4750.00),
((SELECT space_id FROM board_spaces WHERE name = 'CHINA'), 'CHINA', 'BLUE', 4500.00, 4500.00, 4500.00, 2250.00, 450.00, 1450.00, 2900.00, 4350.00, 5350.00);

-- WHITE Properties (Utilities/Transport - No houses/hotels, rent_1_house is pair bonus)
INSERT INTO properties (space_id, name, property_color, base_price, house_price, hotel_price, mortgage_value, base_rent, rent_1_house, rent_2_houses, rent_3_houses, rent_hotel) VALUES
((SELECT space_id FROM board_spaces WHERE name = 'PETROLEUM'), 'PETROLEUM', 'WHITE', 5500.00, 0, 0, 1300.00, 500.00, 1000.00, 0, 0, 0),
((SELECT space_id FROM board_spaces WHERE name = 'AIRWAYS'), 'AIRWAYS', 'WHITE', 10500.00, 0, 0, 5500.00, 1500.00, 2500.00, 0, 0, 0),
((SELECT space_id FROM board_spaces WHERE name = 'SATELLITE'), 'SATELLITE', 'WHITE', 2000.00, 0, 0, 1250.00, 500.00, 1000.00, 0, 0, 0),
((SELECT space_id FROM board_spaces WHERE name = 'WATERWAYS'), 'WATERWAYS', 'WHITE', 9500.00, 0, 0, 2000.00, 1400.00, 2200.00, 0, 0, 0),
((SELECT space_id FROM board_spaces WHERE name = 'ROADWAYS'), 'ROADWAYS', 'WHITE', 3500.00, 0, 0, 1800.00, 800.00, 1500.00, 0, 0, 0),
((SELECT space_id FROM board_spaces WHERE name = 'RAILWAYS'), 'RAILWAYS', 'WHITE', 9500.00, 0, 0, 5000.00, 1500.00, 2500.00, 0, 0, 0);

-- ============================================
-- SPECIAL CARDS (CHANCE)
-- ============================================
INSERT INTO special_cards (card_type, title, description, card_action, action_value, target_space, is_get_out_of_jail_free) VALUES
('chance', 'Bank Error', 'Bank error in your favor. Collect $500.', 'receive_money', 500.00, 0, FALSE),
('chance', 'Doctor Fee', 'Pay doctor fee of $500.', 'pay_money', 500.00, 0, FALSE),
('chance', 'Go to Jail', 'Go directly to jail. Do not pass Go.', 'go_to_jail', 0, 0, FALSE),
('chance', 'Get Out of Jail', 'Get Out of Jail Free card.', 'get_out_of_jail_free', 0, 0, TRUE),
('chance', 'Advance to Go', 'Advance to Go. Collect $1500.', 'advance_to_go', 1500.00, 0, FALSE),
('chance', 'Pay Repairs', 'Pay $250 for each house and $1000 for each hotel.', 'make_repairs', 0, 0, FALSE),
('chance', 'Win Prize', 'You won a prize! Collect $1000.', 'receive_money', 1000.00, 0, FALSE),
('chance', 'Pay Tax', 'Pay $800 tax.', 'pay_money', 800.00, 0, FALSE);

-- ============================================
-- SPECIAL CARDS (UNO)
-- ============================================
INSERT INTO special_cards (card_type, title, description, card_action, action_value, target_space, is_get_out_of_jail_free) VALUES
('uno', 'Submit Passport', 'Submit your passport. Pay $300.', 'pay_money', 300.00, 0, FALSE),
('uno', 'Travel Bonus', 'Travel bonus! Collect $800.', 'receive_money', 800.00, 0, FALSE),
('uno', 'Customs Duty', 'Pay customs duty of $400.', 'pay_money', 400.00, 0, FALSE),
('uno', 'Business Deal', 'Good business deal! Collect $1200.', 'receive_money', 1200.00, 0, FALSE),
('uno', 'Fine', 'Pay fine of $600.', 'pay_money', 600.00, 0, FALSE),
('uno', 'Investment Return', 'Investment returns! Collect $1500.', 'receive_money', 1500.00, 0, FALSE),
('uno', 'Airport Tax', 'Pay airport tax of $500.', 'pay_money', 500.00, 0, FALSE),
('uno', 'Trade Profit', 'Trade profit! Collect $1000.', 'receive_money', 1000.00, 0, FALSE);
