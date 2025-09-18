# Tourist Safety Mobile App 📱

A React Native mobile application for the Smart Tourist Safety Monitoring System, built as part of SIH 2025 Problem Statement ID: 25002.

## 🚀 Features

### Core Features
- **User Authentication** - Secure registration and login system
- **Digital Tourist ID** - Unique digital identification for every tourist
- **Location Tracking** - Real-time GPS location monitoring
- **Emergency Alerts** - Panic button and emergency notification system
- **Professional UI** - Modern, intuitive interface design

### Safety Features
- **Emergency Types** - Categorized emergency alerts (Panic, Medical, Theft, Other)
- **Location-Based Alerts** - Automatic location inclusion in emergency requests
- **Emergency Contacts** - Quick access to emergency contact information
- **Real-Time Monitoring** - Live location tracking for safety authorities

## 📱 Screenshots

[Screenshots will be added after UI testing]

## 🏗️ Project Structure

```
TouristSafetyApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens/pages
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── DigitalIDScreen.tsx
│   │   └── EmergencyAlertScreen.tsx
│   ├── services/           # API and external services
│   │   ├── api.ts
│   │   └── locationService.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── utils/              # Helper functions
│       └── helpers.ts
├── App.tsx                 # Main app component with navigation
└── package.json           # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.4
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack & Tab)
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Location Services**: react-native-geolocation-service
- **Storage**: AsyncStorage
- **Permissions**: react-native-permissions

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 20+
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Navigate to the mobile app directory**:
   ```bash
   cd mobile/TouristSafetyApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

1. **Start Metro bundler**:
   ```bash
   npm start
   ```

2. **Run on Android**:
   ```bash
   npm run android
   ```

3. **Run on iOS** (macOS only):
   ```bash
   npm run ios
   ```

## 🔧 Configuration

### Backend Connection

Update the API base URL in `src/services/api.ts`:

```typescript
// For development
const BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// const BASE_URL = 'http://localhost:5000/api'; // iOS simulator

// For production
// const BASE_URL = 'https://your-production-api.com/api';
```

### Location Permissions

The app requests location permissions automatically. Make sure to:
1. Grant location permissions when prompted
2. Enable location services on your device
3. For testing, use a physical device or emulator with location enabled

## 📋 Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🌐 API Integration

The mobile app connects to the backend API with the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Emergency (Planned)
- `POST /api/emergency/alert` - Send emergency alert
- `GET /api/emergency/history` - Get alert history

### Location (Planned)
- `POST /api/location/update` - Update user location
- `GET /api/location/history` - Get location history

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Security** - Passwords are hashed using bcrypt
- **Location Encryption** - Location data is transmitted securely
- **Data Validation** - Input validation on all forms
- **Error Handling** - Comprehensive error handling and user feedback

## 📱 Platform Support

- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 11.0+

## 🐛 Common Issues & Solutions

### Android Emulator Location Issues
```bash
# Enable location in Android emulator
# Go to Settings > Location > Use location: ON
# In Android Studio AVD Manager, set GPS coordinates
```

### Metro Bundler Issues
```bash
# Reset Metro cache
npx react-native start --reset-cache
```

### Android Build Issues
```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## 🚀 Deployment

### Android APK Build
```bash
cd android
./gradlew assembleRelease
```

### iOS Archive (macOS only)
- Open `ios/TouristSafetyApp.xcworkspace` in Xcode
- Select "Product" > "Archive"
- Follow iOS distribution process

## 📈 Development Roadmap

### Phase 1 ✅ (Current)
- [x] User authentication system
- [x] Digital ID display
- [x] Basic location services
- [x] Emergency alert interface
- [x] Professional UI design

### Phase 2 🔄 (In Progress)
- [ ] Real-time location tracking
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Enhanced emergency features

### Phase 3 📋 (Planned)
- [ ] AI-powered safety suggestions
- [ ] Social features for groups
- [ ] Integration with local authorities
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for SIH 2025 and is part of the Smart Tourist Safety Monitoring System.

## 👥 Team

- **Project**: SIH 2025 - Problem Statement ID: 25002
- **Category**: Smart Tourist Safety Monitoring
- **Tech Stack**: React Native, TypeScript, Node.js

## 📞 Support

For issues and questions:
1. Check the [Common Issues](#-common-issues--solutions) section
2. Create an issue in the project repository
3. Contact the development team

---

**Built with ❤️ for safer travels** 🌍✈️
