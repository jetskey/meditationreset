import Foundation
import AVFoundation

final class MeditationAudioCoordinator: NSObject, ObservableObject {
    @Published var isPlaying = false
    @Published var finished = false

    private var explanationPlayer: AVAudioPlayer?
    private var meditationPlayer: AVAudioPlayer?

    private enum Phase {
        case idle
        case explanation
        case meditation
    }

    private var phase: Phase = .idle

    private let crossfadeDuration: TimeInterval = 3.0
    private let endFadeDuration: TimeInterval = 8.0
    private let silenceAfterEnd: TimeInterval = 3.0

    // MARK: - Entry

    func begin(playExplanation: Bool) {
        if playExplanation {
            playExplanationAudio()
        } else {
            playMeditation()
        }
    }

    // MARK: - Explanation

    private func playExplanationAudio() {
        guard let url = Bundle.main.url(
            forResource: "explanation.slower",
            withExtension: "m4a"
        ) else {
            playMeditation()
            return
        }

        do {
            explanationPlayer = try AVAudioPlayer(contentsOf: url)
            explanationPlayer?.volume = 1.0
            explanationPlayer?.play()
            phase = .explanation
            isPlaying = true

            scheduleCrossfadeToMeditation()
        } catch {
            playMeditation()
        }
    }

    private func scheduleCrossfadeToMeditation() {
        guard let explanationPlayer else { return }

        let startTime = max(
            0,
            explanationPlayer.duration - crossfadeDuration
        )

        DispatchQueue.main.asyncAfter(deadline: .now() + startTime) {
            self.playMeditation(fadeIn: true)
            explanationPlayer.setVolume(0.0, fadeDuration: self.crossfadeDuration)
        }
    }

    // MARK: - Meditation

    private func playMeditation(fadeIn: Bool = false) {
        guard let url = Bundle.main.url(
            forResource: "guided_session",
            withExtension: "m4a"
        ) else {
            return
        }

        do {
            meditationPlayer = try AVAudioPlayer(contentsOf: url)
            meditationPlayer?.volume = fadeIn ? 0.0 : 1.0
            meditationPlayer?.play()
            phase = .meditation
            isPlaying = true

            if fadeIn {
                meditationPlayer?.setVolume(1.0, fadeDuration: crossfadeDuration)
            }

            scheduleEndFade()
        } catch {
            return
        }
    }

    // MARK: - End handling

    private func scheduleEndFade() {
        guard let meditationPlayer else { return }

        let fadeStart = max(
            0,
            meditationPlayer.duration - endFadeDuration
        )

        DispatchQueue.main.asyncAfter(deadline: .now() + fadeStart) {
            meditationPlayer.setVolume(0.0, fadeDuration: self.endFadeDuration)
        }

        DispatchQueue.main.asyncAfter(
            deadline: .now()
                + meditationPlayer.duration
                + silenceAfterEnd
        ) {
            self.isPlaying = false
            self.finished = true
        }
    }
}
