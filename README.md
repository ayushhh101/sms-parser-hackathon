💰 SMS Parser - Hackathon Edition
A simple Expo React Native app that reads SMS, auto-detects OTPs, and parses transaction details.
✨ Features

🔐 Auto OTP Detection - Instantly detects and lets you copy OTPs
💸 Transaction Parsing - Extracts amount, type, merchant, balance
📊 Real-time Dashboard - Live feed with stats
🏦 Multi-category - Banks, UPI, Food, Shopping, Transport

🚀 Quick Setup (5 minutes)
Prerequisites

Node.js 18+
Android Studio (with SDK 34)
Physical Android phone (SMS doesn't work on emulator)
USB cable for testing

Step 1: Clone & Install
bash# Clone the repo
git clone https://github.com/YOUR_USERNAME/sms-parser-hackathon.git
cd sms-parser-hackathon

# Install dependencies
npm install

# Install expo-build-properties (if not already)
npx expo install expo-build-properties
Step 2: Generate Android Native Code
bash# Generate android folder
npx expo prebuild --platform android
Step 3: Run on Your Phone
bash# Connect your Android phone via USB
# Enable USB Debugging in Developer Options

# Run the app
npx expo run:android
📁 Project Structure
sms-parser-hackathon/
├── App.js                 # Main app UI
├── src/
│   ├── smsParser.js       # OTP & transaction parsing
│   └── smsService.js      # SMS reading & permissions
├── app.json               # Expo config
├── package.json           # Dependencies
└── android/               # Generated native code
    └── app/src/main/
        └── AndroidManifest.xml  # Permissions
🔧 For Teammates
First Time Setup
bashgit clone <repo-url>
cd sms-parser-hackathon
npm install
npx expo prebuild --platform android
npx expo run:android
After Pulling Changes
bashgit pull
npm install
npx expo run:android
If Build Fails
bash# Clean rebuild
npx expo prebuild --clean --platform android
npx expo run:android
📱 Testing

Connect phone via USB with USB Debugging ON
Run npx expo run:android
Grant SMS permissions when prompted
Send yourself a test SMS like:

Your OTP is 123456 for login
Rs.500 debited from A/c XX1234. Bal: Rs.10000



🎯 Supported SMS Formats
OTPs

"Your OTP is 123456"
"Use code 1234 to verify"
"OTP: 567890 valid for 10 mins"

Transactions

"Rs.500 debited from A/c XX1234"
"INR 2000 credited to your account"
"Paid Rs.99 to Zomato"
"Cashback of Rs.50 received"

Banks & Apps Recognized
HDFC, SBI, ICICI, Axis, Paytm, PhonePe, GPay, Amazon, Flipkart, Zomato, Swiggy, Uber, Ola
🔮 Future Expansion Ideas

 Budget tracking & charts
 Export to CSV
 Category-wise spending
 Monthly reports
 Dark/Light theme toggle
 Push notifications for high-value transactions

⚠️ Troubleshooting
IssueSolution"SMS module not available"Run npx expo prebuild --cleanPermission deniedGo to Settings > Apps > SMS Parser > PermissionsBuild failsDelete android folder, run npx expo prebuildNo SMS showingUse real device, not emulator
📦 Version Compatibility
PackageVersionExpo SDK51React Native0.74.5Android SDK34Min Android6.0 (API 23)
👥 Team Commands Cheatsheet
bash# Install
npm install

# Run
npx expo run:android

# Clean rebuild
npx expo prebuild --clean && npx expo run:android

# See logs
npx react-native log-android