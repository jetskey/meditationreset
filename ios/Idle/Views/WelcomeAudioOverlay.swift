import SwiftUI

struct WelcomeAudioOverlay: View {
    @StateObject private var vm = WelcomeAudioViewModel(
        audioFileName: "welcome",
        lines: welcomeLines
    )

    var onFinished: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.85)
                .ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                Text(vm.displayedText.isEmpty ? "tap play to begin" : vm.displayedText)
                    .font(.system(size: 18, design: .monospaced))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(24)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.white.opacity(0.06))
                    )
                    .padding(.horizontal, 24)

                Spacer()

                if vm.displayedText.isEmpty {
                    Button {
                        vm.play()
                    } label: {
                        Text("Tap to listen")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 14)
                            .background(Color.white)
                            .cornerRadius(24)
                    }
                }

                Spacer().frame(height: 40)
            }
        }
        .onChange(of: vm.finished) { finished in
            if finished {
                withAnimation(.easeInOut(duration: 1.0)) {
                    onFinished()
                }
            }
        }
    }
}
