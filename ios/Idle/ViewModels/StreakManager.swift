import Foundation

final class StreakManager: ObservableObject {
    @Published private(set) var daysReturned: Int = 0

    private let daysKey = "streak_days"
    private let lastDateKey = "streak_last_date"

    init() {
        load()
    }

    func registerSessionIfNeeded() {
        let today = Calendar.current.startOfDay(for: Date())

        let lastDate = UserDefaults.standard.object(forKey: lastDateKey) as? Date

        // If this is the first ever session
        guard let lastDate else {
            daysReturned = 1
            persist(today: today)
            return
        }

        // If already counted today, do nothing
        if Calendar.current.isDate(lastDate, inSameDayAs: today) {
            return
        }

        // New day → increment quietly
        daysReturned += 1
        persist(today: today)
    }

    private func persist(today: Date) {
        UserDefaults.standard.set(daysReturned, forKey: daysKey)
        UserDefaults.standard.set(today, forKey: lastDateKey)
    }

    private func load() {
        daysReturned = UserDefaults.standard.integer(forKey: daysKey)
    }
}
