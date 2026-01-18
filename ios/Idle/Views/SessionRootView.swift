import SwiftUI

struct SessionRootView: View {
    @State private var showWelcome =
        !UserDefaults.standard.hasSeenWelcomeAudio

    var body: some View {
        ZStack {
            HomeView()

            if showWelcome {
                WelcomeAudioOverlay {
                    showWelcome = false
                }
                .transition(.opacity)
            }
        }
    }
}
