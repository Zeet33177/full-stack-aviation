-- ============================================================
-- Full Stack Aviation — Seed Data
-- Runs on startup via spring.sql.init.data-locations
-- Uses INSERT IGNORE so re-runs are safe.
-- ============================================================

-- Aircraft
INSERT IGNORE INTO aircraft (id, registration_number, model, manufacturer, total_seats, economy_seats, business_seats, first_class_seats, year_of_manufacture, status)
VALUES
  (1, 'VT-HAA', 'Boeing 737-800',   'Boeing',  189, 162, 27,  0,  2018, 'ACTIVE'),
  (2, 'VT-HAB', 'Airbus A320neo',   'Airbus',  180, 150, 30,  0,  2020, 'ACTIVE'),
  (3, 'VT-HAC', 'Boeing 777-300ER', 'Boeing',  396, 304, 60, 32, 2019, 'ACTIVE'),
  (4, 'VT-HAD', 'Airbus A380-800',  'Airbus',  555, 399, 96, 60, 2017, 'ACTIVE');

-- Admin user  (password = "admin@123" BCrypt encoded)
INSERT IGNORE INTO users (id, first_name, last_name, email, password, role, phone, nationality, created_at, updated_at)
VALUES (1, 'Full Stack', 'Admin', 'admin@horizon.com',
        '$2b$12$YRH3gUrkkYEfnDLMnD7u4e/cV3D2juot0js0g2CrwWuT3F6wPD6J6',
        'ADMIN', '+911234567890', 'Indian', NOW(), NOW());

-- Staff user  (password = "staff@123")
INSERT IGNORE INTO users (id, first_name, last_name, email, password, role, phone, nationality, created_at, updated_at)
VALUES (2, 'Sarah', 'Sharma', 'staff@horizon.com',
        '$2b$12$j4wdk20VfDG8pw4mFw1h9OdyktQl7iHHRvci9KvM8QuQPKWdTD7ZW',
        'STAFF', '+911234567891', 'Indian', NOW(), NOW());

-- Sample passenger  (password = "pass@123")
INSERT IGNORE INTO users (id, first_name, last_name, email, password, role, phone, nationality, passport_number, created_at, updated_at)
VALUES (3, 'Arjun', 'Mehta', 'arjun@email.com',
        '$2b$12$K3zWHLN5kMBmkV13gxIMMuLu2xs4N8a4Khet2jjC7Yfc0kjwUWXaK',
        'PASSENGER', '+919876543210', 'Indian', 'P1234567', NOW(), NOW());

