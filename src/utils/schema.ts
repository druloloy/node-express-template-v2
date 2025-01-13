import { z } from 'zod';
import dayjs from 'dayjs';

export const ProfileIdSchema = z.string().uuid();

export const SavingsMetadataInputSchema = z.object({
    name: z.string().min(2).max(15),
    category_id: z.number(),
    target_amount: z.number().min(1),
    target_date: z.coerce.date().min(dayjs().add(1, 'day').toDate()),
    preferred_currency_id: z.number(),
    priority: z.boolean().optional(),
});

export const WalletOwnersInputSchema = z.object({
    wallet_type: z.enum(['savings', 'budget']),
    owner_type: z.enum(['contributor', 'creator', 'viewer']),
});

export const BudgetMetadataInputSchema = z.object({
    name: z.string().min(2).max(15),
    category_id: z.number(),
    assigned_amount: z.number().min(1),
    period: z.enum(['annually', 'daily', 'monthly', 'weekly']),
    preferred_currency_id: z.number(),
});
