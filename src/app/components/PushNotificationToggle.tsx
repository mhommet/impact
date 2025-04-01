'use client';

import React, { useEffect, useState } from 'react';

import {
  askNotificationPermission,
  isPushNotificationSubscribed,
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '../../../lib/pushNotification';

interface PushNotificationToggleProps {
  className?: string;
}

const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({ className = '' }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);

      // Vérifier si les notifications push sont supportées
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        // Vérifier la permission actuelle
        const permission = Notification.permission;
        setPermissionState(permission);

        // Vérifier si l'utilisateur est déjà abonné
        const subscribed = await isPushNotificationSubscribed();
        setIsSubscribed(subscribed);
      }

      setIsLoading(false);
    };

    checkStatus();
  }, []);

  const handleToggle = async () => {
    if (isLoading || !isSupported) return;

    try {
      setIsLoading(true);

      if (isSubscribed) {
        // Désabonner l'utilisateur des notifications push
        await unsubscribeFromPushNotifications();
        setIsSubscribed(false);
      } else {
        // Demander la permission et abonner l'utilisateur
        const permission = await askNotificationPermission();
        setPermissionState(permission);

        if (permission === 'granted') {
          await subscribeToPushNotifications();
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des notifications push:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Les notifications push ne sont pas supportées par votre navigateur.
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="mr-3 flex-grow">
        <p className="font-medium text-gray-700">Notifications push</p>
        <p className="text-sm text-gray-500">
          {isSubscribed
            ? "Vous recevrez des notifications même lorsque l'application est fermée"
            : 'Activez les notifications pour être informé des mises à jour importantes'}
        </p>
      </div>
      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={isLoading || permissionState === 'denied'}
          className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            ${isSubscribed ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${permissionState === 'denied' ? 'opacity-50 cursor-not-allowed bg-red-300' : ''}
          `}
          aria-pressed={isSubscribed}
          aria-busy={isLoading}
        >
          <span className="h-6 w-6 rounded-full bg-white shadow-md transform transition-transform" />
        </button>
        {permissionState === 'denied' && (
          <div className="absolute top-10 right-0 w-64 p-2 bg-red-100 text-red-700 text-xs rounded-md">
            Les notifications sont bloquées. Veuillez modifier les paramètres de votre navigateur.
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationToggle;
