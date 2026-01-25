import SwiftUI
import AVFoundation

struct MeditationSessionView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var audio = SessionAudioPlayer()

    // Stats storage
    @AppStorage("totalFocusSeconds") private var totalFocusSeconds: Int = 0
    @AppStorage("currentStreak") private var currentStreak: Int = 0
    @AppStorage("lastSessionDate") private var lastSessionDate: String = ""
    @AppStorage("sessionsToday") private var sessionsToday: Int = 0
    @AppStorage("sessionsTodayDate") private var sessionsTodayDate: String = ""

    @State private var showExit = false
    @State private var hasRecorded = false  // Prevent double recording

    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()

            if audio.isComplete {
                completionContent
            } else {
                sessionContent
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            UIApplication.shared.isIdleTimerDisabled = true
            resetSessionsTodayIfNeeded()
            audio.begin()
        }
        .onDisappear {
            UIApplication.shared.isIdleTimerDisabled = false
            audio.stop()
        }
    }

    // MARK: - Session Content

    private var sessionContent: some View {
        VStack(spacing: 0) {
            HStack {
                Button {
                    recordSessionIfNeeded()
                    audio.stop()
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.white.opacity(showExit ? 0.5 : 0.15))
                }
                Spacer()
                Text(audio.phase == .explanation ? "EXPLANATION" : "SESSION")
                    .font(.system(size: 11, weight: .medium))
                    .tracking(1.5)
                    .foregroundColor(.white.opacity(0.35))
                Spacer()
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.clear)
            }
            .padding(.horizontal, 32)
            .padding(.top, 8)

            Spacer(minLength: 0)

            IdleOrbView(
                mode: audio.phase == .explanation ? .entering : .active,
                progress: audio.progress,
                timeDisplay: audio.phase == .playing ? audio.timeDisplay : nil,
                size: 260
            )

            Spacer(minLength: 0)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            showExit = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                showExit = false
            }
        }
    }

    // MARK: - Completion Content

    private var completionContent: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 0)

            IdleOrbView(mode: .complete, size: 180)
                .padding(.bottom, 48)

            Text("+\(formatTime(audio.elapsedSeconds))")
                .font(.system(size: 48, weight: .medium).monospacedDigit())
                .foregroundColor(.white.opacity(0.85))

            Text("Complete.")
                .font(.system(size: 15))
                .foregroundColor(.white.opacity(0.6))
                .padding(.top, 16)

            Spacer(minLength: 0)

            Text("TAP TO CONTINUE")
                .font(.system(size: 11, weight: .medium))
                .tracking(1.5)
                .foregroundColor(.white.opacity(0.25))
                .padding(.bottom, 40)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            recordSessionIfNeeded()
            dismiss()
        }
        .onAppear {
            // Record immediately on completion
            recordSessionIfNeeded()
            // Auto-dismiss after delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
                dismiss()
            }
        }
    }

    // MARK: - Stats Logic

    private func resetSessionsTodayIfNeeded() {
        let today = getTodayISO()
        if sessionsTodayDate != today {
            sessionsToday = 0
            sessionsTodayDate = today
        }
    }

    private func recordSessionIfNeeded() {
        guard !hasRecorded else { return }
        hasRecorded = true

        let seconds = audio.elapsedSeconds
        guard seconds >= 60 else { return }  // Minimum 1 minute

        let today = getTodayISO()
        let yesterday = getYesterdayISO()

        // Always add focus time
        totalFocusSeconds += seconds

        // Update streak (only changes once per day)
        if lastSessionDate == yesterday {
            // Continuing streak from yesterday
            currentStreak += 1
        } else if lastSessionDate != today {
            // Starting fresh (either first session or broke streak)
            currentStreak = 1
        }
        // If lastSessionDate == today, streak stays same (already counted today)

        // Update session count and date
        sessionsToday += 1
        sessionsTodayDate = today
        lastSessionDate = today
    }

    private func getTodayISO() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    private func getYesterdayISO() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date()
        return formatter.string(from: yesterday)
    }

    private func formatTime(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        if m == 0 { return "\(s)s" }
        if s == 0 { return "\(m) min" }
        return "\(m):\(String(format: "%02d", s))"
    }
}

// MARK: - Session Phase

enum SessionPhase {
    case explanation
    case playing
    case completing
}

// MARK: - Audio Player

class SessionAudioPlayer: ObservableObject {
    @Published var progress: Double = 0
    @Published var timeDisplay: String = "7:00"
    @Published var elapsedSeconds: Int = 0
    @Published var isComplete: Bool = false
    @Published var phase: SessionPhase = .explanation

    private var explanationPlayer: AVAudioPlayer?
    private var meditationPlayer: AVAudioPlayer?
    private var timer: Timer?
    private let duration: Double = 420

    @AppStorage("hasHeardExplanation") private var hasHeardExplanation: Bool = false

    init() {
        try? AVAudioSession.sharedInstance().setCategory(.playback)
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    func begin() {
        if let url = Bundle.main.url(forResource: "finalaudioidle", withExtension: "mp3") {
            meditationPlayer = try? AVAudioPlayer(contentsOf: url)
            meditationPlayer?.prepareToPlay()
        }

        if !hasHeardExplanation {
            if let url = Bundle.main.url(forResource: "explanation", withExtension: "m4a") {
                explanationPlayer = try? AVAudioPlayer(contentsOf: url)
                explanationPlayer?.prepareToPlay()
                playExplanation()
            } else {
                hasHeardExplanation = true
                startMeditation()
            }
        } else {
            phase = .playing
            startMeditation()
        }
    }

    private func playExplanation() {
        phase = .explanation
        hasHeardExplanation = true

        explanationPlayer?.volume = 0
        explanationPlayer?.play()

        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] t in
            guard let self, let p = self.explanationPlayer else { t.invalidate(); return }
            if p.volume < 0.9 { p.volume += 0.03 } else { t.invalidate() }
        }

        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            guard let self, let p = self.explanationPlayer else { return }
            if !p.isPlaying && p.currentTime > 0 {
                self.timer?.invalidate()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { self.startMeditation() }
            }
        }
    }

    private func startMeditation() {
        phase = .playing
        guard let player = meditationPlayer else { return }

        player.volume = 0
        player.play()

        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] t in
            guard let self, let p = self.meditationPlayer else { t.invalidate(); return }
            if p.volume < 0.8 { p.volume += 0.02 } else { t.invalidate() }
        }

        startProgressTimer()
    }

    func stop() {
        timer?.invalidate()
        explanationPlayer?.stop()
        meditationPlayer?.stop()
    }

    private func startProgressTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
            self?.updateProgress()
        }
    }

    private func updateProgress() {
        guard let player = meditationPlayer else { return }

        let current = min(player.currentTime, duration)
        let remaining = max(0, duration - current)

        elapsedSeconds = Int(current)
        progress = current / duration

        let m = Int(remaining) / 60
        let s = Int(remaining) % 60
        timeDisplay = "\(m):\(String(format: "%02d", s))"

        if current >= duration || !player.isPlaying {
            timer?.invalidate()
            phase = .completing

            Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] t in
                guard let self, let p = self.meditationPlayer else { t.invalidate(); return }
                if p.volume > 0.05 {
                    p.volume -= 0.05
                } else {
                    p.stop()
                    t.invalidate()
                    DispatchQueue.main.async { self.isComplete = true }
                }
            }
        }
    }
}
