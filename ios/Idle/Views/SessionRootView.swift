import SwiftUI

struct SessionRootView: View {
    @State private var showWelcome = !UserDefaults.standard.hasSeenWelcomeAudio

    var body: some View {
        ZStack {
            // Always black background
            Color.black.ignoresSafeArea()

            // Home view underneath
            HomeView()

            // Welcome overlay on top (first launch only)
            if showWelcome {
                WelcomeAudioOverlay {
                    withAnimation(.easeOut(duration: 0.6)) {
                        showWelcome = false
                    }
                }
                .transition(.opacity)
            }
        }
    }
}
