# Medicine Donation Platform

A web application that connects medicine manufacturers with those in need through donations. The platform allows manufacturers to list their medicines and users to request donations.

## Features

- User authentication (register/login)
- Role-based access (users, manufacturers, admin)
- Medicine listing and donation system
- Manufacturer profiles with verification
- Modern and responsive UI
- Secure API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/medicine-donation-platform.git
cd medicine-donation-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/medicine-donation
JWT_SECRET=your-secret-key-here
```

4. Start MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo service mongod start
```

5. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Users
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/profile` - Get user profile
- PATCH `/api/users/profile` - Update user profile

### Medicines
- GET `/api/medicines` - Get all medicines
- GET `/api/medicines/:id` - Get single medicine
- POST `/api/medicines` - Create new medicine (manufacturer only)
- PATCH `/api/medicines/:id` - Update medicine
- DELETE `/api/medicines/:id` - Delete medicine
- POST `/api/medicines/:id/donate` - Donate medicine

### Manufacturers
- GET `/api/manufacturers` - Get all manufacturers
- GET `/api/manufacturers/:id` - Get single manufacturer
- POST `/api/manufacturers` - Create manufacturer profile
- PATCH `/api/manufacturers/:id` - Update manufacturer profile
- PATCH `/api/manufacturers/:id/verify` - Verify manufacturer (admin only)
- DELETE `/api/manufacturers/:id` - Delete manufacturer (admin only)

## Technologies Used

- Backend:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - bcrypt for password hashing

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Bootstrap 5
  - Font Awesome icons

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Bootstrap for the UI components
- Font Awesome for the icons
- MongoDB for the database
- Express.js for the web framework 