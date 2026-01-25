import SwiftUI

/// Home screen with orb-centered minimal interface
/// Matches the web app's home/page.tsx
struct HomeView: View {
    @AppStorage("hasHeardExplanation") private var hasHeardExplanation: Bool = false
    @AppStorage("sessionsToday") private var sessionsToday: Int = 0
    @AppStorage("currentStreak") private var currentStreak: Int = 0

    @State private var startSession = false
    @State private var playExplanationThisRun = false

    private var isComplete: Bool {
        sessionsToday > 0
    }

    var body: some View {
        NavigationStack {
            ZStack {
                // Pure black background
                Color.black.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Top bar with meta
                    HStack {
                        Text("Idle")
                            .font(.system(size: 11, weight: .medium))
                            .tracking(1.2)
                            .textCase(.uppercase)
                            .foregroundColor(.white.opacity(0.5))

                        Spacer()

                        Text("\(currentStreak) \(currentStreak == 1 ? "day" : "days")")
                            .font(.system(size: 11, weight: .medium))
                            .tracking(0.5)
                            .foregroundColor(.white.opacity(0.5))
                    }
                    .padding(.horizontal, 32)
                    .padding(.top, 56)
                    .opacity(0.4)

                    Spacer()

                    // Orb - primary anchor, slightly above center
                    IdleOrbView(mode: .idle, size: 240)
                        .offset(y: -UIScreen.main.bounds.height * 0.03)

                    Spacer()

                    // Message below orb
                    Text(isComplete ? "Complete." : "Ready when you are.")
                        .font(.system(size: 22, weight: .regular))
                        .tracking(-0.2)
                        .foregroundColor(.white.opacity(0.85))
                        .offset(y: -UIScreen.main.bounds.height * 0.08)

                    Spacer()

                    // Begin button
                    Button {
                        // Decide ONCE at tap
                        playExplanationThisRun = !hasHeardExplanation
                        // Hard-lock immediately
                        hasHeardExplanation = true
                        startSession = true
                    } label: {
                        HStack {
                            Text(isComplete ? "Again" : "Begin")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.white.opacity(0.85))

                            Spacer()

                            Text("7 min")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.white.opacity(0.5))
                        }
                        .padding(.horizontal, 24)
                        .frame(height: 56)
                        .background(
                            RoundedRectangle(cornerRadius: 28)
                                .fill(Color.white.opacity(0.06))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 28)
                                        .stroke(Color.white.opacity(0.10), lineWidth: 1)
                                )
                        )
                    }
                    .padding(.horizontal, 32)
                    .padding(.bottom, 40)
                }
            }
            .navigationDestination(isPresented: $startSession) {
                MeditationSessionView(playExplanation: playExplanationThisRun)
                    .navigationBarBackButtonHidden(true)
            }
        }
    }
}

#Preview {
    HomeView()
        .preferredColorScheme(.dark)
}
