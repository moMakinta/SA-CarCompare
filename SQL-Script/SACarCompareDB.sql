-- Select the database to use
USE SACarCompare;
GO

-- =================================================================
--  1. DROP EXISTING TABLES (for a clean start)
-- =================================================================
PRINT 'Dropping existing tables...';
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS Cars;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Dealers;
GO

-- =================================================================
--  2. CREATE TABLES
-- =================================================================
PRINT 'Creating new tables...';

CREATE TABLE Dealers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Location NVARCHAR(150) NOT NULL,
    ContactDetails NVARCHAR(150) NOT NULL
);

-- UPDATED: Storing plain text passwords for now (NOT FOR PRODUCTION)
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(20) NULL,
    Password NVARCHAR(100) NOT NULL, -- Changed from PasswordHash
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Cars (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Brand NVARCHAR(50) NOT NULL,
    Model NVARCHAR(50) NOT NULL,
    Type NVARCHAR(20) NOT NULL,
    Year INT NOT NULL,
    Price INT NOT NULL,
    Mileage INT NULL,
    FuelType NVARCHAR(20) NOT NULL,
    Transmission NVARCHAR(20) NOT NULL,
    Features NVARCHAR(MAX) NULL,
    Photos NVARCHAR(MAX) NULL,
    DealerId INT NOT NULL,
    FOREIGN KEY (DealerId) REFERENCES Dealers(Id) ON DELETE CASCADE
);

CREATE TABLE Appointments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL, 
    DealerId INT NOT NULL,
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerEmail NVARCHAR(100) NOT NULL,
    CustomerPhone NVARCHAR(20) NULL,
    RequestedDateTime DATETIME2 NOT NULL,
    Message NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (DealerId) REFERENCES Dealers(Id) ON DELETE CASCADE
);

CREATE TABLE Reviews (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DealerId INT NOT NULL,
    UserId INT NOT NULL,
    UserName NVARCHAR(100) NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Text NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (DealerId) REFERENCES Dealers(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- =================================================================
--  3. INSERT SAMPLE DATA
-- =================================================================
PRINT 'Inserting sample dealership data...';
INSERT INTO Dealers (Name, Location, ContactDetails) VALUES
('Toyota Edwin Swales', '120 Edwin Swales VC Dr, Rossburgh', '031 450 4000'),
('Ford Edwin Swales', '80 Edwin Swales VC Dr, Rossburgh', '031 465 1981'),
('McCarthy Toyota Durban North', '65 Chris Hani Rd, Durban North', '031 367 1600'),
('VW Pinetown', '110 Josiah Gumede Rd, Pinetown', '031 717 7800'),
('Ford Umgeni', '128 Umgeni Rd, Greyville', '031 313 0800'),
('Toyota Kingsmead', '65 Masabalala Yengwa Ave, Stamford Hill', '031 337 5531');
GO

--INSERT INTO Dealers (Name, Location, ContactDetails) VALUES ('GWM Haval Durban', '41 Somtseu Rd, Stamford Hill', '031 202 3333');
--INSERT INTO Cars (Brand, Model, Type, Year, Price, Mileage, FuelType, Transmission, Features, Photos, DealerId) VALUES ('Haval', 'H6', 'New', 2025, 600000, 15, 'Petrol', 'Automatic', 'Hybrid', 'https://img-ik.cars.co.za/news-site-za/images/2024/04/Haval-H6-facelift24-2.jpg?tr=w-800,h-500', 7);

--SELECT * FROM DEALERS;
--SELECT * FROM CARS;
PRINT 'Inserting sample user data...';
-- UPDATED: Using plain text passwords
INSERT INTO Users (FirstName, LastName, Email, PhoneNumber, Password) VALUES
('Themba', 'Zulu', 'themba.zulu@example.com', '0821234567', 'password123'),
('Sarah', 'Naidoo', 'sarah.n@example.com', '0717654321', 'password456'),
('John', 'Smith', 'jsmith@example.com', null, 'password789');
GO

PRINT 'Inserting sample car data...';
-- UPDATED: Using your specific vehicle image URLs
INSERT INTO Cars (Brand, Model, Type, Year, Price, Mileage, FuelType, Transmission, Features, Photos, DealerId) VALUES
('Toyota', 'Fortuner 2.8 GD-6', 'New', 2025, 920000, 50, 'Diesel', 'Automatic', '7-Seater,4x4,Leather', 'https://img-ik.cars.co.za/news-site-za/images/2024/12/fortuner-grs-new-lead.jpg?tr=h-500,w-800', 1),
('Ford', 'Everest Sport', 'Demo', 2024, 825000, 12000, 'Diesel', 'Automatic', 'Sunroof,Tow Bar,Cruise Control', 'https://img-ik.cars.co.za/specimages/tr:n-stock_large/fordever3e15_1.jpg?tr=h500,w-800', 2),
('Toyota', 'Corolla Cross 1.8 XR', 'New', 2025, 495000, 100, 'Petrol Hybrid', 'Automatic', 'Hybrid,ABS,Alloys', 'https://storage.googleapis.com/cdn.callacar.co.za/vehicles/new/640/132950/1/132950-1.jpg?tr=h-500,w-800', 3),
('VW', 'T-Cross 1.0 TSI', 'Used', 2023, 360000, 25000, 'Petrol', 'Automatic', 'LED Lights,Park Assist,Bluetooth', 'https://s2-autoesporte.glbimg.com/S19lnZYNx8lJHQt-GpmpglHHBS8=/0x0:1920x1280/924x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_cf9d035bf26b4646b105bd958f32089d/internal_photos/bs/2024/a/n/AIvGWEQ4idFrH2VqjwKA/volkswagen-t-cross-highline-2025-dianteira-esquerda.jpg?tr=h-500,w-800', 4),
('Ford', 'Puma 1.0T', 'New', 2025, 570000, 60, 'Petrol', 'Automatic', 'Digital Dash,B&O Sound', 'https://www.ford.co.uk/content/dam/guxeu/rhd/central/cars/2024-puma/banners/ford-eu-02_PUMA_MCA_ST_Line_Front_34_Static_Desktop-16x9-1440x810.jpg?tr=h-500,w-800', 5),
('Toyota', 'Hilux 2.4 GD-6 Raider', 'Demo', 2024, 610000, 18000, 'Diesel', 'Manual', '4x4,Canopy,Reverse Camera', 'https://img.autotrader.co.za/31462824?tr=h-500,w-800', 6);
GO

PRINT 'Inserting sample appointment and review data...';
-- Sample Appointment for Themba Zulu at VW Pinetown
INSERT INTO Appointments (UserId, DealerId, CustomerName, CustomerEmail, RequestedDateTime, Message)
VALUES (1, 4, 'Themba Zulu', 'themba.zulu@example.com', '2025-09-25 14:00:00', 'Interested in the VW T-Cross');

-- Sample Review for Sarah Naidoo at Toyota Edwin Swales
INSERT INTO Reviews (DealerId, UserId, UserName, Rating, Text)
VALUES (1, 2, 'Sarah Naidoo', 5, 'Excellent service and a great deal on my new Fortuner!');
GO

PRINT 'Database recreation and seeding complete!';

SELECT * FROM Appointments;
SELECT * FROM CARS;
SELECT * FROM DEALERS;
SELECT * FROM REVIEWS;
SELECT * FROM USERS;