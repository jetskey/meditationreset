import SwiftUI

struct MeditationSessionView: View {
    let playExplanation: Bool
    @StateObject private var audio = MeditationAudioCoordinator()

    // Store original brightness so we can restore it
    @State private var originalBrightness: CGFloat = UIScreen.main.brightness

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            Text("idle")
                .font(.system(size: 28, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
        }
        .onAppear {
            // Prevent auto-lock
            UIApplication.shared.isIdleTimerDisabled = true

            // Lock brightness (prevents screen blanking)
            originalBrightness = UIScreen.main.brightness
            UIScreen.main.brightness = max(originalBrightness, 0.15)

            // Start audio
            audio.begin(playExplanation: playExplanation)
        }
        .onDisappear {
            // Restore system behavior
            UIApplication.shared.isIdleTimerDisabled = false
            UIScreen.main.brightness = originalBrightness
        }
    }
}
