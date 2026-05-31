import ActivityKit
import Capacitor
import Foundation
import TimerShared

@objc(TimerBridgePlugin)
public class TimerBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    @objc public let identifier = "TimerBridgePlugin"
    @objc public let jsName = "TimerBridge"
    @objc public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setTimer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearTimer", returnType: CAPPluginReturnPromise),
    ]

    private let appGroup = "group.com.sauuri.resetpilot"

    @objc func setTimer(_ call: CAPPluginCall) {
        guard let durationSecs = call.getDouble("durationSecs") else {
            call.reject("durationSecs required"); return
        }
        let label = call.getString("label") ?? ""
        let endDate = Date().addingTimeInterval(durationSecs)
        let endTimeMs = endDate.timeIntervalSince1970 * 1000

        if let d = UserDefaults(suiteName: appGroup) {
            d.set(endTimeMs, forKey: "timerEndTime")
            d.set(label,    forKey: "timerLabel")
            d.synchronize()
        }

        if #available(iOS 16.2, *) {
            Task {
                await startLiveActivity(endDate: endDate, label: label, call: call)
            }
        } else {
            call.resolve(["status": "ios_too_old"])
        }
    }

    @objc func clearTimer(_ call: CAPPluginCall) {
        if let d = UserDefaults(suiteName: appGroup) {
            d.removeObject(forKey: "timerEndTime")
            d.removeObject(forKey: "timerLabel")
            d.synchronize()
        }

        if #available(iOS 16.2, *) {
            Task {
                for activity in Activity<TimerActivityAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                call.resolve()
            }
        } else {
            call.resolve()
        }
    }

    @available(iOS 16.2, *)
    private func startLiveActivity(endDate: Date, label: String, call: CAPPluginCall) async {
        let info = ActivityAuthorizationInfo()
        guard info.areActivitiesEnabled else {
            call.resolve(["status": "disabled", "detail": "areActivitiesEnabled=false"])
            return
        }

        let state = TimerActivityAttributes.ContentState(endTime: endDate, label: label)
        let content = ActivityContent(state: state, staleDate: endDate)

        let existing = Activity<TimerActivityAttributes>.activities
        if let activity = existing.first {
            await activity.update(content)
            call.resolve(["status": "updated"])
        } else {
            do {
                let activity = try Activity.request(
                    attributes: TimerActivityAttributes(),
                    content: content,
                    pushType: nil
                )
                let actState = "\(activity.activityState)"
                call.resolve(["status": "started", "id": activity.id, "activityState": actState])
                Task {
                    let wait = endDate.timeIntervalSinceNow
                    if wait > 0 { try? await Task.sleep(nanoseconds: UInt64(wait * 1_000_000_000)) }
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
            } catch {
                call.resolve(["status": "error", "detail": error.localizedDescription])
            }
        }
    }
}
