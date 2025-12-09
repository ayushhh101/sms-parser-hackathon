# Team Setup Guide - SMS Parser Hackathon 🚀

## Quick IP Setup for Teammates

### Option 1: Automatic Detection (Recommended)
The app now tries to detect your IP automatically! Just run the app and it should work.

### Option 2: Manual IP Setup (If needed)

1. **Find your local IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Update the IP in the config file:**
   - Open `src/utils/apiConfig.js`
   - Change the fallback IP on line 25:
   ```javascript
   return '192.168.29.218'; // Change this to YOUR IP
   ```

3. **Alternative: Use Environment Variable**
   - Create a `.env` file in the project root:
   ```
   REACT_NATIVE_API_IP=192.168.1.100
   ```

## Backend Setup Checklist ✅

1. **Start your backend server:**
   ```bash
   cd your-backend-folder
   npm start
   # Server should run on port 3000
   ```

2. **Test the server:**
   - Open browser and go to `http://YOUR_IP:3000`
   - You should see the API health check message

## App Features Implemented 🎯

### ✅ **Authentication Flow**
- **Login Screen**: Phone number input with beautiful UI
- **OTP Verification**: 4-digit OTP with auto-focus and backend integration
- **Dashboard**: User profile display with real backend data

### ✅ **SMS Parser Engine** 
- Real SMS reading and parsing
- Demo mode for hackathon presentations
- AI insights and transaction categorization

### ✅ **Navigation System**
- Stack navigation for auth flow
- Tab navigation for main app
- Seamless screen transitions

## Navigation Flow 📱

```
Onboarding → Login → OTPVerification → Dashboard ↔ SMSParser
```

## Key Changes Made 🔧

1. **Fixed Navigation**: Now uses `OTPVerificationScreen` instead of `OTPScreen`
2. **4-Digit OTP**: Changed from 6-digit to 4-digit OTP as requested
3. **Matching Design**: OTP screen now matches login screen design perfectly
4. **Auto IP Detection**: Smart IP configuration for team development
5. **Backend Integration**: Full authentication flow with your backend

## Testing the App 📲

1. **Start Metro:**
   ```bash
   npx expo start
   ```

2. **Test Flow:**
   - Enter any 10-digit phone number on login
   - Demo OTP will be shown in alert
   - Enter the 4-digit OTP to proceed
   - Dashboard loads with user data

## Troubleshooting 🔧

### Network Issues:
- Make sure your device and computer are on the same WiFi
- Check if backend is running on port 3000
- Update IP in `apiConfig.js` if needed

### OTP Issues:
- Demo OTP is always `1234` or shown in alert
- Check network connection
- Verify backend `/auth/send-otp` endpoint

## File Structure 📁

```
src/
├── screens/
│   ├── LoginScreen.js          # Phone number input
│   ├── OTPVerificationScreen.js # 4-digit OTP verification
│   ├── DashboardScreen.js      # User dashboard
│   └── SMSParserScreen.js      # SMS analysis
├── utils/
│   └── apiConfig.js           # IP configuration utility
└── ...
```

## Hackathon Tips 💡

1. **Demo Mode**: Use SMS parser demo mode for presentations
2. **Quick Setup**: Use the IP detection for fast teammate onboarding
3. **Backend Ready**: All endpoints integrated and tested
4. **Beautiful UI**: Consistent design across all screens

Happy coding! 🎉