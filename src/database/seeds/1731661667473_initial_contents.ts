import type { Kysely } from 'kysely';
import { DB } from '../types.ts';
import { randomUUID } from 'node:crypto';

export async function seed(db: Kysely<DB>): Promise<void> {
    try {
        // clear out any existing data
        await db.insertInto('constants.categories')
            .values([
                { id: 1, name: '✈️ Travel' },
                { id: 2, name: '🚨 Emergency' },
                { id: 3, name: '🏠 Housing' },
                { id: 4, name: '🚗 Car' },
                { id: 5, name: '💰 Taxes' },
                { id: 6, name: '📱 Electronics' },
                { id: 7, name: '🎓 Education' },
                { id: 8, name: '💼 Retirement' },
                { id: 9, name: '🍽️ Food & Dining' },
                { id: 10, name: '🛍️ Shopping' },
                { id: 11, name: '🚍 Transportation' },
                { id: 12, name: '🎭 Entertainment' },
                { id: 13, name: '🛡️ Insurance' },
                { id: 14, name: '🧴 Personal Care' },
                { id: 15, name: '⚡ Utilities' },
                { id: 16, name: '🏥 Healthcare' },
                { id: 17, name: '📦 Miscellaneous' },
                { id: 18, name: '➕ Other' },
            ]).execute();

        await db.insertInto('constants.currencies')
            .values([
                { id: 1, name: 'United States Dollar', code: 'USD' },
                { id: 2, name: 'Philippine Peso', code: 'PHP' },
            ]).execute();
    } catch (error) {
        console.log('Already seeded constants!');
    }
    // Create sample profiles
    const profileIds = {
        admin: randomUUID(),
        user1: randomUUID(),
        user2: randomUUID(),
    };

    await db
        .insertInto('prosper.profiles')
        .values([
            {
                id: profileIds.admin,
                username: 'admin',
                name: 'System Admin',
                profile_url: 'https://example.com/admin',
                type: 'admin',
                auth_id: 'd06beb02-21e1-4267-9455-cdc3affab683',
            },
            {
                id: profileIds.user1,
                username: 'johndoe',
                name: 'John Doe',
                profile_url: 'https://example.com/john',
                type: 'user',
                auth_id: '69346583-dad1-4fa6-84f9-9d8eb3ab7134',
            },
            {
                id: profileIds.user2,
                username: 'janesmith',
                name: 'Jane Smith',
                profile_url: 'https://example.com/jane',
                type: 'user',
                auth_id: '7a1c66ba-6e74-4a54-a2c1-04c098082b21',
            },
        ])
        .execute();

    // Create sample savings metadata
    const savingsIds = {
        vacation: String(1),
        emergency: String(2),
        car: String(3),
    };

    await db
        .insertInto('prosper.savings_metadata')
        .values([
            {
                id: savingsIds.vacation,
                name: 'Vacation Fund',
                category_id: 1, // Assuming 1 is leisure category
                target_amount: String(5000),
                target_date: new Date('2024-12-31'),
                preferred_currency_id: 1, // Assuming 1 is USD
                priority: true,
            },
            {
                id: savingsIds.emergency,
                name: 'Emergency Fund',
                category_id: 2, // Assuming 2 is emergency category
                target_amount: String(10000),
                target_date: new Date('2024-12-31'),
                preferred_currency_id: 1,
                priority: true,
            },
            {
                id: savingsIds.car,
                name: 'Car Fund',
                category_id: 3, // Assuming 3 is transportation category
                target_amount: String(20000),
                target_date: new Date('2025-06-30'),
                preferred_currency_id: 1,
                priority: false,
            },
        ])
        .execute();

    // Create sample budget metadata
    const budgetIds = {
        groceries: String(1),
        utilities: String(2),
        entertainment: String(3),
    };

    await db
        .insertInto('prosper.budget_metadata')
        .values([
            {
                id: budgetIds.groceries,
                name: 'Groceries',
                category_id: 4, // Assuming 4 is food category
                assigned_amount: String(500),
                period: 'monthly', // Assuming 1 is monthly
                preferred_currency_id: 1,
            },
            {
                id: budgetIds.utilities,
                name: 'Utilities',
                category_id: 5, // Assuming 5 is utilities category
                assigned_amount: String(200),
                period: 'monthly',
                preferred_currency_id: 1,
            },
            {
                id: budgetIds.entertainment,
                name: 'Entertainment',
                category_id: 6, // Assuming 6 is entertainment category
                assigned_amount: String(150),
                period: 'weekly',
                preferred_currency_id: 1,
            },
        ])
        .execute();

    // Create transaction snapshots
    const snapshotIds = {
        snapshot1: String(1),
        snapshot2: String(2),
    };

    await db
        .insertInto('prosper.transaction_snapshots')
        .values([
            {
                id: snapshotIds.snapshot1,
                type: 'savings',
                wallet_id: 'SAV001',
                wallet_name: 'Vacation Fund',
                wallet_category_id: 1,
                wallet_currency_id: 1,
                wallet_owners: JSON.stringify([
                    profileIds.user1,
                    profileIds.user2,
                ]),
                amount: String(1000),
                updated_by_name: 'John Doe',
                updated_by_id: profileIds.user1,
                created_at: new Date(),
            },
            {
                id: snapshotIds.snapshot2,
                type: 'budget',
                wallet_id: 'BUD001',
                wallet_name: 'Groceries',
                wallet_category_id: 4,
                wallet_currency_id: 1,
                wallet_owners: JSON.stringify([
                    profileIds.user1,
                    profileIds.user2,
                ]),
                amount: String(500),
                updated_by_name: 'Jane Smith',
                updated_by_id: profileIds.user2,
                created_at: new Date(),
            },
        ])
        .execute();

    // Create transaction records
    await db
        .insertInto('prosper.transaction_records')
        .values([
            {
                id: String(1),
                snapshot_id: snapshotIds.snapshot1,
                old_amount: String(800),
                updated_by: profileIds.user1,
                created_at: new Date(),
            },
            {
                id: String(2),
                snapshot_id: snapshotIds.snapshot2,
                old_amount: String(400),
                updated_by: profileIds.user2,
                created_at: new Date(),
            },
        ])
        .execute();

    // Create wallet references
    const walletRefs = {
        ref1: String(1),
        ref2: String(2),
    };

    await db
        .insertInto('prosper.wallet_references')
        .values([
            {
                id: walletRefs.ref1,
                savings_wallet_id: savingsIds.vacation,
                budget_wallet_id: null,
            },
            {
                id: walletRefs.ref2,
                savings_wallet_id: null,
                budget_wallet_id: budgetIds.utilities,
            },
        ])
        .execute();

    // Create wallet amounts references
    const walletAmount = {
        am1: String(1),
        am2: String(2),
    };

    // Create wallet amounts
    await db
        .insertInto('prosper.wallet_amounts')
        .values([
            {
                id: walletAmount.am1,
                wallet_reference_id: walletAmount.am1,
                amount: String(300),
            },
            {
                id: walletAmount.am2,
                wallet_reference_id: walletAmount.am2,
                amount: String(5000),
            },
        ])
        .execute();

    // Create wallet owners
    await db
        .insertInto('prosper.wallet_owners')
        .values([
            {
                id: String(1),
                profile_id: profileIds.user1,
                wallet_type: 'savings',
                owner_type: 'creator',
                wallet_reference_id: walletRefs.ref1,
            },
            {
                id: String(2),
                profile_id: profileIds.user2,
                wallet_type: 'budget',
                owner_type: 'contributor',
                wallet_reference_id: walletRefs.ref2,
            },
        ])
        .execute();

    // Create partner invitations
    await db
        .insertInto('prosper.partner_invitations')
        .values([
            {
                id: String(1),
                type: 'savings',
                wallet_id: String(1),
                nonce: String(123456),
                expiration: new Date('2024-12-31'),
                sender_id: String(1),
                receiver_id: String(2),
            },
            {
                id: String(2),
                type: 'budget',
                wallet_id: String(2),
                nonce: String(654321),
                expiration: new Date('2024-12-31'),
                sender_id: String(2),
                receiver_id: String(1),
            },
        ])
        .execute();
}
