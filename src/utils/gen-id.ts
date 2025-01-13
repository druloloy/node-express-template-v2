export const generateRandomID = (type: 'uuid' | 'bigint') => {
    if (type === 'uuid') {
        return crypto.randomUUID();
    }

    const length = 18;

    const min = BigInt('1' + '0'.repeat(length - 1));
    const max = BigInt('1' + '0'.repeat(length)) - BigInt(1);

    const range = max - min + BigInt(1);
    const random = BigInt(Math.floor(Math.random() * Number(range))) + min;

    return String(random);
};
