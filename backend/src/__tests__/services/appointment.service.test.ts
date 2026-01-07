import { appointmentService } from '../../services/appointment.service';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../utils/prisma', () => ({
  appointment: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  tenantCalendarSettings: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

describe('AppointmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.tenantCalendarSettings.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'tenant-1',
      defaultTimezone: 'Europe/Dublin',
      preventOverbooking: true,
    });
  });

  it('throws when overlap is detected and preventOverbooking is enabled', async () => {
    (prisma.appointment.findFirst as jest.Mock).mockResolvedValue({
      id: 'existing',
    });

    await expect(
      appointmentService.createAppointment(
        'tenant-1',
        {
          title: 'Test Appointment',
          startAt: new Date('2024-01-01T10:00:00Z'),
          endAt: new Date('2024-01-01T11:00:00Z'),
          timezone: 'Europe/Dublin',
          assignedUserId: 'user-1',
        },
        'creator-1'
      )
    ).rejects.toBeInstanceOf(AppError);
  });
});

