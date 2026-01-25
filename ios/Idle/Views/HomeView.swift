import SwiftUI

/// Home screen - matches web app's home/page.tsx
struct HomeView: View {
    @AppStorage("hasHeardExplanation") private var hasHeardExplanation: Bool = false
    @AppStorage("sessionsToday") private var sessionsToday: Int = 0
    @AppStorage("currentStreak") private var currentStreak: Int = 0

    @State private var navigateToSession = false
    @State private var playExplanationThisRun = false

    private var isComplete: Bool { sessionsToday > 0 }

    var body: some View {
        NavigationStack {
            ZStack {
                // Black background
                Color.black.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Top bar
                    HStack {
                        Text("IDLE")
                            .font(.system(size: 11, weight: .medium))
                            .tracking(1.2)
                            .foregroundColor(.white.opacity(0.2))

                        Spacer()

                        Text("\(currentStreak) \(currentStreak == 1 ? "day" : "days")")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.2))
                    }
                    .padding(.horizontal, 32)
                    .padding(.top, 60)

                    Spacer()

                    // Orb
                    IdleOrbView(mode: .idle, size: 240)

                    Spacer()

                    // Message
                    Text(isComplete ? "Complete." : "Ready when you are.")
                        .font(.system(size: 22, weight: .regular))
                        .foregroundColor(.white.opacity(0.85))
                        .padding(.bottom, 60)

                    // Begin button
                    Button {
                        playExplanationThisRun = !hasHeardExplanation
                        hasHeardExplanation = true
                        navigateToSession = true
                    } label: {
                        HStack {
                            Text(isComplete ? "Again" : "Begin")
                                .foregroundColor(.white.opacity(0.85))
                            Spacer()
                            Text("7 min")
                                .foregroundColor(.white.opacity(0.5))
                        }
                        .font(.system(size: 15, weight: .medium))
                        .padding(.horizontal, 24)
                        .frame(height: 56)
                        .background(
                            RoundedRectangle(cornerRadius: 28)
                                .fill(Color.white.opacity(0.06))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 28)
                                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                                )
                        )
                    }
                    .padding(.horizontal, 32)
                    .padding(.bottom, 40)
                }
            }
            .toolbarBackground(.hidden, for: .navigationBar)
            .navigationBarHidden(true)
            .navigationDestination(isPresented: $navigateToSession) {
                MeditationSessionView(playExplanation: playExplanationThisRun)
            }
        }
    }
}
