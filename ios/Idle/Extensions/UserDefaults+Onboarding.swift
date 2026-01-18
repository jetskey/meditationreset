import Foundation

enum OnboardingKeys {
    static let hasSeenWelcomeAudio = "hasSeenWelcomeAudio"
}

extension UserDefaults {
    var hasSeenWelcomeAudio: Bool {
        get { bool(forKey: OnboardingKeys.hasSeenWelcomeAudio) }
        set { set(newValue, forKey: OnboardingKeys.hasSeenWelcomeAudio) }
    }
}
