import Foundation
import AVFoundation
import Combine

final class WelcomeAudioViewModel: ObservableObject {
    @Published var displayedText: String = ""
    @Published var finished = false

    private let lines: [TypedLine]
    private var currentLineIndex = 0
    private var currentCharIndex = 0

    private var audioPlayer: AVAudioPlayer?
    private var audioTimer: AnyCancellable?
    private var typingTimer: AnyCancellable?

    init(audioFileName: String, lines: [TypedLine]) {
        self.lines = lines

        // Configure audio session for playback
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)

        guard let url = Bundle.main.url(
            forResource: audioFileName,
            withExtension: "mp3"
        ) else {
            print("Audio file not found: \(audioFileName).mp3")
            return
        }

        audioPlayer = try? AVAudioPlayer(contentsOf: url)
        audioPlayer?.prepareToPlay()
    }

    func play() {
        audioPlayer?.play()

        // Check audio time to unlock typing
        audioTimer = Timer.publish(every: 0.02, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.checkAudioTime()
            }
    }

    func stop() {
        audioTimer?.cancel()
        typingTimer?.cancel()
        audioPlayer?.stop()
    }

    private func checkAudioTime() {
        guard let player = audioPlayer else { return }

        if currentLineIndex < lines.count {
            let line = lines[currentLineIndex]

            if player.currentTime >= line.startTime,
               typingTimer == nil {
                startTypingCurrentLine()
            }
        } else if !player.isPlaying {
            finish()
        }
    }

    private func startTypingCurrentLine() {
        let line = lines[currentLineIndex]
        let characters = Array(line.text)

        typingTimer = Timer.publish(
            every: line.charInterval,
            on: .main,
            in: .common
        )
        .autoconnect()
        .sink { [weak self] _ in
            guard let self else { return }

            if self.currentCharIndex < characters.count {
                self.displayedText.append(characters[self.currentCharIndex])
                self.currentCharIndex += 1
            } else {
                // Add newlines between sentences
                self.displayedText.append("\n\n")
                self.currentCharIndex = 0
                self.currentLineIndex += 1
                self.typingTimer?.cancel()
                self.typingTimer = nil
            }
        }
    }

    private func finish() {
        audioTimer?.cancel()
        typingTimer?.cancel()
        finished = true
        UserDefaults.standard.hasSeenWelcomeAudio = true
    }
}
