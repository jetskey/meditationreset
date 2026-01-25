import SwiftUI

/// Orbital rings visualization matching the web app's IdleOrb component
/// Structural geometry with warm color palette
struct IdleOrbView: View {
    enum Mode {
        case idle
        case entering
        case active
        case completing
        case complete
    }

    var mode: Mode = .idle
    var progress: Double = 0
    var timeDisplay: String? = nil
    var size: CGFloat = 240

    // Animation state
    @State private var rotation: Double = 0
    @State private var pulsePhase: Double = 0

    // Mode-dependent parameters
    private var params: AnimationParams {
        switch mode {
        case .idle:
            return AnimationParams(ringOpacity: 0.12, coreGlow: 0.7, rotationSpeed: 0.012, pulseDepth: 0.06)
        case .entering:
            return AnimationParams(ringOpacity: 0.18, coreGlow: 1.0, rotationSpeed: 0.025, pulseDepth: 0.08)
        case .active:
            return AnimationParams(ringOpacity: 0.15, coreGlow: 0.85, rotationSpeed: 0.018, pulseDepth: 0.05)
        case .completing:
            return AnimationParams(ringOpacity: 0.20, coreGlow: 1.0, rotationSpeed: 0.008, pulseDepth: 0.07)
        case .complete:
            return AnimationParams(ringOpacity: 0.08, coreGlow: 0.5, rotationSpeed: 0.004, pulseDepth: 0.02)
        }
    }

    private var pulse: CGFloat {
        1.0 + sin(pulsePhase) * params.pulseDepth
    }

    // Warm color palette (no green)
    private let ringColor = Color(red: 180/255, green: 165/255, blue: 140/255)
    private let markerColor = Color(red: 200/255, green: 180/255, blue: 150/255)
    private let coreColor = Color(red: 230/255, green: 225/255, blue: 215/255)
    private let glowColor = Color(red: 180/255, green: 160/255, blue: 130/255)

    var body: some View {
        ZStack {
            // Soft glow field
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            glowColor.opacity(0.04 * params.coreGlow),
                            glowColor.opacity(0.02 * params.coreGlow),
                            .clear
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: size * 0.2
                    )
                )
                .frame(width: size * 0.4, height: size * 0.4)

            // Structural rings
            ForEach(0..<3) { ringIndex in
                RingView(
                    ringIndex: ringIndex,
                    rotation: rotation,
                    pulse: pulse,
                    ringOpacity: params.ringOpacity,
                    ringColor: ringColor,
                    size: size
                )
            }

            // Cardinal markers
            ForEach(0..<4) { i in
                let angle = Double(i) * .pi / 2 + rotation * 0.3
                let radius = size * 0.44 * pulse
                Circle()
                    .fill(markerColor.opacity(params.ringOpacity * 1.5))
                    .frame(width: 3, height: 3)
                    .offset(
                        x: cos(angle) * radius,
                        y: sin(angle) * radius
                    )
            }

            // Progress arc (active/completing modes only)
            if mode == .active || mode == .completing {
                Circle()
                    .stroke(ringColor.opacity(0.04), lineWidth: 1)
                    .frame(width: size - 36, height: size - 36)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        markerColor.opacity(0.35),
                        style: StrokeStyle(lineWidth: 1.5, lineCap: .round)
                    )
                    .frame(width: size - 36, height: size - 36)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.5), value: progress)
            }

            // Core aperture
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            coreColor.opacity(0.9 * params.coreGlow),
                            coreColor.opacity(0.5 * params.coreGlow),
                            coreColor.opacity(0.2 * params.coreGlow)
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 12 * pulse
                    )
                )
                .frame(width: 24 * pulse, height: 24 * pulse)

            // Time display
            if let time = timeDisplay, mode == .active {
                Text(time)
                    .font(.system(size: 30, weight: .medium, design: .monospaced))
                    .monospacedDigit()
                    .foregroundColor(.white.opacity(0.7))
            }

            if let time = timeDisplay, mode == .completing {
                Text(time)
                    .font(.system(size: 24, weight: .medium, design: .monospaced))
                    .monospacedDigit()
                    .foregroundColor(.white.opacity(0.4))
            }

            if mode == .complete {
                Text("Done")
                    .font(.system(size: 14, weight: .medium))
                    .tracking(3)
                    .textCase(.uppercase)
                    .foregroundColor(.white.opacity(0.5))
            }
        }
        .frame(width: size, height: size)
        .onAppear {
            startAnimations()
        }
        .onChange(of: mode) { _ in
            // Parameters will update automatically via computed property
        }
    }

    private func startAnimations() {
        // Continuous rotation
        withAnimation(.linear(duration: 100).repeatForever(autoreverses: false)) {
            rotation = .pi * 2
        }

        // Breathing pulse
        withAnimation(.easeInOut(duration: 6.5).repeatForever(autoreverses: true)) {
            pulsePhase = .pi
        }
    }
}

// MARK: - Ring View

private struct RingView: View {
    let ringIndex: Int
    let rotation: Double
    let pulse: CGFloat
    let ringOpacity: Double
    let ringColor: Color
    let size: CGFloat

    private var ringRadius: CGFloat {
        let radii: [CGFloat] = [0.4, 0.29, 0.19] // Proportional to size
        return size * radii[ringIndex] * pulse
    }

    private var segments: Int {
        [60, 40, 24][ringIndex]
    }

    private var gap: Double {
        [0.15, 0.2, 0.25][ringIndex]
    }

    private var direction: Double {
        ringIndex % 2 == 0 ? 1 : -0.7
    }

    var body: some View {
        ForEach(0..<segments, id: \.self) { i in
            let segmentAngle = (Double.pi * 2) / Double(segments)
            let gapAngle = segmentAngle * gap
            let drawAngle = segmentAngle - gapAngle
            let startAngle = rotation * direction + Double(i) * segmentAngle

            Path { path in
                path.addArc(
                    center: CGPoint(x: size/2, y: size/2),
                    radius: ringRadius,
                    startAngle: .radians(startAngle),
                    endAngle: .radians(startAngle + drawAngle),
                    clockwise: false
                )
            }
            .stroke(
                ringColor.opacity(ringOpacity * (1 - Double(ringIndex) * 0.2)),
                lineWidth: 1
            )
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Animation Parameters

private struct AnimationParams {
    let ringOpacity: Double
    let coreGlow: Double
    let rotationSpeed: Double
    let pulseDepth: CGFloat
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        IdleOrbView(mode: .active, progress: 0.35, timeDisplay: "5:42")
    }
}
