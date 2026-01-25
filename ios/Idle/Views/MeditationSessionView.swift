import SwiftUI
import AVFoundation

/// Meditation session screen - matches web app
struct MeditationSessionView: View {
    let playExplanation: Bool

    @Environment(\.dismiss) private var dismiss
    @StateObject private var audio = SessionAudioPlayer()
    @AppStorage("sessionsToday") private var sessionsToday: Int = 0

    @State private var showExit = false

    var body: some View {
        ZStack {
            // Black background
            Color.black.ignoresSafeArea()

            if audio.isComplete {
                completionView
            } else {
                sessionView
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            UIApplication.shared.isIdleTimerDisabled = true
            audio.begin(playExplanation: playExplanation)
        }
        .onDisappear {
            UIApplication.shared.isIdleTimerDisabled = false
            audio.stop()
        }
    }

    private var sessionView: some View {
        VStack(spacing: 0) {
            // Exit button
            HStack {
                Button {
                    sessionsToday += 1
                    audio.stop()
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20))
                        .foregroundColor(.white.opacity(showExit ? 0.5 : 0.15))
                }
                Spacer()
            }
            .padding(.horizontal, 32)
            .padding(.top, 60)

            Spacer()

            // Session label
            Text("SESSION")
                .font(.system(size: 11, weight: .medium))
                .tracking(1.5)
                .foregroundColor(.white.opacity(0.35))
                .padding(.bottom, 40)

            // Orb with time
            IdleOrbView(
                mode: .active,
                progress: audio.progress,
                timeDisplay: audio.timeDisplay,
                size: 260
            )

            Spacer()
            Spacer()
        }
        .contentShape(Rectangle())
        .onTapGesture {
            showExit = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                showExit = false
            }
        }
    }

    private var completionView: some View {
        VStack(spacing: 0) {
            Spacer()

            IdleOrbView(mode: .complete, size: 180)
                .padding(.bottom, 48)

            Text("+\(formatTime(audio.elapsedSeconds))")
                .font(.system(size: 48, weight: .medium))
                .monospacedDigit()
                .foregroundColor(.white.opacity(0.85))

            Text("Complete.")
                .font(.system(size: 15))
                .foregroundColor(.white.opacity(0.6))
                .padding(.top, 16)

            Spacer()

            Text("TAP TO CONTINUE")
                .font(.system(size: 11, weight: .medium))
                .tracking(1.5)
                .foregroundColor(.white.opacity(0.25))
                .padding(.bottom, 60)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            sessionsToday += 1
            dismiss()
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
                sessionsToday += 1
                dismiss()
            }
        }
    }

    private func formatTime(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        if m == 0 { return "\(s)s" }
        if s == 0 { return "\(m) min" }
        return "\(m):\(String(format: "%02d", s))"
    }
}

// Session audio player
class SessionAudioPlayer: ObservableObject {
    @Published var progress: Double = 0
    @Published var timeDisplay: String = "7:00"
    @Published var elapsedSeconds: Int = 0
    @Published var isComplete: Bool = false

    private var player: AVAudioPlayer?
    private var timer: Timer?
    private let duration: Double = 420 // 7 minutes

    init() {
        try? AVAudioSession.sharedInstance().setCategory(.playback)
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    func begin(playExplanation: Bool) {
        // For now, skip explanation and go straight to meditation
        if let url = Bundle.main.url(forResource: "finalaudioidle", withExtension: "mp3") {
            player = try? AVAudioPlayer(contentsOf: url)
            player?.volume = 0
            player?.play()

            // Fade in
            Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] timer in
                guard let self = self, let player = self.player else {
                    timer.invalidate()
                    return
                }
                if player.volume < 0.8 {
                    player.volume += 0.02
                } else {
                    timer.invalidate()
                }
            }

            startProgressTimer()
        }
    }

    func stop() {
        timer?.invalidate()
        player?.stop()
    }

    private func startProgressTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
            self?.updateProgress()
        }
    }

    private func updateProgress() {
        guard let player = player else { return }

        let current = min(player.currentTime, duration)
        let remaining = max(0, duration - current)

        elapsedSeconds = Int(current)
        progress = current / duration

        let m = Int(remaining) / 60
        let s = Int(remaining) % 60
        timeDisplay = "\(m):\(String(format: "%02d", s))"

        if current >= duration || !player.isPlaying {
            timer?.invalidate()

            // Fade out
            Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] timer in
                guard let self = self, let player = self.player else {
                    timer.invalidate()
                    return
                }
                if player.volume > 0.05 {
                    player.volume -= 0.05
                } else {
                    player.stop()
                    timer.invalidate()
                    DispatchQueue.main.async {
                        self.isComplete = true
                    }
                }
            }
        }
    }
}
