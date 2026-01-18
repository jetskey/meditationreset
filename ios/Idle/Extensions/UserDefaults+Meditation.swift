import Foundation

enum MeditationKeys {
    static let hasHeardExplanation = "hasHeardExplanation"
}

extension UserDefaults {
    var hasHeardExplanation: Bool {
        get { bool(forKey: MeditationKeys.hasHeardExplanation) }
        set { set(newValue, forKey: MeditationKeys.hasHeardExplanation) }
    }
}
