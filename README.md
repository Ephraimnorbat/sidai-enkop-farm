# Sidai Enkop Ranch Management System

A modern farm management system built for Sidai Enkop Ranch in Isinya, Kitengela. Features comprehensive animal tracking with QR code generation, authentication, and a futuristic dark UI.

## Tech Stack

- **Backend**: Django REST Framework
- **Frontend**: Next.js 14 with TypeScript
- **Authentication**: Django REST Token Authentication + Session-based Auth
- **Database**: SQLite (development)
- **QR Codes**: Python qrcode library
- **Styling**: Tailwind CSS with custom cyber theme

## Features

### Authentication
- User registration and login
- Token-based API authentication
- Session-based authentication for CSRF protection
- Secure logout functionality

### Animal Management
- Animal registration with auto-generated IDs (format: CMJ/001)
- QR code generation with all animal data
- Parent-child relationship tracking
- Health status monitoring
- Search and filter functionality
- Comprehensive animal profiles

### QR Code System
- Auto-generated QR codes for each animal
- Downloadable QR code images
- Contains all animal information including parentage
- Farm branding included

### Modern UI
- Futuristic dark theme with cyber aesthetics
- Responsive design for mobile and desktop
- Animated components and hover effects
- Professional gradients and glowing borders

## Getting Started

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start development server:
   ```bash
   python manage.py runserver
   ```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `GET /api/auth/csrf-token/` - Get CSRF token

### Animals
- `GET /api/api/animals/` - List animals (with filtering)
- `POST /api/api/animals/` - Create animal
- `GET /api/api/animals/{id}/` - Get animal details
- `PUT /api/api/animals/{id}/` - Update animal
- `DELETE /api/api/animals/{id}/` - Delete animal
- `GET /api/api/animals/{id}/qr_code/` - Download QR code
- `GET /api/api/animals/statistics/` - Get farm statistics
- `GET /api/api/animals/parents/` - Get potential parents

## Animal ID Format

Animals are automatically assigned IDs in the format: `[Species][Sex][Breed]/[Number]`

Examples:
- `CMJ/001` - Cow, Male, Jersey, #001
- `CFH/012` - Cow, Female, Holstein, #012

## Development Notes

### Database Models

#### Animal Model
- `animal_id`: Auto-generated unique identifier
- `name`: Animal name
- `sex`: Male/Female
- `breed`: Jersey, Holstein, Guernsey, Ayrshire, Brown Swiss, Zebu, Crossbreed
- `year_of_birth`: Birth year
- `father/mother`: Optional parent relationships
- `weight`: Optional weight in kg
- `health_status`: Current health status
- `notes`: Additional notes
- `qr_code`: Generated QR code image

### Security Features
- CORS protection configured
- CSRF protection for session-based requests
- Token-based authentication for API calls
- Secure cookie handling
- Input validation and sanitization

### QR Code Data
Each QR code contains JSON data with:
- Animal ID, name, sex, breed
- Year of birth and calculated age
- Parent information (if available)
- Weight and health status
- Farm identification

## Deployment

### Backend Deployment
1. Set `DEBUG=False` in production
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure media file handling
5. Set secure `SECRET_KEY`

### Frontend Deployment to Vercel

1. **Prepare your repository**
   - Push your code to a GitHub/GitLab/Bitbucket repository

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" → "Project"
   - Import your repository
   - Configure project settings:
     - Framework Preset: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm ci`

3. **Configure Environment Variables**
   In your Vercel project settings, add these environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://sidai-enkop-farm.onrender.com
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Your site will be available at `https://your-project.vercel.app`

### Environment Variables

For local development, create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Other environment variables
NODE_ENV=development
```

For production, set these variables in your Vercel project settings.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software for Sidai Enkop Ranch.

---

Built with ❤️ for modern farm management in Kenya.
