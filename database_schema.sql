-- Flight Booking System Database Schema
-- MySQL 8.0+ Compatible
-- Created for PHP-based flight booking system without frameworks

-- Create database
CREATE DATABASE IF NOT EXISTS flight_booking_system
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE flight_booking_system;

-- ===========================================
-- CORE SYSTEM TABLES
-- ===========================================

-- System Settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Currencies
CREATE TABLE currencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(3) UNIQUE NOT NULL, -- USD, EUR, SAR, etc.
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Languages
CREATE TABLE languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(5) UNIQUE NOT NULL, -- en, ar, en-US, ar-SA
    name VARCHAR(100) NOT NULL,
    is_rtl BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- USER MANAGEMENT
-- ===========================================

-- User Roles
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL, -- admin, customer, supplier, agent
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON, -- Store permissions as JSON array
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    profile_image VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language_id INT DEFAULT 1,
    preferred_currency_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES user_roles(id),
    FOREIGN KEY (preferred_language_id) REFERENCES languages(id),
    FOREIGN KEY (preferred_currency_id) REFERENCES currencies(id)
);

-- User Sessions (Manual Session Management)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- ===========================================
-- AIRLINE MANAGEMENT
-- ===========================================

-- Airlines
CREATE TABLE airlines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(3) UNIQUE NOT NULL, -- IATA code like EK, QR, etc.
    logo VARCHAR(255),
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    currency_id INT NOT NULL,
    booking_policy TEXT, -- JSON with policies
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (currency_id) REFERENCES currencies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Airline Suppliers (Many-to-many relationship)
CREATE TABLE airline_suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    airline_id INT NOT NULL,
    supplier_id INT NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_airline_supplier (airline_id, supplier_id)
);

-- ===========================================
-- FLIGHT MANAGEMENT
-- ===========================================

-- Airports
CREATE TABLE airports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4),
    timezone VARCHAR(50),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flights
CREATE TABLE flights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    airline_id INT NOT NULL,
    flight_number VARCHAR(10) NOT NULL,
    departure_airport_id INT NOT NULL,
    arrival_airport_id INT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    duration INT NOT NULL, -- Duration in minutes
    aircraft_type VARCHAR(50),
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    currency_id INT NOT NULL,
    flight_type ENUM('one_way', 'round_trip') DEFAULT 'one_way',
    return_flight_id INT NULL, -- For round trip flights
    status ENUM('active', 'cancelled', 'delayed', 'completed') DEFAULT 'active',
    visa_required BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (airline_id) REFERENCES airlines(id),
    FOREIGN KEY (departure_airport_id) REFERENCES airports(id),
    FOREIGN KEY (arrival_airport_id) REFERENCES airports(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id),
    FOREIGN KEY (return_flight_id) REFERENCES flights(id),
    FOREIGN KEY (created_by) REFERENCES users(id),

    INDEX idx_departure_time (departure_time),
    INDEX idx_departure_airport (departure_airport_id),
    INDEX idx_arrival_airport (arrival_airport_id),
    INDEX idx_flight_number (flight_number)
);

-- Flight Classes/Seats
CREATE TABLE flight_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    flight_id INT NOT NULL,
    class_name VARCHAR(50) NOT NULL, -- Economy, Business, First
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    baggage_allowance INT DEFAULT 20, -- kg
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);

-- ===========================================
-- BOOKING SYSTEM
-- ===========================================

-- Bookings
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    flight_class_id INT NOT NULL,
    passenger_count INT DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    currency_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded', 'failed') DEFAULT 'unpaid',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL, -- For pending bookings
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id),
    FOREIGN KEY (flight_class_id) REFERENCES flight_classes(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id),

    INDEX idx_booking_number (booking_number),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date)
);

-- Booking Passengers
CREATE TABLE booking_passengers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    passport_number VARCHAR(20) UNIQUE,
    passport_expiry DATE,
    passport_image VARCHAR(255),
    nationality VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    seat_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ===========================================
-- PAYMENT SYSTEM
-- ===========================================

-- Payment Gateways
CREATE TABLE payment_gateways (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- stripe, paypal, etc.
    is_active BOOLEAN DEFAULT TRUE,
    config JSON, -- API keys, endpoints, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    gateway_id INT NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency_id INT NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    gateway_response JSON,
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (gateway_id) REFERENCES payment_gateways(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id),

    INDEX idx_transaction_id (transaction_id),
    INDEX idx_booking_id (booking_id)
);

-- ===========================================
-- FINANCIAL SYSTEM
-- ===========================================

-- Accounting Accounts (Chart of Accounts)
CREATE TABLE accounting_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_id) REFERENCES accounting_accounts(id)
);

