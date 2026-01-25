import SwiftUI

/// Welcome overlay with typewriter text synced to voiceover
/// Auto-starts immediately, includes Skip button
struct WelcomeAudioOverlay: View {
    @StateObject private var vm = WelcomeAudioViewModel(
        audioFileName: "idle-welcome",
        lines: welcomeLines
    )

    var onFinished: () -> Void

    var body: some View {
        ZStack {
            // Pure black background
            Color.black
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 0) {
                // Top label
                Text("Welcome")
                    .font(.system(size: 11, weight: .medium))
                    .tracking(1.2)
                    .textCase(.uppercase)
                    .foregroundColor(.white.opacity(0.4))
                    .padding(.top, 56)
                    .padding(.horizontal, 32)

                Spacer()

                // Typewriter text - centered vertically
                Text(vm.displayedText)
                    .font(.custom("IBM Plex Mono", size: 18))
                    .foregroundColor(Color(red: 0.91, green: 0.93, blue: 0.96))
                    .lineSpacing(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 32)

                Spacer()

                // Skip button
                Button {
                    vm.stop()
                    UserDefaults.standard.hasSeenWelcomeAudio = true
                    onFinished()
                } label: {
                    Text("Skip")
                        .font(.system(size: 14, weight: .medium))
                        .tracking(0.5)
                        .foregroundColor(.white.opacity(0.5))
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            // Auto-start immediately
            vm.play()
        }
        .onChange(of: vm.finished) { finished in
            if finished {
                withAnimation(.easeOut(duration: 0.6)) {
                    onFinished()
                }
            }
        }
    }
}
