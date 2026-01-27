# Flight Booking System - PHP Implementation

## Project Structure

```
php_flight_system/
├── core/                    # Core system classes
│   ├── Database.php        # PDO database connection
│   ├── Router.php          # URL routing system
│   ├── Session.php         # Session management
│   ├── Auth.php            # Authentication & authorization
│   ├── Security.php        # Security utilities (CSRF, XSS, etc.)
│   ├── Validator.php       # Input validation
│   └── Logger.php          # Logging system
├── models/                 # Data models
│   ├── User.php
│   ├── Flight.php
│   ├── Booking.php
│   ├── Payment.php
│   └── Airline.php
├── controllers/            # Business logic controllers
│   ├── AuthController.php
│   ├── FlightController.php
│   ├── BookingController.php
│   ├── AdminController.php
│   └── ApiController.php
├── services/               # Business services
│   ├── PaymentService.php
│   ├── WhatsAppService.php
│   ├── EmailService.php
│   ├── NotificationService.php
│   └── FinancialService.php
├── views/                  # HTML templates
│   ├── layouts/
│   │   ├── header.php
│   │   └── footer.php
│   ├── auth/
│   │   ├── login.php
│   │   └── register.php
│   ├── flights/
│   │   ├── search.php
│   │   └── booking.php
│   └── admin/
│       ├── dashboard.php
│       └── flights.php
├── api/                    # REST API endpoints
│   ├── v1/
│   │   ├── flights.php
│   │   ├── bookings.php
│   │   └── payments.php
├── public/                 # Public web root
│   ├── index.php          # Main entry point
│   ├── assets/            # Static files (CSS, JS, images)
│   ├── uploads/           # User uploaded files
│   └── .htaccess          # URL rewriting
├── config/                # Configuration files
│   ├── database.php
│   ├── app.php
│   └── routes.php
├── lang/                  # Language files
│   ├── en.php
│   └── ar.php
├── logs/                  # Application logs
└── uploads/               # File uploads
    ├── passports/
    ├── logos/
    └── pdfs/
```

## Architecture Overview

### MVC Pattern (Custom Implementation)
- **Models**: Handle data operations and business logic
- **Views**: HTML templates with embedded PHP
- **Controllers**: Handle HTTP requests and responses

### Core Components
- **Database**: PDO with prepared statements for security
- **Router**: Custom URL routing for web and API
- **Session**: Manual session management with security
- **Auth**: Role-based authentication system
- **Security**: CSRF protection, XSS prevention, input sanitization

### Key Features
- Multi-user system (Admin, Customer, Supplier, Agent)
- Flight search and booking
- Payment gateway integration
- WhatsApp notifications
- Financial accounting system
- Multi-language support (Arabic/English)
- RTL/LTR layout support

## Security Measures
- PDO prepared statements against SQL injection
- CSRF tokens for form protection
- XSS prevention through input sanitization
- Password hashing with password_hash()
- Session security with regeneration
- File upload validation
- Role-based access control

## Database Schema
See `database_schema.sql` for complete MySQL schema with all tables and relationships.

## Installation
1. Create MySQL database
2. Import `database_schema.sql`
3. Configure database connection in `config/database.php`
4. Set up web server to point to `public/` directory
5. Ensure PHP 8.0+ with PDO MySQL extension

## Usage
- Web interface: Access through browser
- API endpoints: `/api/v1/` prefix
- Admin panel: `/admin/` routes
- Agent API: Separate authentication for agents