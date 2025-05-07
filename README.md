# CrumbCompass: Bakery Review System

A full-stack web application for reviewing bakeries and products in Copenhagen.

## Project Structure

This project follows the MVVM (Model-View-ViewModel) architecture pattern and is organized as follows:

### Backend (Flask)

- **Models**: Define database schemas and relationships using SQLAlchemy ORM
- **Views**: Flask blueprints handling HTTP requests (bakery_bp, product_bp, review_bp, user_bp, auth_bp, category_bp)
- **Services**: Business logic layer for each entity (BakeryService, ProductService, etc.)
- **Schemas**: Data serialization/deserialization using Marshmallow
- **Utils**: Helper functions including caching and validation utilities

### Frontend (React)

- **Views**: Page components for different routes (Homepage, BakeryProfile, ProductProfile, etc.)
- **ViewModels**: Business logic for views (useBakeryProfileViewModel, useProductRatingViewModel, etc.)
- **Components**: Reusable UI components organized by purpose:
  - Common: Button, Card, Form, Navigation buttons, etc.
  - Ratings: CookieRating, RatingBar components
  - Admin: AdminBakeryList, AdminProductForm, etc.
  - Other: BookTab, CookieBanner, Modal, etc.
- **Models**: Data models (Bakery, Product, Review, etc.)
- **Store**: State management (UserContext, ReviewContext, NotificationContext)
- **Services**: API communication layer (bakeryService, productService, etc.)
- **Styles**: CSS organized by component and view:
  - Core: variables, base, layout, animations
  - Components: button, card, ratings, admin
  - Views: bakery-profile, product-rankings, etc.
  - Responsive: media queries for different screen sizes

## Features

- Bakery browsing and detailed profiles
- Product browsing by category and subcategory
- Review system for both bakeries and products
- User authentication and profiles
- Cookie-based rating system
- Faceted search with filtering options
- Responsive design for mobile and desktop
- Dark/light mode theme switching
- Admin dashboard for data management
- GDPR-compliant cookie consent

## Technology Stack

### Backend
- Python 3.10+
- Flask (Web framework)
- SQLAlchemy (ORM)
- Flask-Marshmallow (Serialization)
- Flask-Caching (Performance optimization)
- Flask-JWT-Extended (Authentication)
- Flask-CORS (Cross-Origin Resource Sharing)
- SQLite (Database)

### Frontend
- React 19
- React Router v7
- Context API for state management
- Custom MVVM architecture with ViewModels
- Vite as build tool
- Lucide React for icons

## Performance Optimizations

- **Frontend**:
  - Code splitting with lazy loading
  - Memoization for expensive calculations
  - Client-side caching for API requests
  - Optimistic UI updates
  - Debounced API calls
  - Component memoization to prevent unnecessary renders
  - Conditional rendering for performance-heavy components
  - Batched API requests for related data

- **Backend**:
  - Database query optimization
  - Response caching with Flask-Caching
  - Efficient SQL relationships
  - Blueprints for modular code organization
  - Transaction support in service layer

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
Mac/Linux: python3 -m venv venv       # Windows python -m venv venv     #To force 3.12.2: py -3.12 -m venv venv
Mac/Linux: source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
Mac/Linux: python3 app.py
Windows:   python app.py
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
- GET `/bakeries/search` - Search bakeries by name
- GET `/bakeries/:id/stats` - Get bakery statistics
- GET `/bakeries/top` - Get top-rated bakeries

### Products
- GET `/products` - Get all products
- GET `/products/:id` - Get product by ID
- GET `/products/bakery/:bakeryId` - Get products by bakery
- GET `/products/category/:categoryId` - Get products by category
- GET `/products/subcategory/:subcategoryId` - Get products by subcategory
- POST `/products/create` - Create a product
- PATCH `/products/update/:id` - Update a product
- DELETE `/products/delete/:id` - Delete a product
- GET `/products/search` - Search products by name
- GET `/products/:id/stats` - Get product statistics

### Reviews
- GET `/bakeryreviews` - Get all bakery reviews
- GET `/bakeryreviews/bakery/:bakeryId` - Get reviews by bakery
- GET `/bakeryreviews/user/:userId` - Get bakery reviews by user
- POST `/bakeryreviews/create` - Create a bakery review
- PATCH `/bakeryreviews/update/:id` - Update a bakery review
- DELETE `/bakeryreviews/delete/:id` - Delete a bakery review

- GET `/productreviews` - Get all product reviews
- GET `/productreviews/product/:productId` - Get reviews by product
- GET `/productreviews/user/:userId` - Get product reviews by user
- POST `/productreviews/create` - Create a product review
- PATCH `/productreviews/update/:id` - Update a product review
- DELETE `/productreviews/delete/:id` - Delete a product review

### Categories
- GET `/categories` - Get all categories
- GET `/categories/:id` - Get category by ID
- POST `/categories/create` - Create a category
- PATCH `/categories/update/:id` - Update a category
- DELETE `/categories/delete/:id` - Delete a category

- GET `/categories/subcategories` - Get all subcategories
- GET `/categories/:id/subcategories` - Get subcategories by category
- GET `/categories/subcategories/:id` - Get subcategory by ID
- POST `/categories/subcategories/create` - Create a subcategory
- PATCH `/categories/subcategories/update/:id` - Update a subcategory
- DELETE `/categories/subcategories/delete/:id` - Delete a subcategory

### Users
- GET `/users` - Get all users
- GET `/users/:id` - Get user by ID
- GET `/users/search` - Search users by username or email
- PATCH `/users/update/:id` - Update a user
- DELETE `/users/delete/:id` - Delete a user
- POST `/users/change-password/:id` - Change user password

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login and get JWT token
- GET `/auth/profile` - Get current user profile (protected)

## Contributors

This project was created as a student project at DTU.
