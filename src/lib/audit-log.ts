import type { AuditAction, Prisma, UserRole } from '@prisma/client';
import { prisma } from './prisma';

export interface WriteAuditLogInput {
  actorUserId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  restaurantId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      restaurantId: input.restaurantId,
      metadata: input.metadata ?? {},
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
