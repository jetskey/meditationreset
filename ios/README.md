# idle - iOS App

SwiftUI reference implementation for the idle meditation app.

## Structure

```
Idle/
├── Models/
│   ├── TypedLine.swift          # Timing model for typewriter effect
│   └── WelcomeLines.swift       # Authoritative welcome text timing
├── Views/
│   ├── SessionRootView.swift    # App entry point
│   ├── HomeView.swift           # Begin button with hard lock
│   ├── MeditationSessionView.swift  # Session UI
│   └── WelcomeAudioOverlay.swift    # First-launch welcome
├── ViewModels/
│   ├── WelcomeAudioViewModel.swift      # Typewriter audio sync
│   ├── MeditationAudioCoordinator.swift # Explanation + meditation flow
│   └── StreakManager.swift              # Days returned tracker
└── Extensions/
    ├── UserDefaults+Onboarding.swift    # hasSeenWelcomeAudio
    └── UserDefaults+Meditation.swift    # hasHeardExplanation
```

## Audio Files Required

Add to Xcode project bundle:
- `welcome.mp3` - First-launch welcome audio
- `explanation.slower.m4a` - First-session explanation
- `guided_session.m4a` - 7-minute guided meditation

## Flow

### First Launch
1. `WelcomeAudioOverlay` appears with typewriter text
2. User taps "Tap to listen"
3. Welcome audio plays with synced text
4. Overlay dismisses, `hasSeenWelcomeAudio = true`

### First Session
1. User taps "Begin"
2. `hasHeardExplanation` captured as `false`, then hard-locked to `true`
3. `explanation.slower.m4a` plays
4. 3s crossfade to `guided_session.m4a`
5. 8s fade out at end
6. 3s silence
7. Session complete

### Returning Sessions
1. User taps "Begin"
2. `hasHeardExplanation` already `true`
3. `guided_session.m4a` plays immediately
4. 8s fade out, 3s silence, complete