-- Accounting Entries
CREATE TABLE accounting_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NULL,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    entry_date DATE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Accounting Entry Lines
CREATE TABLE accounting_entry_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entry_id INT NOT NULL,
    account_id INT NOT NULL,
    debit DECIMAL(15,2) DEFAULT 0.00,
    credit DECIMAL(15,2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (entry_id) REFERENCES accounting_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounting_accounts(id)
);

-- Agent Commissions
CREATE TABLE agent_commissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    agent_id INT NOT NULL,
    booking_id INT NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paid_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (agent_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),

    INDEX idx_agent_id (agent_id),
    INDEX idx_status (status)
);

-- ===========================================
-- WHATSAPP INTEGRATION
-- ===========================================

-- WhatsApp Messages
CREATE TABLE whatsapp_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NULL,
    message_id VARCHAR(255) UNIQUE,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    message_type ENUM('text', 'image', 'document') DEFAULT 'text',
    message_content TEXT,
    media_url VARCHAR(500),
    direction ENUM('incoming', 'outgoing') NOT NULL,
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    processed BOOLEAN DEFAULT FALSE,
    extracted_data JSON, -- Parsed booking/ticket data
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,

    FOREIGN KEY (booking_id) REFERENCES bookings(id),

    INDEX idx_message_id (message_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_processed (processed)
);

-- ===========================================
-- NOTIFICATIONS & ALERTS
-- ===========================================

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('email', 'sms', 'whatsapp', 'in_app') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- System Alerts
CREATE TABLE system_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type ENUM('low_seats', 'price_alert', 'no_offers', 'system_health') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    related_flight_id INT NULL,
    related_airline_id INT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (related_flight_id) REFERENCES flights(id),
    FOREIGN KEY (related_airline_id) REFERENCES airlines(id),

    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_is_resolved (is_resolved)
);

-- ===========================================
-- AUDIT LOGS
-- ===========================================

-- Activity Logs
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- booking, flight, user, etc.
    entity_id INT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),

    INDEX idx_user_id (user_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- ===========================================
-- INSERT DEFAULT DATA
-- ===========================================

-- Insert default currencies
INSERT INTO currencies (code, name, symbol, is_default) VALUES
('USD', 'US Dollar', '$', TRUE),
('EUR', 'Euro', '€', FALSE),
('SAR', 'Saudi Riyal', 'ر.س', FALSE),
('AED', 'UAE Dirham', 'د.إ', FALSE);

-- Insert default languages
INSERT INTO languages (code, name, is_rtl, is_default) VALUES
('en', 'English', FALSE, TRUE),
('ar', 'العربية', TRUE, FALSE);

-- Insert default user roles
INSERT INTO user_roles (name, display_name, description, permissions) VALUES
('admin', 'System Administrator', 'Full system access', '["all"]'),
('customer', 'Customer', 'Flight booking access', '["book_flights", "view_bookings", "manage_profile"]'),
('supplier', 'Supplier', 'Flight supply management', '["manage_flights", "view_bookings", "manage_airlines"]'),
('agent', 'Travel Agent', 'Agent booking access', '["book_flights", "view_bookings", "manage_profile", "view_commissions"]');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Flight Booking System', 'string', 'Website name'),
('default_currency', '1', 'integer', 'Default currency ID'),
('default_language', '1', 'integer', 'Default language ID'),
('booking_expiry_hours', '24', 'integer', 'Hours before pending booking expires'),
('max_passengers_per_booking', '9', 'integer', 'Maximum passengers per booking'),
('smtp_host', '', 'string', 'SMTP server host'),
('smtp_port', '587', 'integer', 'SMTP server port'),
('whatsapp_api_url', '', 'string', 'WhatsApp API endpoint'),
('whatsapp_api_key', '', 'string', 'WhatsApp API key');

-- Insert default accounting accounts
INSERT INTO accounting_accounts (account_number, name, type) VALUES
('1000', 'Cash', 'asset'),
('1100', 'Accounts Receivable', 'asset'),
('2000', 'Accounts Payable', 'liability'),
('3000', 'Owner Equity', 'equity'),
('4000', 'Revenue', 'revenue'),
('5000', 'Cost of Sales', 'expense'),
('5100', 'Operating Expenses', 'expense');

-- Create indexes for performance
CREATE INDEX idx_flights_departure_date ON flights (DATE(departure_time));
CREATE INDEX idx_flights_route ON flights (departure_airport_id, arrival_airport_id);
CREATE INDEX idx_bookings_user_status ON bookings (user_id, status);
CREATE INDEX idx_payments_status_date ON payments (status, payment_date);
CREATE INDEX idx_activity_logs_recent ON activity_logs (created_at DESC);