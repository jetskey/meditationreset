import SwiftUI

struct SessionRootView: View {
    // Use a different key to reset for testing, or delete app to reset
    @AppStorage("hasSeenWelcomeAudio") private var hasSeenWelcome: Bool = false
    @State private var showWelcomeOverlay: Bool = false

    var body: some View {
        ZStack {
            // Main app content
            MainTabView()

            // Welcome overlay - shown on first launch only
            if showWelcomeOverlay {
                WelcomeAudioOverlay {
                    withAnimation(.easeOut(duration: 0.5)) {
                        showWelcomeOverlay = false
                    }
                }
                .transition(.opacity)
                .zIndex(100)
            }
        }
        .onAppear {
            // Show welcome on first launch
            if !hasSeenWelcome {
                showWelcomeOverlay = true
            }
        }
    }
}
