🚀 Complete Setup Commands
Copy-paste these commands to get running in 5 minutes!

Option 1: Fresh Project Setup
bash# 1. Create new Expo project
npx create-expo-app@latest sms-parser-hackathon --template blank
cd sms-parser-hackathon

# 2. Install all dependencies
npm install react-native-get-sms-android react-native-android-sms-listener react-native-safe-area-context @react-native-async-storage/async-storage expo-dev-client

# 3. Install build properties plugin
npx expo install expo-build-properties

# 4. Create src folder and copy the code files
mkdir src

# 5. Generate Android native code
npx expo prebuild --platform android

# 6. Connect your Android phone (USB debugging ON)

# 7. Run the app!
npx expo run:android

Option 2: Clone from Git
bash# 1. Clone repository
git clone https://github.com/YOUR_REPO/sms-parser-hackathon.git
cd sms-parser-hackathon

# 2. Install dependencies
npm install

# 3. Generate Android code
npx expo prebuild --platform android

# 4. Run on device
npx expo run:android

Teammate Quick Start
bashgit clone <REPO_URL>
cd sms-parser-hackathon
npm install
npx expo prebuild --platform android
npx expo run:android

Useful Commands
CommandWhat it doesnpm installInstall packagesnpx expo prebuildGenerate native codenpx expo run:androidBuild & run on phonenpx expo prebuild --cleanClean regenerate nativenpx react-native log-androidView Android logsadb devicesCheck connected devices

If Something Breaks
bash# Nuclear option - clean everything
rm -rf node_modules android
npm install
npx expo prebuild --platform android
npx expo run:android

Phone Setup

Go to Settings > About Phone
Tap Build Number 7 times (enables Developer Mode)
Go to Settings > Developer Options
Enable USB Debugging
Connect phone via USB
Accept the debugging prompt on phone


Test SMS Messages
Send these to yourself to test:
Your OTP is 123456 for verification
Rs.500 debited from A/c XX1234 on 22-Nov. Avl Bal: Rs.10000
INR 2000 credited to your account. UPI Ref: 123456789
Congrats! You got 50% cashback of Rs.100 on Swiggy order

File Checklist
Make sure you have these files:
sms-parser-hackathon/
├── App.js              ✓ Main app
├── package.json        ✓ Dependencies  
├── app.json            ✓ Expo config
├── babel.config.js     ✓ Babel config
├── src/
│   ├── smsParser.js    ✓ Parser logic
│   ├── smsService.js   ✓ SMS reading
│   └── OtpInput.js     ✓ OTP component
└── assets/
    ├── icon.png        ✓ App icon (any 1024x1024)
    ├── splash.png      ✓ Splash screen
    └── adaptive-icon.png

Common Errors & Fixes
"SDK location not found"
bash# Create local.properties in android folder
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
"Could not find com.facebook.react"
bashcd android && ./gradlew clean && cd ..
npx expo run:android
"Permission denied for SMS"

Manually go to Settings > Apps > SMS Parser > Permissions
Enable SMS permission

"No connected devices"
bashadb kill-server
adb start-server
adb devices