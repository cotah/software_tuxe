import { icsService } from '../../services/ics.service';

describe('ICSService', () => {
  it('generates an ICS file with DTSTART and DTEND', () => {
    const ics = icsService.generateICS({
      id: 'appt-1',
      tenantId: 'tenant-1',
      title: 'Demo Appointment',
      description: 'Review session',
      status: 'SCHEDULED',
      startAt: new Date('2024-01-01T10:00:00Z'),
      endAt: new Date('2024-01-01T11:00:00Z'),
      timezone: 'Europe/Dublin',
      customerId: null,
      assignedUserId: null,
      location: 'Online',
      metadata: null,
      createdByUserId: 'creator-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    expect(ics).toContain('DTSTART');
    expect(ics).toContain('DTEND');
    expect(ics.length).toBeGreaterThan(0);
  });
});

