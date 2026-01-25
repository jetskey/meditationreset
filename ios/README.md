# Idle - iOS App

Native SwiftUI implementation for the Idle meditation app.

## Setup in Xcode

1. **Create New Project**
   - Open Xcode → File → New → Project
   - Select iOS → App
   - Product Name: `Idle`
   - Interface: SwiftUI
   - Language: Swift

2. **Add Source Files**
   - Drag all files from `Idle/` folder into your Xcode project
   - Make sure "Copy items if needed" is checked
   - Add to target: Idle

3. **Add Audio Files**
   - Drag all files from `Idle/Resources/` into your Xcode project
   - Make sure "Copy items if needed" is checked
   - Add to target: Idle

4. **Add IBM Plex Mono Font** (optional, for welcome typewriter)
   - Download IBM Plex Mono from Google Fonts
   - Add to project and Info.plist

## Project Structure

```
Idle/
├── IdleApp.swift              # App entry point
├── Models/
│   ├── TypedLine.swift        # Timing model for typewriter
│   └── WelcomeLines.swift     # Welcome text timing (synced to audio)
├── Views/
│   ├── SessionRootView.swift  # Root view with welcome overlay
│   ├── HomeView.swift         # Home screen with orb and Begin button
│   ├── IdleOrbView.swift      # Orbital rings visualization
│   ├── MeditationSessionView.swift  # Session UI with timer
│   └── WelcomeAudioOverlay.swift    # First-launch welcome
├── ViewModels/
│   ├── WelcomeAudioViewModel.swift      # Typewriter audio sync
│   ├── MeditationAudioCoordinator.swift # Session audio handling
│   └── StreakManager.swift              # Days tracking
├── Extensions/
│   ├── UserDefaults+Onboarding.swift    # hasSeenWelcomeAudio
│   └── UserDefaults+Meditation.swift    # hasHeardExplanation
└── Resources/
    ├── idle-welcome.mp3       # Welcome voiceover (28s)
    ├── finalaudioidle.mp3     # Guided meditation (7 min)
    └── explanation.m4a        # First-session explanation
```

## Audio Files

| File | Duration | Purpose |
|------|----------|---------|
| `idle-welcome.mp3` | 28.16s | First-launch welcome voiceover |
| `finalaudioidle.mp3` | 7:00 | Main guided meditation |
| `explanation.m4a` | ~1 min | First-session explanation |

## App Flow

### First Launch
1. `WelcomeAudioOverlay` appears with typewriter text
2. Audio auto-starts immediately
3. Skip button available at bottom
4. After completion, `hasSeenWelcomeAudio = true`

### First Session
1. User taps "Begin"
2. `hasHeardExplanation` is `false` → plays explanation first
3. Crossfade to guided meditation
4. Session ends with fade out
5. Completion screen with session time

### Returning Sessions
1. User taps "Begin"
2. `hasHeardExplanation` already `true`
3. Guided meditation plays immediately
4. 1.5s fade in, 3s fade out at end

## TestFlight Preparation

Before submitting to TestFlight, you need:

1. **Apple Developer Account** ($99/year)
   - Enroll at developer.apple.com

2. **App Store Connect Setup**
   - Create app record
   - Configure app information

3. **Xcode Configuration**
   - Set Bundle Identifier (e.g., `com.yourname.idle`)
   - Select your Team
   - Set Version and Build numbers

4. **Archive and Upload**
   - Product → Archive
   - Distribute App → App Store Connect
   - Upload

5. **TestFlight**
   - Wait for processing (~30 min)
   - Add testers
   - Distribute build
