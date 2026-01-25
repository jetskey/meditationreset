import Foundation
import AVFoundation
import Combine

final class MeditationAudioCoordinator: NSObject, ObservableObject {
    @Published var isPlaying = false
    @Published var finished = false
    @Published var elapsed: TimeInterval = 0
    @Published var phase: Phase = .idle

    enum Phase {
        case idle
        case entering
        case explanation
        case playing
        case completing
        case complete
    }

    private var explanationPlayer: AVAudioPlayer?
    private var meditationPlayer: AVAudioPlayer?
    private var progressTimer: AnyCancellable?

    private let fadeInDuration: TimeInterval = 1.5
    private let fadeOutDuration: TimeInterval = 3.0
    private let fadeOutDelay: TimeInterval = 0.6
    let sessionDuration: TimeInterval = 420 // 7 minutes

    override init() {
        super.init()
        // Configure audio session
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    // MARK: - Entry

    func begin(playExplanation: Bool) {
        phase = .entering

        // Small delay for transition feel
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            if playExplanation {
                self.playExplanationAudio()
            } else {
                self.playMeditation()
            }
        }
    }

    func endEarly() {
        progressTimer?.cancel()
        phase = .completing

        if let player = meditationPlayer {
            // Fade out over 3 seconds
            player.setVolume(0.0, fadeDuration: fadeOutDuration)

            DispatchQueue.main.asyncAfter(deadline: .now() + fadeOutDuration + fadeOutDelay) {
                player.stop()
                self.phase = .complete
                self.finished = true
            }
        } else {
            phase = .complete
            finished = true
        }
    }

    // MARK: - Explanation

    private func playExplanationAudio() {
        guard let url = Bundle.main.url(
            forResource: "explanation",
            withExtension: "m4a"
        ) else {
            playMeditation()
            return
        }

        do {
            explanationPlayer = try AVAudioPlayer(contentsOf: url)
            explanationPlayer?.volume = 0.0
            explanationPlayer?.play()
            explanationPlayer?.setVolume(0.9, fadeDuration: 1.0)
            phase = .explanation
            isPlaying = true

            scheduleCrossfadeToMeditation()
        } catch {
            playMeditation()
        }
    }

    private func scheduleCrossfadeToMeditation() {
        guard let explanationPlayer else { return }

        let crossfadeDuration: TimeInterval = 3.0
        let startTime = max(0, explanationPlayer.duration - crossfadeDuration)

        DispatchQueue.main.asyncAfter(deadline: .now() + startTime) {
            self.playMeditation(fadeIn: true)
            explanationPlayer.setVolume(0.0, fadeDuration: crossfadeDuration)
        }
    }

    // MARK: - Meditation

    private func playMeditation(fadeIn: Bool = false) {
        // Use the new finalaudioidle.mp3 file
        guard let url = Bundle.main.url(
            forResource: "finalaudioidle",
            withExtension: "mp3"
        ) else {
            print("Audio file not found: finalaudioidle.mp3")
            return
        }

        do {
            meditationPlayer = try AVAudioPlayer(contentsOf: url)
            meditationPlayer?.volume = fadeIn ? 0.0 : 0.0
            meditationPlayer?.play()
            phase = .playing
            isPlaying = true

            // Fade in
            meditationPlayer?.setVolume(0.8, fadeDuration: fadeInDuration)

            startProgressTimer()
            scheduleEndFade()
        } catch {
            print("Failed to play meditation audio: \(error)")
        }
    }

    // MARK: - Progress tracking

    private func startProgressTimer() {
        progressTimer = Timer.publish(every: 0.25, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self, let player = self.meditationPlayer else { return }
                self.elapsed = min(player.currentTime, self.sessionDuration)
            }
    }

    // MARK: - End handling

    private func scheduleEndFade() {
        guard let meditationPlayer else { return }

        let fadeStart = max(0, sessionDuration - fadeOutDuration)

        DispatchQueue.main.asyncAfter(deadline: .now() + fadeStart) {
            self.phase = .completing
            meditationPlayer.setVolume(0.0, fadeDuration: self.fadeOutDuration)
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + self.sessionDuration + self.fadeOutDelay) {
            self.progressTimer?.cancel()
            meditationPlayer.stop()
            self.isPlaying = false
            self.phase = .complete
            self.finished = true
        }
    }

    var remaining: TimeInterval {
        max(0, sessionDuration - elapsed)
    }

    var progress: Double {
        elapsed / sessionDuration
    }

    var timeDisplay: String {
        let rem = Int(remaining)
        let mm = rem / 60
        let ss = rem % 60
        return String(format: "%d:%02d", mm, ss)
    }
}
