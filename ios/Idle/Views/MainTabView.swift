import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @State private var navigateToSession = false

    enum Tab {
        case home
        case session
        case stats
    }

    var body: some View {
        NavigationStack {
            ZStack {
                // 1️⃣ BACKGROUND — only thing that ignores safe area
                Color.black
                    .ignoresSafeArea()

                // 2️⃣ CONTENT — respects safe areas
                VStack(spacing: 0) {
                    // TOP BAR
                    topBar
                        .padding(.horizontal, 32)
                        .padding(.top, 8)

                    // MAIN CONTENT — centered via Spacers
                    Spacer(minLength: 0)

                    mainContent
                        .padding(.horizontal, 32)

                    Spacer(minLength: 0)

                    // BOTTOM SECTION (button area)
                    bottomSection
                        .padding(.horizontal, 32)
                        .padding(.bottom, 16)
                }
            }
            // 3️⃣ BOTTOM NAV — safe area anchored
            .safeAreaInset(edge: .bottom) {
                HStack {
                    Spacer()
                    tabButton(.home)
                    Spacer()
                    tabButton(.session)
                    Spacer()
                    tabButton(.stats)
                    Spacer()
                }
                .padding(.top, 12)
                .padding(.bottom, 8)
                .background(Color.black)
            }
            .navigationBarHidden(true)
            .navigationDestination(isPresented: $navigateToSession) {
                MeditationSessionView()
            }
        }
    }

    // MARK: - Top Bar

    @ViewBuilder
    private var topBar: some View {
        switch selectedTab {
        case .home:
            HomeTopBar()
        case .session:
            SessionTopBar()
        case .stats:
            StatsTopBar()
        }
    }

    // MARK: - Main Content

    @ViewBuilder
    private var mainContent: some View {
        switch selectedTab {
        case .home:
            HomeMainContent()
        case .session:
            SessionMainContent()
        case .stats:
            StatsMainContent()
        }
    }

    // MARK: - Bottom Section

    @ViewBuilder
    private var bottomSection: some View {
        switch selectedTab {
        case .home:
            HomeBottomSection(navigateToSession: $navigateToSession)
        case .session:
            SessionBottomSection(navigateToSession: $navigateToSession)
        case .stats:
            EmptyView()
        }
    }

    // MARK: - Tab Button

    private func tabButton(_ tab: Tab) -> some View {
        Button {
            selectedTab = tab
        } label: {
            tabIcon(tab)
                .foregroundColor(selectedTab == tab ? .white.opacity(0.55) : .white.opacity(0.18))
                .frame(width: 44, height: 44)
        }
    }

    @ViewBuilder
    private func tabIcon(_ tab: Tab) -> some View {
        switch tab {
        case .home:
            Circle()
                .stroke(lineWidth: 1.25)
                .frame(width: 18, height: 18)
        case .session:
            ZStack {
                Circle()
                    .stroke(lineWidth: 1.25)
                    .frame(width: 18, height: 18)
                Path { path in
                    path.move(to: CGPoint(x: 9, y: 9))
                    path.addLine(to: CGPoint(x: 9, y: 5))
                    path.move(to: CGPoint(x: 9, y: 9))
                    path.addLine(to: CGPoint(x: 12, y: 10.5))
                }
                .stroke(lineWidth: 1.25)
                .frame(width: 18, height: 18)
            }
        case .stats:
            VStack(alignment: .leading, spacing: 2.5) {
                Rectangle().frame(width: 14, height: 1.25)
                Rectangle().frame(width: 10, height: 1.25)
                Rectangle().frame(width: 12, height: 1.25)
            }
        }
    }
}

// MARK: - Home Tab Components

struct HomeTopBar: View {
    @AppStorage("currentStreak") private var currentStreak: Int = 0

    var body: some View {
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
    }
}

struct HomeMainContent: View {
    var body: some View {
        IdleOrbView(mode: .idle, size: 240)
    }
}

struct HomeBottomSection: View {
    @AppStorage("sessionsToday") private var sessionsToday: Int = 0
    @AppStorage("sessionsTodayDate") private var sessionsTodayDate: String = ""
    @Binding var navigateToSession: Bool

    private var isComplete: Bool {
        // Check if sessionsToday is for today
        let today = ISO8601DateFormatter().string(from: Date()).prefix(10)
        if sessionsTodayDate != String(today) {
            return false  // New day, not complete yet
        }
        return sessionsToday > 0
    }

    var body: some View {
        VStack(spacing: 32) {
            Text(isComplete ? "Complete." : "Ready when you are.")
                .font(.system(size: 22, weight: .regular))
                .foregroundColor(.white.opacity(0.85))

            Button {
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
                        .overlay(RoundedRectangle(cornerRadius: 28).stroke(Color.white.opacity(0.1), lineWidth: 1))
                )
            }
        }
    }
}

// MARK: - Session Tab Components

struct SessionTopBar: View {
    var body: some View {
        HStack {
            Text("SESSION")
                .font(.system(size: 11, weight: .medium))
                .tracking(1.2)
                .foregroundColor(.white.opacity(0.4))
            Spacer()
        }
    }
}

struct SessionMainContent: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("7:00")
                .font(.system(size: 48, weight: .medium).monospacedDigit())
                .foregroundColor(.white.opacity(0.85))
            Text("Audio-guided meditation")
                .font(.system(size: 15))
                .foregroundColor(.white.opacity(0.5))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct SessionBottomSection: View {
    @Binding var navigateToSession: Bool

    var body: some View {
        Button {
            navigateToSession = true
        } label: {
            Text("Begin")
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white.opacity(0.85))
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(
                    RoundedRectangle(cornerRadius: 28)
                        .fill(Color.white.opacity(0.06))
                        .overlay(RoundedRectangle(cornerRadius: 28).stroke(Color.white.opacity(0.1), lineWidth: 1))
                )
        }
    }
}

// MARK: - Stats Tab Components

struct StatsTopBar: View {
    var body: some View {
        HStack {
            Text("STATS")
                .font(.system(size: 11, weight: .medium))
                .tracking(1.2)
                .foregroundColor(.white.opacity(0.4))
            Spacer()
        }
    }
}

struct StatsMainContent: View {
    @AppStorage("totalFocusSeconds") private var totalFocusSeconds: Int = 0
    @AppStorage("currentStreak") private var currentStreak: Int = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 48) {
            VStack(alignment: .leading, spacing: 12) {
                Text(formatFocusTime(totalFocusSeconds))
                    .font(.system(size: 48, weight: .medium).monospacedDigit())
                    .foregroundColor(.white.opacity(0.85))
                Text("Total focus time")
                    .font(.system(size: 15))
                    .foregroundColor(.white.opacity(0.5))
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("\(currentStreak)")
                    .font(.system(size: 48, weight: .medium).monospacedDigit())
                    .foregroundColor(.white.opacity(0.85))
                Text("\(currentStreak == 1 ? "Day" : "Days") streak")
                    .font(.system(size: 15))
                    .foregroundColor(.white.opacity(0.5))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func formatFocusTime(_ seconds: Int) -> String {
        let minutes = seconds / 60
        if minutes == 0 { return "0m" }
        if minutes < 60 { return "\(minutes) min" }
        let hours = minutes / 60
        let remainingMins = minutes % 60
        if remainingMins == 0 { return "\(hours)h" }
        return "\(hours)h \(remainingMins)m"
    }
}
