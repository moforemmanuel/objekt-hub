# 🚀 ObjektHub

A full-stack object management system with real-time synchronization across web and mobile platforms.

## 📋 Project Overview

**ObjektHub** is a modern monorepo application featuring:

- **API**: NestJS REST API with Socket.IO for real-time updates
- **Web App**: Next.js 16 with shadcn/ui components
- **Mobile App**: React Native with Expo and Gluestack UI

## 🏗️ Tech Stack

### Backend (API)
- **Framework**: NestJS + TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Storage**: Backblaze B2 (S3-compatible)
- **Validation**: class-validator + class-transformer
- **Authentication**: JWT

### Web
- **Framework**: Next.js 16 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Real-time**: Socket.IO Client

### Mobile
- **Framework**: React Native + Expo
- **Router**: Expo Router
- **UI**: Gluestack UI
- **Real-time**: Socket.IO Client

## 📦 Monorepo Structure

```
objekt-hub/
├── packages/
│   ├── api/              # NestJS API (port 8000)
│   ├── web/              # Next.js app (port 3000)
│   └── mobile/           # Expo app
├── .husky/               # Git hooks
├── eslint.config.mjs     # Shared ESLint config
├── .prettierrc           # Shared Prettier config
├── commitlint.config.mjs # Commit message linting
├── pnpm-workspace.yaml   # PNPM workspace config
└── package.json          # Root package with scripts
```

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22 or higher ([Download](https://nodejs.org/))
- **pnpm**: v10 or higher
  ```bash
  npm install -g pnpm@latest
  ```
- **MongoDB**: Local installation or MongoDB Atlas account
  ```bash
  # macOS (Homebrew)
  brew tap mongodb/brew
  brew install mongodb-community

  # Ubuntu/Debian
  sudo apt-get install mongodb

  # Or use Docker
  docker run -d -p 27017:27017 --name mongodb mongo:latest
  ```
- **Backblaze B2 Account**: For S3-compatible storage ([Sign up](https://www.backblaze.com/b2/sign-up.html))
- **Expo Go**: On your mobile device for testing ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 📥 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd objekt-hub
```

### 2. Install dependencies
```bash
pnpm install
```

This will install all dependencies for the root and all packages.

### 3. Set up environment variables

#### API Environment
```bash
cp packages/api/.env.example packages/api/.env
```

Edit `packages/api/.env` with your actual values:
- MongoDB connection string
- JWT secret
- Backblaze B2 credentials (endpoint, access key, secret key, bucket name)

#### Web Environment
```bash
cp packages/web/.env.local.example packages/web/.env.local
```

Edit if needed (defaults should work for local development).

#### Mobile Environment
```bash
cp packages/mobile/.env.example packages/mobile/.env
```

For physical device testing, update `EXPO_PUBLIC_API_URL` with your computer's IP address.

### 4. Initialize Husky (Git Hooks)
```bash
pnpm prepare
```

This sets up pre-commit hooks for linting and formatting.

## 🏃 Running the Application

### Start all services (parallel)
```bash
pnpm dev
```

This starts:
- API at [http://localhost:8000](http://localhost:8000)
- Web at [http://localhost:3000](http://localhost:3000)
- Mobile with Expo QR code

### Start services individually

#### API
```bash
pnpm dev:api
```

#### Web
```bash
pnpm dev:web
```

#### Mobile
```bash
pnpm dev:mobile
```

Scan the QR code with:
- **iOS**: Camera app or Expo Go
- **Android**: Expo Go app

## 🔧 Available Scripts

### Development
- `pnpm dev` - Start all services in parallel
- `pnpm dev:api` - Start API only
- `pnpm dev:web` - Start web app only
- `pnpm dev:mobile` - Start mobile app only

### Build
- `pnpm build` - Build API and web app
- `pnpm build:api` - Build API only
- `pnpm build:web` - Build web app only

### Code Quality
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Lint and auto-fix issues
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without changes
- `pnpm type-check` - Run TypeScript type checking

### Cleanup
- `pnpm clean` - Remove all node_modules
- `pnpm clean:build` - Remove all build artifacts

## 📡 API Endpoints

### Objects
- `POST /objects` - Create new object (with image upload)
- `GET /objects` - List all objects (with pagination)
- `GET /objects/:id` - Get single object
- `DELETE /objects/:id` - Delete object (and S3 image)

### Users
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /users/profile` - Get user profile (authenticated)
- `PATCH /users/profile` - Update user profile (authenticated)

### WebSocket Events
- `object:created` - Emitted when object is created
- `object:deleted` - Emitted when object is deleted

## 🌐 Environment Variables

### API (.env)
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/objekthub
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com
S3_ACCESS_KEY=your_key_id
S3_SECRET_KEY=your_application_key
S3_BUCKET=your-bucket-name
S3_REGION=us-west-004
CORS_ORIGIN=http://localhost:3000,exp://*
```

### Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

### Mobile (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SOCKET_URL=http://localhost:8000
```

## 🧪 Testing

### Testing on Physical Device

1. Ensure your mobile device and computer are on the same network
2. Update `packages/mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000
   EXPO_PUBLIC_SOCKET_URL=http://YOUR_COMPUTER_IP:8000
   ```
3. Find your IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig
   ```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker start mongodb
```

### Mobile App Can't Connect
- Ensure API is running
- Check firewall settings
- Verify correct IP address in `.env`
- Try using `http://` not `https://`

### Port Already in Use
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port in packages/api/.env
PORT=8001
```

## 📚 Project Features

### Core Features
- ✅ Create objects with image upload
- ✅ List objects with pagination
- ✅ View object details
- ✅ Delete objects
- ✅ Real-time sync across clients
- ✅ User authentication
- ✅ Image storage with Backblaze B2

### Planned Features
- [ ] Search and filtering
- [ ] Object categories/tags
- [ ] Image optimization
- [ ] Infinite scroll
- [ ] Pull-to-refresh
- [ ] Dark mode

## 🤝 Contributing

### Commit Convention
This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Git Hooks
- **pre-commit**: Runs linting and formatting
- **commit-msg**: Validates commit message format

## 📝 License

ISC

## 👤 Author

Mofor Emmanuel

---

**Happy Coding!** 🚀
