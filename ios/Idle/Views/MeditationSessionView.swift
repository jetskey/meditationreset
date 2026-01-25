import SwiftUI

/// Meditation session screen with orb visualization and timer
/// Matches the web app's session/run/page.tsx
struct MeditationSessionView: View {
    let playExplanation: Bool

    @Environment(\.dismiss) private var dismiss
    @StateObject private var audio = MeditationAudioCoordinator()
    @AppStorage("sessionsToday") private var sessionsToday: Int = 0

    // Screen state
    @State private var showExit = false
    @State private var exitTimer: Timer?
    @State private var originalBrightness: CGFloat = UIScreen.main.brightness

    private var orbMode: IdleOrbView.Mode {
        switch audio.phase {
        case .idle: return .idle
        case .entering: return .entering
        case .explanation, .playing: return .active
        case .completing: return .completing
        case .complete: return .complete
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            if audio.phase == .complete {
                // Completion state
                completionView
            } else {
                // Active session
                sessionView
            }
        }
        .onAppear {
            setupSession()
        }
        .onDisappear {
            cleanupSession()
        }
        .onChange(of: audio.finished) { finished in
            if finished {
                // Record session
                sessionsToday += 1
            }
        }
        .gesture(
            TapGesture()
                .onEnded { _ in
                    if audio.phase == .playing || audio.phase == .explanation {
                        showExitButton()
                    }
                }
        )
    }

    // MARK: - Session View

    private var sessionView: some View {
        VStack(spacing: 0) {
            // Exit button
            HStack {
                Button {
                    audio.endEarly()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .regular))
                        .foregroundColor(.white.opacity(0.5))
                }
                .opacity(exitOpacity)
                .animation(.easeOut(duration: 0.3), value: showExit)

                Spacer()
            }
            .padding(.horizontal, 32)
            .padding(.top, 64)

            Spacer()

            // Session label
            Text("Session")
                .font(.system(size: 11, weight: .medium))
                .tracking(1.5)
                .textCase(.uppercase)
                .foregroundColor(.white.opacity(0.35))
                .padding(.bottom, 40)

            // Orb with time display
            IdleOrbView(
                mode: orbMode,
                progress: audio.progress,
                timeDisplay: showTime ? audio.timeDisplay : nil,
                size: 260
            )

            Spacer()

            // Status hint
            Text(statusHint)
                .font(.system(size: 11, weight: .medium))
                .tracking(1.5)
                .textCase(.uppercase)
                .foregroundColor(.white.opacity(0.28))
                .padding(.bottom, 60)
        }
    }

    // MARK: - Completion View

    private var completionView: some View {
        VStack(spacing: 0) {
            Spacer()

            IdleOrbView(mode: .complete, size: 180)
                .padding(.bottom, 48)

            Text("+\(formatTime(Int(audio.elapsed)))")
                .font(.system(size: 48, weight: .medium))
                .tracking(-1)
                .monospacedDigit()
                .foregroundColor(.white.opacity(0.85))

            Text("Complete.")
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(.white.opacity(0.6))
                .padding(.top, 16)

            Spacer()

            Text("tap to continue")
                .font(.system(size: 11, weight: .medium))
                .tracking(1.5)
                .textCase(.uppercase)
                .foregroundColor(.white.opacity(0.25))
                .padding(.bottom, 60)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            dismiss()
        }
        .onAppear {
            // Auto-dismiss after 4 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
                dismiss()
            }
        }
    }

    // MARK: - Helpers

    private var exitOpacity: Double {
        switch audio.phase {
        case .entering: return 0.1
        case .playing, .explanation:
            return showExit ? 0.5 : 0.15
        default: return 0.1
        }
    }

    private var showTime: Bool {
        audio.phase == .playing || audio.phase == .completing
    }

    private var statusHint: String {
        switch audio.phase {
        case .idle, .entering: return ""
        case .explanation: return "Listen"
        case .playing: return ""
        case .completing: return ""
        case .complete: return ""
        }
    }

    private func formatTime(_ seconds: Int) -> String {
        let mins = seconds / 60
        let secs = seconds % 60
        if mins == 0 { return "\(secs)s" }
        if secs == 0 { return "\(mins) min" }
        return String(format: "%d:%02d", mins, secs)
    }

    private func showExitButton() {
        showExit = true
        exitTimer?.invalidate()
        exitTimer = Timer.scheduledTimer(withTimeInterval: 2.5, repeats: false) { _ in
            showExit = false
        }
    }

    private func setupSession() {
        // Prevent auto-lock
        UIApplication.shared.isIdleTimerDisabled = true

        // Lock minimum brightness
        originalBrightness = UIScreen.main.brightness
        UIScreen.main.brightness = max(originalBrightness, 0.15)

        // Start audio
        audio.begin(playExplanation: playExplanation)
    }

    private func cleanupSession() {
        UIApplication.shared.isIdleTimerDisabled = false
        UIScreen.main.brightness = originalBrightness
        exitTimer?.invalidate()
    }
}

#Preview {
    MeditationSessionView(playExplanation: false)
        .preferredColorScheme(.dark)
}
