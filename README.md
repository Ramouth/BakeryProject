# CrumbCompass: Bakery Review System

A full-stack web application for reviewing bakeries and pastries in Copenhagen.

## Project Structure

This project follows the MVVM (Model-View-ViewModel) architecture pattern and is organized as follows:

### Backend (Flask)

- **Models**: Define database schemas and relationships
- **Views**: Flask blueprints handling HTTP requests
- **Services**: Business logic layer
- **Schemas**: Data serialization/deserialization
- **Utils**: Helper functions and utilities

### Frontend (React)

- **Components**: Reusable UI components
- **Views**: Page components
- **Store**: State management (Context API)
- **Services**: API communication layer

## Features

- Bakery management (create, read, update, delete)
- Pastry management linked to bakeries
- Reviews for both bakeries and pastries
- User authentication and authorization
- Admin dashboard for data management
- Optimized performance with caching

## Technology Stack

### Backend
- Python 3.10+
- Flask (Web framework)
- SQLAlchemy (ORM)
- Flask-Marshmallow (Serialization)
- Flask-Caching (Performance optimization)
- SQLite 

### Frontend
- React 19
- React Router v7
- Context API for state management
- Vite as build tool

## Performance Optimizations

- **Backend**:
  - Database query optimization
  - Response caching
  - Efficient SQL relationships
  - Blueprints for modular code organization

- **Frontend**:
  - Code splitting with lazy loading
  - Memoization for expensive calculations
  - Client-side caching for API requests
  - Optimistic UI updates
  - Debounced API calls

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 8+
- (Optional) Docker and Docker Compose

### Running with Docker
```bash
# Clone the repository
git clone https://github.com/xxx
cd crumbcompass

# Start the application
docker-compose up
```

### Running Locally

#### Backend
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

#### Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

### Bakeries
- GET `/bakeries` - Get all bakeries
- GET `/bakeries/:id` - Get bakery by ID
- POST `/bakeries/create` - Create a bakery
- PATCH `/bakeries/update/:id` - Update a bakery
- DELETE `/bakeries/delete/:id` - Delete a bakery

### Pastries
- GET `/pastries` - Get all pastries
- GET `/pastries/:id` - Get pastry by ID
- GET `/pastries/bakery/:bakeryId` - Get pastries by bakery
- POST `/pastries/create` - Create a pastry
- PATCH `/pastries/update/:id` - Update a pastry
- DELETE `/pastries/delete/:id` - Delete a pastry

### Reviews
- GET `/bakeryreviews` - Get all bakery reviews
- GET `/bakeryreviews/bakery/:bakeryId` - Get reviews by bakery
- POST `/bakeryreviews/create` - Create a bakery review
- PATCH `/bakeryreviews/update/:id` - Update a bakery review
- DELETE `/bakeryreviews/delete/:id` - Delete a bakery review

- GET `/pastryreviews` - Get all pastry reviews
- GET `/pastryreviews/pastry/:pastryId` - Get reviews by pastry
- POST `/pastryreviews/create` - Create a pastry review
- PATCH `/pastryreviews/update/:id` - Update a pastry review
- DELETE `/pastryreviews/delete/:id` - Delete a pastry review

### Contacts
- GET `/contacts` - Get all contacts/users
- GET `/contacts/:id` - Get contact by ID
- POST `/contacts/create` - Create a contact
- PATCH `/contacts/update/:id` - Update a contact
- DELETE `/contacts/delete/:id` - Delete a contact

## Contributors

This project was created as a student project at DTU.