-- Flights  (dates in future — nested DATE_ADD for MySQL compatibility)
INSERT IGNORE INTO flights (id, flight_number, aircraft_id, origin, destination, departure_time, arrival_time, total_seats, available_seats, price, status, terminal, gate)
VALUES
  (1,  'HA101', 1, 'Mumbai',    'Delhi',     DATE_ADD(NOW(), INTERVAL 1  DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1  DAY), INTERVAL 2  HOUR),  189, 189, 4999.00,  'SCHEDULED', 'T2', 'G5'),
  (2,  'HA102', 1, 'Delhi',     'Mumbai',    DATE_ADD(NOW(), INTERVAL 2  DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2  DAY), INTERVAL 2  HOUR),  189, 189, 4999.00,  'SCHEDULED', 'T1', 'G3'),
  (3,  'HA201', 2, 'Mumbai',    'Bengaluru', DATE_ADD(NOW(), INTERVAL 3  DAY), DATE_ADD(DATE_ADD(DATE_ADD(NOW(), INTERVAL 3  DAY), INTERVAL 1  HOUR), INTERVAL 45 MINUTE), 180, 180, 3499.00,  'SCHEDULED', 'T2', 'G8'),
  (4,  'HA202', 2, 'Bengaluru', 'Mumbai',    DATE_ADD(NOW(), INTERVAL 4  DAY), DATE_ADD(DATE_ADD(DATE_ADD(NOW(), INTERVAL 4  DAY), INTERVAL 1  HOUR), INTERVAL 45 MINUTE), 180, 180, 3499.00,  'SCHEDULED', 'T1', 'G2'),
  (5,  'HA301', 3, 'Delhi',     'New York',  DATE_ADD(NOW(), INTERVAL 5  DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5  DAY), INTERVAL 14 HOUR), 396, 396, 45999.00, 'SCHEDULED', 'T3', 'G12'),
  (6,  'HA302', 3, 'New York',  'Delhi',     DATE_ADD(NOW(), INTERVAL 7  DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7  DAY), INTERVAL 14 HOUR), 396, 396, 45999.00, 'SCHEDULED', 'T3', 'G14'),
  (7,  'HA401', 4, 'Mumbai',    'London',    DATE_ADD(NOW(), INTERVAL 6  DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6  DAY), INTERVAL 9  HOUR), 555, 555, 52999.00, 'SCHEDULED', 'T2', 'G20'),
  (8,  'HA402', 4, 'London',    'Mumbai',    DATE_ADD(NOW(), INTERVAL 9  DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9  DAY), INTERVAL 9  HOUR), 555, 555, 52999.00, 'SCHEDULED', 'T5', 'G18'),
  (9,  'HA501', 1, 'Chennai',   'Kolkata',   DATE_ADD(NOW(), INTERVAL 2  DAY), DATE_ADD(DATE_ADD(DATE_ADD(NOW(), INTERVAL 2  DAY), INTERVAL 2  HOUR), INTERVAL 30 MINUTE), 189, 189, 5499.00,  'SCHEDULED', 'T1', 'G6'),
  (10, 'HA502', 2, 'Hyderabad', 'Delhi',     DATE_ADD(NOW(), INTERVAL 3  DAY), DATE_ADD(DATE_ADD(DATE_ADD(NOW(), INTERVAL 3  DAY), INTERVAL 2  HOUR), INTERVAL 15 MINUTE), 180, 180, 6299.00,  'SCHEDULED', 'T2', 'G9'),
  -- Fixed Dec 7 2026 flights for demo
  (11, 'HA601', 1, 'Mumbai',    'Delhi',     '2026-12-07 06:00:00', '2026-12-07 08:05:00', 189, 189, 5499.00,  'SCHEDULED', 'T2', 'G4'),
  (12, 'HA602', 2, 'Delhi',     'Mumbai',    '2026-12-07 09:30:00', '2026-12-07 11:35:00', 180, 180, 4799.00,  'SCHEDULED', 'T1', 'G7'),
  (13, 'HA603', 2, 'Mumbai',    'Bengaluru', '2026-12-07 11:00:00', '2026-12-07 12:45:00', 180, 180, 3299.00,  'SCHEDULED', 'T2', 'G11'),
  (14, 'HA604', 1, 'Delhi',     'Bengaluru', '2026-12-07 14:00:00', '2026-12-07 16:30:00', 189, 189, 5999.00,  'SCHEDULED', 'T3', 'G6'),
  (15, 'HA605', 3, 'Chennai',   'Mumbai',    '2026-12-07 07:15:00', '2026-12-07 09:30:00', 396, 396, 4299.00,  'SCHEDULED', 'T1', 'G2'),
  (16, 'HA606', 2, 'Hyderabad', 'Delhi',     '2026-12-07 16:45:00', '2026-12-07 19:15:00', 180, 180, 6499.00,  'SCHEDULED', 'T2', 'G10'),

  -- ── Ranchi → Bengaluru weekend demo: Sat 5 Dec 2026 (peak fares) ──────────
  (17, 'HA701', 1, 'Ranchi', 'Bengaluru', '2026-12-05 06:00:00', '2026-12-05 08:25:00', 189, 189,  8999.00, 'SCHEDULED', 'T1', 'G1'),
  (18, 'HA702', 2, 'Ranchi', 'Bengaluru', '2026-12-05 09:30:00', '2026-12-05 11:55:00', 180, 180,  7699.00, 'SCHEDULED', 'T1', 'G3'),
  (19, 'HA703', 1, 'Ranchi', 'Bengaluru', '2026-12-05 12:15:00', '2026-12-05 14:35:00', 189, 189, 11499.00, 'SCHEDULED', 'T1', 'G5'),
  (20, 'HA704', 2, 'Ranchi', 'Bengaluru', '2026-12-05 15:45:00', '2026-12-05 18:05:00', 180, 180, 12999.00, 'SCHEDULED', 'T2', 'G7'),
  (21, 'HA705', 1, 'Ranchi', 'Bengaluru', '2026-12-05 08:00:00', '2026-12-05 10:20:00', 189, 189,  9499.00, 'SCHEDULED', 'T1', 'G9'),

  -- ── Ranchi → Bengaluru weekday demo: Wed 9 Dec 2026 (value fares ~45% lower) ─
  (22, 'HA711', 2, 'Ranchi', 'Bengaluru', '2026-12-09 06:15:00', '2026-12-09 08:35:00', 180, 180, 4299.00, 'SCHEDULED', 'T1', 'G2'),
  (23, 'HA712', 1, 'Ranchi', 'Bengaluru', '2026-12-09 09:45:00', '2026-12-09 12:05:00', 189, 189, 3799.00, 'SCHEDULED', 'T1', 'G4'),
  (24, 'HA713', 2, 'Ranchi', 'Bengaluru', '2026-12-09 12:30:00', '2026-12-09 14:50:00', 180, 180, 4499.00, 'SCHEDULED', 'T2', 'G6'),
  (25, 'HA714', 1, 'Ranchi', 'Bengaluru', '2026-12-09 15:00:00', '2026-12-09 17:20:00', 189, 189, 5199.00, 'SCHEDULED', 'T1', 'G8'),
  (26, 'HA715', 2, 'Ranchi', 'Bengaluru', '2026-12-09 18:30:00', '2026-12-09 20:50:00', 180, 180, 3999.00, 'SCHEDULED', 'T2', 'G10');

