import SwiftUI
import AVFoundation

/// Welcome overlay - shows on first app launch with audio and typewriter text
struct WelcomeAudioOverlay: View {
    var onFinished: () -> Void

    @AppStorage("hasSeenWelcomeAudio") private var hasSeenWelcome: Bool = false
    @State private var displayedCharacterCount: Int = 0
    @State private var audioPlayer: AVAudioPlayer?
    @State private var typewriterTimer: Timer?
    @State private var checkTimer: Timer?

    private let welcomeText = """
Welcome to idle.

idle is a simple practice to create space between you and your thoughts.

You're not trying to control your mind or reach a special state.

You're practicing stepping back, so thoughts can be there without pulling you in.

What matters most is consistency.

A few minutes, done regularly, work better than occasional long sessions.

Let's begin.
"""

    // Characters per second for typewriter effect
    private let typewriterSpeed: Double = 18

    private var displayedText: String {
        String(welcomeText.prefix(displayedCharacterCount))
    }

    var body: some View {
        ZStack {
            // Full screen black background
            Color.black
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 0) {
                // Top label
                Text("WELCOME")
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .tracking(1.2)
                    .foregroundColor(.white.opacity(0.4))
                    .padding(.top, 60)
                    .padding(.horizontal, 32)

                Spacer()

                // Welcome text with typewriter effect
                ScrollView(showsIndicators: false) {
                    Text(displayedText)
                        .font(.system(size: 16, weight: .regular, design: .monospaced))
                        .foregroundColor(.white.opacity(0.9))
                        .lineSpacing(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 20)
                }

                Spacer()

                // Continue button
                Button {
                    finishWelcome()
                } label: {
                    Text("Continue")
                        .font(.system(size: 15, weight: .medium, design: .monospaced))
                        .foregroundColor(.white.opacity(0.85))
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            RoundedRectangle(cornerRadius: 28)
                                .fill(Color.white.opacity(0.06))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 28)
                                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                                )
                        )
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 16)

                // Skip button
                Button {
                    finishWelcome()
                } label: {
                    Text("Skip")
                        .font(.system(size: 14, weight: .medium, design: .monospaced))
                        .foregroundColor(.white.opacity(0.4))
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 50)
            }
        }
        .onAppear {
            startWelcome()
        }
        .onDisappear {
            stopAll()
        }
    }

    private func startWelcome() {
        // Setup audio session
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("[Welcome] Audio session error: \(error)")
        }

        // Load and play audio
        if let url = Bundle.main.url(forResource: "idle-welcome", withExtension: "mp3") {
            do {
                audioPlayer = try AVAudioPlayer(contentsOf: url)
                audioPlayer?.prepareToPlay()
                audioPlayer?.play()
                print("[Welcome] Audio started playing")
            } catch {
                print("[Welcome] Audio load error: \(error)")
            }
        } else {
            print("[Welcome] Audio file not found: idle-welcome.mp3")
        }

        // Start typewriter effect
        let interval = 1.0 / typewriterSpeed
        typewriterTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            if displayedCharacterCount < welcomeText.count {
                displayedCharacterCount += 1
            } else {
                typewriterTimer?.invalidate()
                typewriterTimer = nil
            }
        }

        // Mark as seen
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            hasSeenWelcome = true
        }

        // Setup timer to check for audio completion
        checkTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
            if let player = audioPlayer, !player.isPlaying && player.currentTime > 0 {
                checkTimer?.invalidate()
                checkTimer = nil
                // Show remaining text immediately when audio ends
                displayedCharacterCount = welcomeText.count
                typewriterTimer?.invalidate()
                typewriterTimer = nil
                // Auto-dismiss after audio ends
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    finishWelcome()
                }
            }
        }
    }

    private func stopAll() {
        typewriterTimer?.invalidate()
        typewriterTimer = nil
        checkTimer?.invalidate()
        checkTimer = nil
        audioPlayer?.stop()
        audioPlayer = nil
    }

    private func finishWelcome() {
        stopAll()
        hasSeenWelcome = true
        onFinished()
    }
}
