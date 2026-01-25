import SwiftUI

/// Orbital visualization - always pulses, even when idle
struct IdleOrbView: View {
    enum Mode {
        case idle, entering, active, completing, complete
    }

    var mode: Mode = .idle
    var progress: Double = 0
    var timeDisplay: String? = nil
    var size: CGFloat = 240

    // Continuous animation state - always active
    @State private var rotation: Double = 0
    @State private var pulse: CGFloat = 1.0

    // Warm colors
    private let ringColor = Color(red: 0.7, green: 0.65, blue: 0.55)
    private let coreColor = Color(red: 0.9, green: 0.88, blue: 0.84)

    private var ringOpacity: Double {
        switch mode {
        case .idle: return 0.12
        case .entering: return 0.18
        case .active: return 0.15
        case .completing: return 0.20
        case .complete: return 0.08
        }
    }

    private var coreOpacity: Double {
        switch mode {
        case .idle: return 0.7
        case .entering, .completing: return 1.0
        case .active: return 0.85
        case .complete: return 0.5
        }
    }

    var body: some View {
        ZStack {
            // Outer ring
            Circle()
                .stroke(ringColor.opacity(ringOpacity), lineWidth: 1)
                .frame(width: size * 0.79 * pulse, height: size * 0.79 * pulse)
                .rotationEffect(.degrees(rotation))

            // Middle ring
            Circle()
                .stroke(ringColor.opacity(ringOpacity * 0.8), lineWidth: 1)
                .frame(width: size * 0.58 * pulse, height: size * 0.58 * pulse)
                .rotationEffect(.degrees(-rotation * 0.7))

            // Inner ring
            Circle()
                .stroke(ringColor.opacity(ringOpacity * 0.6), lineWidth: 1)
                .frame(width: size * 0.38 * pulse, height: size * 0.38 * pulse)
                .rotationEffect(.degrees(rotation * 0.5))

            // Progress arc (only during active/completing)
            if mode == .active || mode == .completing {
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(ringColor.opacity(0.35), style: StrokeStyle(lineWidth: 1.5, lineCap: .round))
                    .frame(width: size - 36, height: size - 36)
                    .rotationEffect(.degrees(-90))
            }

            // Core glow
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            coreColor.opacity(0.9 * coreOpacity),
                            coreColor.opacity(0.3 * coreOpacity),
                            .clear
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 24 * pulse
                    )
                )
                .frame(width: 48 * pulse, height: 48 * pulse)

            // Core
            Circle()
                .fill(coreColor.opacity(0.9 * coreOpacity))
                .frame(width: 12 * pulse, height: 12 * pulse)

            // Time display
            if let time = timeDisplay {
                Text(time)
                    .font(.system(size: mode == .active ? 32 : 24, weight: .medium, design: .monospaced))
                    .foregroundColor(.white.opacity(mode == .active ? 0.7 : 0.4))
            }

            // Complete text
            if mode == .complete {
                Text("DONE")
                    .font(.system(size: 12, weight: .medium))
                    .tracking(3)
                    .foregroundColor(.white.opacity(0.5))
            }
        }
        .frame(width: size, height: size)
        .onAppear {
            startContinuousAnimations()
        }
    }

    private func startContinuousAnimations() {
        // Continuous rotation - slow and subtle
        withAnimation(.linear(duration: 60).repeatForever(autoreverses: false)) {
            rotation = 360
        }

        // Continuous breathing pulse - always active, calm and subtle
        // Duration: 4 seconds per cycle, scale: 1.0 -> 1.04
        withAnimation(.easeInOut(duration: 4).repeatForever(autoreverses: true)) {
            pulse = 1.04
        }
    }
}

struct IdleOrbView_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            IdleOrbView(mode: .idle)
        }
    }
}
