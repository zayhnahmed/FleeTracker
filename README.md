# 🚗 FleeTracker

A production-ready, real-time fleet management mobile application built with React Native, Expo Router, and Firebase. Designed for efficient vehicle tracking, driver management, and trip monitoring.

![React Native](https://img.shields.io/badge/React%20Native-0.76-blue)
![Expo](https://img.shields.io/badge/Expo-~52.0-black)
![Firebase](https://img.shields.io/badge/Firebase-10.14-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

![Banner](screenshots/FleeTrackerBanner.png)

## ✨ Features

### 🚗 Driver Features
- **Real-time Vehicle Assignment** - See assigned vehicles instantly
- **Trip Management** - Start trips, navigate, and return with one tap
- **Trip History** - Complete log of all completed trips
- **Vehicle Requests** - Request available vehicles from masters
- **Status Tracking** - Live updates on vehicle and trip status

### 🏢 Master Features
- **Fleet Overview Dashboard** - Monitor entire fleet in real-time
- **Vehicle Assignment** - Assign vehicles to drivers with destinations
- **Request Management** - Review and approve/reject driver requests
- **Status Filtering** - Filter vehicles by availability, in-transit, etc.
- **Live Statistics** - Real-time fleet metrics and analytics
- **Vehicle Details** - Detailed view with journey timeline

### 🎨 Technical Features
- **Real-time Synchronization** - Firebase Firestore real-time updates
- **Role-Based Access Control** - Driver and Master roles with different permissions
- **Dark Gold Theme** - Professional, eye-friendly UI design
- **Timeline View** - Visual journey tracking (Start → Destination → Return)
- **Offline-First** - Firebase persistence for offline capability
- **Type-Safe** - Full TypeScript implementation with strict mode

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo** | Development platform and tooling |
| **Expo Router** | File-based navigation system |
| **TypeScript** | Type safety and better DX |
| **Firebase Auth** | User authentication |
| **Firebase Firestore** | Real-time NoSQL database |
| **AsyncStorage** | Local data persistence |

---

## 📁 Project Structure
```
fleet-app/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication group
│   │   └── index.tsx             # Login screen
│   ├── (driver)/                 # Driver role group
│   │   ├── driver-dashboard.tsx  # Driver main screen
│   │   └── driver-history.tsx    # Trip history
│   ├── (master)/                 # Master role group
│   │   ├── master-dashboard.tsx  # Fleet overview
│   │   └── vehicle-details.tsx   # Vehicle details & timeline
│   └── _layout.tsx               # Root navigation
│
├── components/                   # Reusable components
│   ├── driver/                   # Driver-specific components
│   │   ├── ActionButton.tsx
│   │   ├── TripCard.tsx
│   │   └── DriverRequestModal.tsx
│   ├── master/                   # Master-specific components
│   │   ├── VehicleCard.tsx
│   │   ├── TimelineView.tsx
│   │   └── RequestApprovalModal.tsx
│   └── shared/                   # Shared components
│       ├── Button.tsx
│       ├── StatusBadge.tsx
│       ├── FilterChips.tsx
│       ├── LoadingSpinner.tsx
│       └── Header.tsx
│
├── services/                     # Business logic & API
│   ├── firebase.ts               # Firebase configuration
│   ├── auth.service.ts           # Authentication logic
│   ├── driver.service.ts         # Driver operations
│   ├── vehicle.service.ts        # Vehicle management
│   └── assignment.service.ts     # Request handling
│
├── types/                        # TypeScript definitions
│   └── index.ts                  # All type definitions
│
├── constants/                    # App constants
│   └── app.constants.ts          # Routes, labels, etc.
│
├── themes/                       # Design system
│   ├── colors.ts                 # Color palette
│   ├── spacing.ts                # Spacing scale
│   ├── radius.ts                 # Border radius
│   ├── textStyles.ts             # Typography
│   └── shadows.ts                # Shadow styles
│
└── firestore.rules               # Firestore security rules
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Firebase Account** ([Sign up](https://firebase.google.com/))

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/fleet-manager.git
   cd fleet-manager
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure Firebase**
   
   a. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   
   b. Enable Email/Password authentication
   
   c. Create a Firestore database
   
   d. Copy `.env.example` to `.env`:
```bash
   cp .env.example .env
```
   
   e. Add your Firebase credentials to `.env`:
```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Set up Firestore**
   
   See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions on:
   - Creating Firestore collections
   - Adding test users
   - Sample vehicle data
   - Security rules deployment

5. **Start the development server**
```bash
   npm start
```

6. **Run on device/simulator**
```bash
   # iOS (Mac only)
   npm run ios
   
   # Android
   npm run android
   
   # Or scan QR code with Expo Go app
```

---

## 🔐 Authentication & Roles

### User Roles

1. **DRIVER**
   - View assigned vehicle
   - Start/end trips
   - Request vehicles
   - View trip history

2. **VEHICLE_MASTER**
   - Monitor entire fleet
   - Assign vehicles to drivers
   - Approve/reject requests
   - View all vehicle details

### Test Accounts

After setup, create these test accounts:
```
Master Account:
Email: master@fleet.com
Password: password123

Driver Account:
Email: driver@fleet.com
Password: password123
```

---

## 📊 Data Models

### Vehicle States Flow
```
AVAILABLE → ASSIGNED → IN_TRANSIT → RETURNING → AVAILABLE
```

### Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users` | User profiles with roles |
| `vehicles` | Vehicle inventory |
| `trip_history` | Completed trips log |
| `vehicle_requests` | Driver vehicle requests |
| `assignments` | Active assignments |
| `notifications` | User notifications |

See [API_REFERENCE.md](./API_REFERENCE.md) for detailed schemas.

---

## 🎨 Design System

### Color Palette
```typescript
Primary: #F6D13A (Gold)
Background: #2D2D2D (Dark)
Surface: #383838 (Elevated)
Text: #F5F5F5 (Light)
```

### Status Colors
```typescript
Available: #4CAF50 (Green)
Assigned: #64B5F6 (Blue)
In Transit: #FF9800 (Orange)
Returning: #8A8A8A (Gray)
```

---

## 🔄 Key Features Explained

### Real-time Updates

All vehicle and assignment data uses Firestore's real-time listeners:
```typescript
// Automatically updates when data changes in Firebase
subscribeToVehicles((vehicles) => {
  setVehicles(vehicles);
});
```

### Timeline View

Visual journey tracking shows:
1. **Start** - Departure from warehouse
2. **Destination** - Delivery location with ETA
3. **Return** - Back to warehouse

### Request/Approval Flow

1. Driver requests vehicle
2. Master receives notification
3. Master approves/rejects
4. If approved, vehicle auto-assigned
5. Driver sees assignment instantly

---

## 📱 Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### iOS App
```bash
# Build for iOS
eas build --platform ios --profile preview
```

See [Expo EAS Build Documentation](https://docs.expo.dev/build/setup/) for detailed instructions.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login as driver
- [ ] Request vehicle
- [ ] Login as master
- [ ] Approve request
- [ ] Verify driver receives assignment
- [ ] Start trip as driver
- [ ] Monitor status change as master
- [ ] Complete trip
- [ ] Verify trip history

---

## 🔒 Security

### Firestore Security Rules

The app includes production-ready security rules:
```javascript
// Example: Drivers can only update their assigned vehicles
allow update: if isDriver() && 
              resource.data.driverId == request.auth.uid;
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Firestore Rules](./firestore.rules) - Security rules

---

## 🐛 Troubleshooting

### Common Issues

**"No available drivers found"**
- Verify driver `currentVehicleId` is `null` in Firestore
- Check `role` is exactly `"DRIVER"` (case-sensitive)
- Ensure `isActive` is `true`

**"No vehicle assigned"**
- Check vehicle `driverId` matches driver's UID
- Verify vehicle `status` is `"ASSIGNED"`

**Login routes to wrong dashboard**
- Verify Firestore document ID matches Firebase Auth UID
- Check `role` field is correct (`"DRIVER"` vs `"VEHICLE_MASTER"`)

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting tips.

---

## 🛣️ Roadmap

- [ ] Push notifications for assignments
- [ ] GPS tracking integration
- [ ] Route optimization
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Export reports to PDF/Excel
- [ ] Driver performance metrics
- [ ] Fuel consumption tracking

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend by [Firebase](https://firebase.google.com/)
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)
- Inspired by modern fleet management needs

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Email: support@yourapp.com
- Join our [Discord community](#)

---

<div align="center">
  <p>Made with ❤️ for efficient fleet management</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
