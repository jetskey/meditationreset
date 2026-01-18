import SwiftUI

struct HomeView: View {
    @AppStorage("hasHeardExplanation") private var hasHeardExplanation: Bool = false
    @State private var startSession = false
    @State private var playExplanationThisRun = false

    var body: some View {
        NavigationStack {
            VStack {
                Spacer()

                Button {
                    // Decide ONCE at tap
                    playExplanationThisRun = !hasHeardExplanation

                    // Hard-lock immediately
                    hasHeardExplanation = true

                    startSession = true
                } label: {
                    Text("Begin")
                        .font(.system(size: 18, weight: .semibold))
                }

                Spacer()
            }
            .navigationDestination(isPresented: $startSession) {
                MeditationSessionView(
                    playExplanation: playExplanationThisRun
                )
            }
        }
    }
}