-- ── Ranchi → Bengaluru: Dec 1–15 full calendar (with stops, via_city) ────────
INSERT IGNORE INTO flights
  (id, flight_number, aircraft_id, origin, destination, departure_time, arrival_time,
   total_seats, available_seats, price, status, terminal, gate, stops, via_city)
VALUES
  -- Dec 1 Mon — moderate weekday
  (27,'HA721',2,'Ranchi','Bengaluru','2026-12-01 01:00:00','2026-12-01 03:20:00',180,180, 4799.00,'SCHEDULED','T1','G2',0,NULL),
  (28,'HA722',1,'Ranchi','Bengaluru','2026-12-01 04:30:00','2026-12-01 06:50:00',189,189, 6299.00,'SCHEDULED','T1','G4',0,NULL),
  (29,'HA723',2,'Ranchi','Bengaluru','2026-12-01 09:30:00','2026-12-01 11:50:00',180,152, 5499.00,'SCHEDULED','T2','G6',0,NULL),
  (30,'HA724',1,'Ranchi','Bengaluru','2026-12-01 03:00:00','2026-12-01 07:30:00',189, 89, 3299.00,'SCHEDULED','T1','G8',1,'Hyderabad'),
  -- Dec 2 Tue — cheap weekday
  (31,'HA731',1,'Ranchi','Bengaluru','2026-12-02 01:00:00','2026-12-02 03:20:00',189,189, 3499.00,'SCHEDULED','T1','G1',0,NULL),
  (32,'HA732',2,'Ranchi','Bengaluru','2026-12-02 04:30:00','2026-12-02 06:50:00',180,180, 4299.00,'SCHEDULED','T1','G3',0,NULL),
  (33,'HA733',1,'Ranchi','Bengaluru','2026-12-02 09:30:00','2026-12-02 11:50:00',189,142, 5199.00,'SCHEDULED','T2','G5',0,NULL),
  (34,'HA734',2,'Ranchi','Bengaluru','2026-12-02 03:00:00','2026-12-02 07:30:00',180,112, 2499.00,'SCHEDULED','T1','G7',1,'Kolkata'),
  -- Dec 3 Wed — cheapest weekday
  (35,'HA741',2,'Ranchi','Bengaluru','2026-12-03 01:00:00','2026-12-03 03:20:00',180,180, 2999.00,'SCHEDULED','T1','G2',0,NULL),
  (36,'HA742',1,'Ranchi','Bengaluru','2026-12-03 04:30:00','2026-12-03 06:50:00',189,189, 3799.00,'SCHEDULED','T1','G4',0,NULL),
  (37,'HA743',2,'Ranchi','Bengaluru','2026-12-03 07:30:00','2026-12-03 09:50:00',180,167, 4599.00,'SCHEDULED','T2','G6',0,NULL),
  (38,'HA744',1,'Ranchi','Bengaluru','2026-12-03 03:00:00','2026-12-03 07:30:00',189,134, 1999.00,'SCHEDULED','T1','G8',1,'Kolkata'),
  (39,'HA745',2,'Ranchi','Bengaluru','2026-12-03 10:30:00','2026-12-03 15:00:00',180, 78, 2299.00,'SCHEDULED','T1','G9',1,'Hyderabad'),
  -- Dec 4 Thu — moderate weekday
  (40,'HA751',1,'Ranchi','Bengaluru','2026-12-04 01:00:00','2026-12-04 03:20:00',189,189, 4299.00,'SCHEDULED','T1','G1',0,NULL),
  (41,'HA752',2,'Ranchi','Bengaluru','2026-12-04 04:30:00','2026-12-04 06:50:00',180,180, 5799.00,'SCHEDULED','T1','G3',0,NULL),
  (42,'HA753',1,'Ranchi','Bengaluru','2026-12-04 09:30:00','2026-12-04 11:50:00',189,159, 6499.00,'SCHEDULED','T2','G5',0,NULL),
  (43,'HA754',2,'Ranchi','Bengaluru','2026-12-04 03:00:00','2026-12-04 07:30:00',180,103, 2999.00,'SCHEDULED','T1','G7',1,'Chennai'),
  -- Dec 5 Sat — EXISTS (IDs 17–21, all non-stop)
  -- Dec 6 Sun — expensive weekend
  (44,'HA761',1,'Ranchi','Bengaluru','2026-12-06 01:00:00','2026-12-06 03:20:00',189,189,10999.00,'SCHEDULED','T1','G1',0,NULL),
  (45,'HA762',2,'Ranchi','Bengaluru','2026-12-06 04:30:00','2026-12-06 06:50:00',180,180,13499.00,'SCHEDULED','T1','G3',0,NULL),
  (46,'HA763',1,'Ranchi','Bengaluru','2026-12-06 09:30:00','2026-12-06 11:50:00',189,131, 9499.00,'SCHEDULED','T2','G5',0,NULL),
  (47,'HA764',2,'Ranchi','Bengaluru','2026-12-06 03:00:00','2026-12-06 07:30:00',180, 62, 7499.00,'SCHEDULED','T1','G7',1,'Hyderabad'),
  -- Dec 7 Mon — moderate weekday (Ranchi→Bengaluru added alongside existing Mumbai/Delhi flights)
  (48,'HA771',2,'Ranchi','Bengaluru','2026-12-07 01:00:00','2026-12-07 03:20:00',180,180, 4499.00,'SCHEDULED','T1','G2',0,NULL),
  (49,'HA772',1,'Ranchi','Bengaluru','2026-12-07 04:30:00','2026-12-07 06:50:00',189,189, 5999.00,'SCHEDULED','T1','G4',0,NULL),
  (50,'HA773',2,'Ranchi','Bengaluru','2026-12-07 07:30:00','2026-12-07 09:50:00',180,160, 6799.00,'SCHEDULED','T2','G6',0,NULL),
  (51,'HA774',1,'Ranchi','Bengaluru','2026-12-07 09:30:00','2026-12-07 11:50:00',189,140, 5299.00,'SCHEDULED','T1','G8',0,NULL),
  (52,'HA775',2,'Ranchi','Bengaluru','2026-12-07 03:00:00','2026-12-07 07:30:00',180, 93, 3499.00,'SCHEDULED','T1','G9',1,'Kolkata'),
  -- Dec 8 Tue — cheap weekday
  (53,'HA781',1,'Ranchi','Bengaluru','2026-12-08 01:00:00','2026-12-08 03:20:00',189,189, 3799.00,'SCHEDULED','T1','G1',0,NULL),
  (54,'HA782',2,'Ranchi','Bengaluru','2026-12-08 04:30:00','2026-12-08 06:50:00',180,180, 4999.00,'SCHEDULED','T1','G3',0,NULL),
  (55,'HA783',1,'Ranchi','Bengaluru','2026-12-08 07:30:00','2026-12-08 09:50:00',189,153, 5799.00,'SCHEDULED','T2','G5',0,NULL),
  (56,'HA784',2,'Ranchi','Bengaluru','2026-12-08 03:00:00','2026-12-08 07:30:00',180,118, 2799.00,'SCHEDULED','T1','G7',1,'Hyderabad'),
  (57,'HA785',1,'Ranchi','Bengaluru','2026-12-08 10:30:00','2026-12-08 15:00:00',189, 55, 2199.00,'SCHEDULED','T1','G9',1,'Kolkata'),
  -- Dec 9 Wed — EXISTS (IDs 22–26, all non-stop)
  -- Dec 10 Thu — moderate weekday
  (58,'HA791',2,'Ranchi','Bengaluru','2026-12-10 01:00:00','2026-12-10 03:20:00',180,180, 4499.00,'SCHEDULED','T1','G2',0,NULL),
  (59,'HA792',1,'Ranchi','Bengaluru','2026-12-10 04:30:00','2026-12-10 06:50:00',189,189, 5999.00,'SCHEDULED','T1','G4',0,NULL),
  (60,'HA793',2,'Ranchi','Bengaluru','2026-12-10 09:30:00','2026-12-10 11:50:00',180,148, 6499.00,'SCHEDULED','T2','G6',0,NULL),
  (61,'HA794',1,'Ranchi','Bengaluru','2026-12-10 03:00:00','2026-12-10 07:30:00',189, 97, 3199.00,'SCHEDULED','T1','G8',1,'Chennai'),
  -- Dec 11 Fri — slightly higher
  (62,'HA801',1,'Ranchi','Bengaluru','2026-12-11 01:00:00','2026-12-11 03:20:00',189,189, 5999.00,'SCHEDULED','T1','G1',0,NULL),
  (63,'HA802',2,'Ranchi','Bengaluru','2026-12-11 04:30:00','2026-12-11 06:50:00',180,180, 7499.00,'SCHEDULED','T1','G3',0,NULL),
  (64,'HA803',1,'Ranchi','Bengaluru','2026-12-11 09:30:00','2026-12-11 11:50:00',189,136, 8299.00,'SCHEDULED','T2','G5',0,NULL),
  (65,'HA804',2,'Ranchi','Bengaluru','2026-12-11 03:00:00','2026-12-11 07:30:00',180, 84, 4499.00,'SCHEDULED','T1','G7',1,'Hyderabad'),
  -- Dec 12 Sat — expensive weekend
  (66,'HA811',2,'Ranchi','Bengaluru','2026-12-12 01:00:00','2026-12-12 03:20:00',180,180, 9499.00,'SCHEDULED','T1','G2',0,NULL),
  (67,'HA812',1,'Ranchi','Bengaluru','2026-12-12 04:30:00','2026-12-12 06:50:00',189,189,12499.00,'SCHEDULED','T1','G4',0,NULL),
  (68,'HA813',2,'Ranchi','Bengaluru','2026-12-12 09:30:00','2026-12-12 11:50:00',180,122,13999.00,'SCHEDULED','T2','G6',0,NULL),
  (69,'HA814',1,'Ranchi','Bengaluru','2026-12-12 03:00:00','2026-12-12 07:30:00',189, 47, 6999.00,'SCHEDULED','T1','G8',1,'Kolkata'),
  -- Dec 13 Sun — expensive weekend
  (70,'HA821',1,'Ranchi','Bengaluru','2026-12-13 01:00:00','2026-12-13 03:20:00',189,189,11499.00,'SCHEDULED','T1','G1',0,NULL),
  (71,'HA822',2,'Ranchi','Bengaluru','2026-12-13 04:30:00','2026-12-13 06:50:00',180,180,14999.00,'SCHEDULED','T1','G3',0,NULL),
  (72,'HA823',1,'Ranchi','Bengaluru','2026-12-13 09:30:00','2026-12-13 11:50:00',189,108,10499.00,'SCHEDULED','T2','G5',0,NULL),
  (73,'HA824',2,'Ranchi','Bengaluru','2026-12-13 03:00:00','2026-12-13 07:30:00',180,  9, 7499.00,'SCHEDULED','T1','G7',1,'Chennai'),
  -- Dec 14 Mon — moderate weekday
  (74,'HA831',2,'Ranchi','Bengaluru','2026-12-14 01:00:00','2026-12-14 03:20:00',180,180, 4699.00,'SCHEDULED','T1','G2',0,NULL),
  (75,'HA832',1,'Ranchi','Bengaluru','2026-12-14 04:30:00','2026-12-14 06:50:00',189,189, 6199.00,'SCHEDULED','T1','G4',0,NULL),
  (76,'HA833',2,'Ranchi','Bengaluru','2026-12-14 09:30:00','2026-12-14 11:50:00',180,161, 5799.00,'SCHEDULED','T2','G6',0,NULL),
  (77,'HA834',1,'Ranchi','Bengaluru','2026-12-14 03:00:00','2026-12-14 07:30:00',189, 74, 3499.00,'SCHEDULED','T1','G8',1,'Hyderabad'),
  -- Dec 15 Tue — cheap weekday
  (78,'HA841',1,'Ranchi','Bengaluru','2026-12-15 01:00:00','2026-12-15 03:20:00',189,189, 3499.00,'SCHEDULED','T1','G1',0,NULL),
  (79,'HA842',2,'Ranchi','Bengaluru','2026-12-15 04:30:00','2026-12-15 06:50:00',180,180, 4799.00,'SCHEDULED','T1','G3',0,NULL),
  (80,'HA843',1,'Ranchi','Bengaluru','2026-12-15 09:30:00','2026-12-15 11:50:00',189,143, 5499.00,'SCHEDULED','T2','G5',0,NULL),
  (81,'HA844',2,'Ranchi','Bengaluru','2026-12-15 03:00:00','2026-12-15 07:30:00',180,117, 2299.00,'SCHEDULED','T1','G7',1,'Kolkata');

