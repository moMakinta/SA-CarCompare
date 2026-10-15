# SA-CarCompare

**SA-CarCompare** is a specialized ASP.NET Core web application designed to help drivers in KwaZulu-Natal (KZN) explore, compare, and finance brand-new and dealer-demo vehicles. The platform simplifies the car-buying journey by integrating vehicle comparisons, financial planning tools, and local dealer appointment scheduling into one centralized hub.

---

## Features

* **Vehicle Catalog:** Browse and compare new and demo vehicles (specifically designated for test-drive purposes).
* **Financial Planning:** Integrated tools to assist users with calculating vehicle finance options and budgeting.
* **Dealer Locator & Booking:** Find the nearest accredited dealerships in **KZN** and book test-drive or consultation appointments directly.
* **Region-Locked Scope:** Tailored exclusively to KwaZulu-Natal (KZN) dealerships to ensure hyper-local accuracy and availability.

---

## Tech Stack

* **Framework:** ASP.NET Core (.NET 8)
* **Architecture:** MVC (Model-View-Controller)
* **Database:** SQL Server (Scripts located in the `SQL-Script` directory)
* **Frontend:** HTML5, CSS3, JavaScript (`wwwroot`)

---

## Project Structure

```text
SA-CarCompare/
├── Controllers/         # Handles incoming HTTP requests and application logic
├── Models/              # Data structures and business entities
├── SQL-Script/          # Database setup and migration scripts
├── Views/               # Razor views (UI layouts and pages)
├── wwwroot/             # Static assets (CSS, JavaScript, images)
├── Program.cs           # Application entry point and service configuration
└── SACarCompare.sln     # Visual Studio Solution file
```
## Getting Started

*Prerequisites*
.NET 8 SDK installed on your machine.

SQL Server (LocalDB or standard instance) for database management.

*Installation & Running Locally*
Clone the repository:
```
Bash
git clone [https://github.com/moMakinta/SA-CarCompare.git](https://github.com/moMakinta/SA-CarCompare.git)
```
Open the project:

Open SACarCompare.sln in Visual Studio or open the root folder in your preferred code editor (e.g., VS Code).

Configure the Database:

Update your connection string in appsettings.json to point to your local SQL Server instance.

Run the provided scripts in the SQL-Script folder to set up the database schema.

Run the Application:

From your terminal, run:
```
Bash
dotnet run
Or press F5 inside Visual Studio.
```
Author
Oregomoditse Motlalepule (Mo) Makinta – GitHub Profile
