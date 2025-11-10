import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const firebaseAdminProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: (configService: ConfigService) => {
    if (admin.apps.length === 0) {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId: configService.get('PROJECT_ID'),
          privateKey: configService.get('PRIVATE_KEY')?.replace(/\\n/g, '\n'),
          clientEmail: configService.get('CLIENT_EMAIL'),
        }),
      });
    }
    return admin.app();
  },
  inject: [ConfigService],
};
