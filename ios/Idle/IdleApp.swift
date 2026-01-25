import SwiftUI

@main
struct IdleApp: App {
    var body: some Scene {
        WindowGroup {
            SessionRootView()
                .preferredColorScheme(.dark)
        }
    }
}
