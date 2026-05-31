import ActivityKit
import UIKit
import Capacitor
import TimerShared
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Disable WKWebView back/forward swipe gesture
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.disableWebViewSwipe(in: self.window?.rootViewController?.view)
        }
        return true
    }

    private func disableWebViewSwipe(in view: UIView?) {
        guard let view = view else { return }
        for subview in view.subviews {
            if let webView = subview as? WKWebView {
                webView.allowsBackForwardNavigationGestures = false
                webView.scrollView.bounces = false
                webView.scrollView.alwaysBounceHorizontal = false
                return
            }
            disableWebViewSwipe(in: subview)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        if #available(iOS 16.2, *) {
            Task {
                for activity in Activity<TimerActivityAttributes>.activities {
                    if activity.content.state.endTime <= Date() {
                        await activity.end(nil, dismissalPolicy: .immediate)
                    }
                }
            }
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        guard #available(iOS 16.2, *) else { return }
        let activities = Array(Activity<TimerActivityAttributes>.activities)
        guard !activities.isEmpty else { return }
        let sema = DispatchSemaphore(value: 0)
        Task.detached {
            for activity in activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            sema.signal()
        }
        sema.wait(timeout: .now() + 2)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
