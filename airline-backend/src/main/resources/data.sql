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
  (16, 'HA606', 2, 'Hyderabad', 'Delhi',     '2026-12-07 16:45:00', '2026-12-07 19:15:00', 180, 180, 6499.00,  'SCHEDULED', 'T2', 'G10');

-- Sample Employees
INSERT IGNORE INTO employees (id, employee_id, first_name, last_name, job_role, department, email, phone, hire_date, salary, status, created_at)
VALUES
  (1, 'EMP001', 'Rajesh',  'Kumar',   'PILOT',            'FLIGHT_OPERATIONS', 'rajesh.kumar@horizon.com',  '+911111111111', '2019-03-15', 250000.00, 'ACTIVE', NOW()),
  (2, 'EMP002', 'Priya',   'Nair',    'CO_PILOT',         'FLIGHT_OPERATIONS', 'priya.nair@horizon.com',    '+912222222222', '2020-06-01', 180000.00, 'ACTIVE', NOW()),
  (3, 'EMP003', 'Anita',   'Desai',   'FLIGHT_ATTENDANT', 'FLIGHT_OPERATIONS', 'anita.desai@horizon.com',   '+913333333333', '2021-01-10', 85000.00,  'ACTIVE', NOW()),
  (4, 'EMP004', 'Vikram',  'Singh',   'GROUND_STAFF',     'GROUND_OPERATIONS', 'vikram.singh@horizon.com',  '+914444444444', '2022-07-20', 55000.00,  'ACTIVE', NOW());
