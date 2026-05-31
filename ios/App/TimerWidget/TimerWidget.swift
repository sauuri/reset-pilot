import WidgetKit
import SwiftUI

private let appGroup = "group.com.sauuri.resetpilot"

struct TimerEntry: TimelineEntry {
    let date: Date
    let endTime: Date?
    let label: String
}

struct TimerProvider: TimelineProvider {
    func placeholder(in context: Context) -> TimerEntry {
        TimerEntry(date: .now, endTime: Date().addingTimeInterval(600), label: "Body Reset")
    }
    func getSnapshot(in context: Context, completion: @escaping (TimerEntry) -> Void) {
        completion(makeEntry())
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<TimerEntry>) -> Void) {
        let entry = makeEntry()
        let refresh = entry.endTime.map { max($0, Date().addingTimeInterval(60)) } ?? Date().addingTimeInterval(300)
        completion(Timeline(entries: [entry], policy: .after(refresh)))
    }
    private func makeEntry() -> TimerEntry {
        let d = UserDefaults(suiteName: appGroup)
        let ms = d?.double(forKey: "timerEndTime") ?? 0
        let label = d?.string(forKey: "timerLabel") ?? ""
        let end: Date? = ms > 0 ? Date(timeIntervalSince1970: ms / 1000) : nil
        return TimerEntry(date: .now, endTime: end.flatMap { $0 > .now ? $0 : nil }, label: label)
    }
}

struct TimerWidgetView: View {
    let entry: TimerEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(red: 0.01, green: 0.08, blue: 0.16)
            if let end = entry.endTime {
                VStack(spacing: 3) {
                    Text("✈️ RESET PILOT")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.white.opacity(0.45))
                        .kerning(1.2)
                    Text(end, style: .timer)
                        .font(.system(size: family == .systemSmall ? 36 : 44, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                        .monospacedDigit()
                        .minimumScaleFactor(0.7)
                    if !entry.label.isEmpty {
                        Text(entry.label)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(Color(red: 0.43, green: 0.71, blue: 0.94))
                            .lineLimit(1)
                    }
                }
                .padding(10)
            } else {
                VStack(spacing: 6) {
                    Text("✈️")
                        .font(.system(size: 28))
                    Text("Reset Pilot")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                    Text("타이머 없음")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.4))
                }
            }
        }
        .containerBackground(Color(red: 0.01, green: 0.08, blue: 0.16), for: .widget)
    }
}

@main
struct TimerWidget: Widget {
    let kind = "ResetPilotTimer"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TimerProvider()) { entry in
            TimerWidgetView(entry: entry)
        }
        .configurationDisplayName("Reset Pilot 타이머")
        .description("진행 중인 액션 타이머를 홈 화면에서 확인하세요.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
