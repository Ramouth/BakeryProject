# CrumbCompass: Bakery Review System

A full-stack web application for reviewing bakeries and products in Copenhagen.

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
- product management linked to bakeries
- Reviews for both bakeries and products
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
python -m venv venv # To force 3.12.2: py -3.12 -m venv venv
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

### Products
- GET `/products` - Get all products
- GET `/products/:id` - Get product by ID
- GET `/products/bakery/:bakeryId` - Get products by bakery
- POST `/products/create` - Create a product
- PATCH `/products/update/:id` - Update a product
- DELETE `/products/delete/:id` - Delete a product

### Reviews
- GET `/bakeryreviews` - Get all bakery reviews
- GET `/bakeryreviews/bakery/:bakeryId` - Get reviews by bakery
- POST `/bakeryreviews/create` - Create a bakery review
- PATCH `/bakeryreviews/update/:id` - Update a bakery review
- DELETE `/bakeryreviews/delete/:id` - Delete a bakery review

- GET `/productreviews` - Get all product reviews
- GET `/productreviews/product/:productId` - Get reviews by product
- POST `/productreviews/create` - Create a product review
- PATCH `/productreviews/update/:id` - Update a product review
- DELETE `/productreviews/delete/:id` - Delete a product review

### Users
- GET `/users` - Get all users/users
- GET `/users/:id` - Get user by ID
- POST `/users/create` - Create a user
- PATCH `/users/update/:id` - Update a user
- DELETE `/users/delete/:id` - Delete a user

## Contributors

This project was created as a student project at DTU.
