const VAPID_PUBLIC_KEY = 'BDS15Y2fS-ImB30J6T05h1j7C_2VSeriHqhxCs2SCw1VGY23p1S2-bOOn2GfM1v3E0yQ7z-8o-U5h9yK4H110tI';

// This function is needed to convert the VAPID key to a suitable format
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
}

export async function subscribeUser(): Promise<PushSubscription> {
    const registration = await navigator.serviceWorker.ready;
    
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
        return existingSubscription;
    }
    
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    
    // In a real app, you'd send this subscription object to your server
    // For this demo, we can just log it
    console.log('User is subscribed:', JSON.stringify(subscription));

    return subscription;
}


export async function unsubscribeUser(): Promise<boolean> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        // In a real app, you'd also tell your server to remove this subscription
        const successful = await subscription.unsubscribe();
        console.log('User is unsubscribed.');
        return successful;
    }
    return false;
}
