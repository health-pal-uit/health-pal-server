import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const firebaseAdminProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: (configService: ConfigService) => {
    const projectId = configService.get('PROJECT_ID');
    const privateKey = configService.get('PRIVATE_KEY');
    const clientEmail = configService.get('CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      console.warn(
        'Firebase Admin credentials not configured. Push notifications will be disabled.',
      );
      return null; // Return null instead of initializing Firebase
    }

    if (admin.apps.length === 0) {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });
    }
    return admin.app();
  },
  inject: [ConfigService],
};
