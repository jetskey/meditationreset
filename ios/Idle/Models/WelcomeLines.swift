import Foundation

/// Welcome text and timing synchronized with idle-welcome.mp3 (28.16 seconds)
/// Matches the web app's SENTENCE_MARKERS exactly
let welcomeLines: [TypedLine] = [
    .init(startTime: 0.0, text: "Welcome to idle.", charInterval: 0.042),
    .init(startTime: 2.2, text: "idle is a simple practice to create space between you and your thoughts.", charInterval: 0.042),
    .init(startTime: 7.2, text: "You're not trying to control your mind or reach a special state.", charInterval: 0.042),
    .init(startTime: 12.2, text: "You're practicing stepping back, so thoughts can be there without pulling you in.", charInterval: 0.042),
    .init(startTime: 19.2, text: "What matters most is consistency.", charInterval: 0.042),
    .init(startTime: 22.8, text: "A few minutes, done regularly, work better than occasional long sessions.", charInterval: 0.042),
    .init(startTime: 27.0, text: "Let's begin.", charInterval: 0.042),
]

/// Total audio duration in seconds
let welcomeAudioDuration: TimeInterval = 28.16
