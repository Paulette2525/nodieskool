import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const VAPID_PUBLIC_KEY = "BCQPQUc5dNBUdQSZxoydooFCjo8WN8KGyHTLMsU6w1QesJH0Ihf4Y7RuzP2oQec8NwWP8VceivnETHrmiCDVzE4";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { profile } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check support
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    if (!supported) setIsLoading(false);
  }, []);

  // Check current subscription status
  useEffect(() => {
    if (!isSupported || !profile) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch {
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isSupported, profile]);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported || !profile) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return false;

      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisuallyShownEnabled: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        } as PushSubscriptionOptionsInit);
      }

      const subJson = subscription.toJSON();

      // Save to database
      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: profile.id,
            endpoint: subJson.endpoint!,
            p256dh: subJson.keys!.p256dh,
            auth: subJson.keys!.auth,
          },
          { onConflict: "user_id,endpoint" }
        );

      if (error) throw error;

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Push subscription error:", err);
      return false;
    }
  }, [isSupported, profile]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported || !profile) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", profile.id)
          .eq("endpoint", endpoint);
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error("Push unsubscribe error:", err);
      return false;
    }
  }, [isSupported, profile]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
