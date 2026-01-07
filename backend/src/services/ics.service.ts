import { Appointment } from '@prisma/client';
import { createEvent } from 'ics';
import { utcToZonedTime } from 'date-fns-tz';
import { AppError } from '../middleware/errorHandler';

function toDateArray(date: Date): [number, number, number, number, number] {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}

export class ICSService {
  generateICS(appointment: Appointment): string {
    const start = utcToZonedTime(appointment.startAt, appointment.timezone);
    const end = utcToZonedTime(appointment.endAt, appointment.timezone);

    const eventOptions: any = {
      title: appointment.title,
      description: appointment.description || undefined,
      start: toDateArray(start),
      end: toDateArray(end),
      startInputType: 'local',
      endInputType: 'local',
      productId: 'btrix.appointments',
      status: appointment.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
      location: appointment.location || undefined,
      calName: 'Appointments',
      organizer: appointment.metadata && (appointment.metadata as any).organizer
        ? {
            name: (appointment.metadata as any).organizer.name,
            email: (appointment.metadata as any).organizer.email,
          }
        : undefined,
    };

    const { error, value } = createEvent(eventOptions);

    if (error || !value) {
      throw new AppError(500, 'Unable to generate ICS file');
    }

    return value;
  }
}

export const icsService = new ICSService();
