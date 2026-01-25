import SwiftUI
import AVFoundation

/// Welcome overlay with typewriter text - auto-starts, has skip button
struct WelcomeAudioOverlay: View {
    var onFinished: () -> Void

    @StateObject private var audio = WelcomeAudioPlayer()
    @State private var displayedText: String = ""

    var body: some View {
        ZStack {
            // Black background
            Color.black.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 0) {
                // Top label
                Text("WELCOME")
                    .font(.system(size: 11, weight: .medium))
                    .tracking(1.2)
                    .foregroundColor(.white.opacity(0.4))
                    .padding(.top, 60)
                    .padding(.horizontal, 32)

                Spacer()

                // Typewriter text
                Text(displayedText)
                    .font(.system(size: 18, weight: .regular, design: .monospaced))
                    .foregroundColor(.white.opacity(0.9))
                    .lineSpacing(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 32)

                Spacer()

                // Skip button
                Button {
                    audio.stop()
                    UserDefaults.standard.hasSeenWelcomeAudio = true
                    onFinished()
                } label: {
                    Text("Skip")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            audio.play()
        }
        .onReceive(audio.$currentText) { text in
            displayedText = text
        }
        .onReceive(audio.$isFinished) { finished in
            if finished {
                UserDefaults.standard.hasSeenWelcomeAudio = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                    onFinished()
                }
            }
        }
    }
}

// Simple audio player with text sync
class WelcomeAudioPlayer: ObservableObject {
    @Published var currentText: String = ""
    @Published var isFinished: Bool = false

    private var player: AVAudioPlayer?
    private var timer: Timer?

    private let sentences: [(time: Double, text: String)] = [
        (0.0, "Welcome to idle."),
        (2.2, "\n\nidle is a simple practice to create space between you and your thoughts."),
        (7.2, "\n\nYou're not trying to control your mind or reach a special state."),
        (12.2, "\n\nYou're practicing stepping back, so thoughts can be there without pulling you in."),
        (19.2, "\n\nWhat matters most is consistency."),
        (22.8, "\n\nA few minutes, done regularly, work better than occasional long sessions."),
        (27.0, "\n\nLet's begin.")
    ]

    init() {
        try? AVAudioSession.sharedInstance().setCategory(.playback)
        try? AVAudioSession.sharedInstance().setActive(true)

        if let url = Bundle.main.url(forResource: "idle-welcome", withExtension: "mp3") {
            player = try? AVAudioPlayer(contentsOf: url)
            player?.prepareToPlay()
        }
    }

    func play() {
        player?.play()

        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            self?.updateText()
        }
    }

    func stop() {
        timer?.invalidate()
        player?.stop()
    }

    private func updateText() {
        guard let player = player else { return }

        let currentTime = player.currentTime
        var newText = ""

        for sentence in sentences {
            if currentTime >= sentence.time {
                newText += sentence.text
            }
        }

        if currentText != newText {
            currentText = newText
        }

        if !player.isPlaying && currentTime > 0 {
            timer?.invalidate()
            isFinished = true
        }
    }
}