-- Sample Employees
INSERT IGNORE INTO employees (id, employee_id, first_name, last_name, job_role, department, email, phone, hire_date, salary, status, created_at)
VALUES
  (1, 'EMP001', 'Rajesh',  'Kumar',   'PILOT',            'FLIGHT_OPERATIONS', 'rajesh.kumar@horizon.com',  '+911111111111', '2019-03-15', 250000.00, 'ACTIVE', NOW()),
  (2, 'EMP002', 'Priya',   'Nair',    'CO_PILOT',         'FLIGHT_OPERATIONS', 'priya.nair@horizon.com',    '+912222222222', '2020-06-01', 180000.00, 'ACTIVE', NOW()),
  (3, 'EMP003', 'Anita',   'Desai',   'FLIGHT_ATTENDANT', 'FLIGHT_OPERATIONS', 'anita.desai@horizon.com',   '+913333333333', '2021-01-10', 85000.00,  'ACTIVE', NOW()),
  (4, 'EMP004', 'Vikram',  'Singh',   'GROUND_STAFF',     'GROUND_OPERATIONS', 'vikram.singh@horizon.com',  '+914444444444', '2022-07-20', 55000.00,  'ACTIVE', NOW());

-- Fix HA705 time: 19:00 UTC = 00:30 IST next day → move to 12:30 UTC = 18:00 IST (6 PM Dec 5)
UPDATE flights SET departure_time='2026-12-05 12:30:00', arrival_time='2026-12-05 14:50:00'
WHERE id=21 AND flight_number='HA705';

-- Fix HA715 time: 18:30 UTC = 00:00 IST Dec 10 → move to 13:00 UTC = 18:30 IST Dec 9
UPDATE flights SET departure_time='2026-12-09 13:00:00', arrival_time='2026-12-09 15:20:00'
WHERE id=26 AND flight_number='HA715';
