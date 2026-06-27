import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../supabase';

export function usePushNotifications(currentUser) {
  useEffect(() => {
    if (!currentUser || !Capacitor.isNativePlatform()) return;

    const registerPush = async () => {
      // 1. Request Permission
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('User denied push permission');
        return;
      }

      // 2. Register with Apple / Google to receive token
      await PushNotifications.register();
    };

    registerPush();

    // 3. Listeners
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Salva o token no banco de dados para enviar notificações depois
      if (currentUser) {
        await supabase.from('profiles').update({ push_token: token.value }).eq('id', currentUser.id);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on push registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ', notification);
      // Aqui você poderia mostrar um Toast customizado dentro do app se ele estiver aberto
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
      // Aqui você pode redirecionar para a página correta quando o usuário clica na notificação fora do app
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [currentUser]);
}
