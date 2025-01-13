import dayjs from 'dayjs';

const isPeriodRefreshable = (
    period: 'daily' | 'weekly' | 'monthly' | 'annually',
    date: Date,
) => {
    switch (period) {
        case 'daily': {
            const d = dayjs(date).add(1, 'day').toDate();
            console.log(d);
            return dayjs().isAfter(d);
        }
        case 'weekly': {
            const d = dayjs(date).add(1, 'week').toDate();
            return dayjs().isAfter(d);
        }
        case 'monthly': {
            const d = dayjs(date).add(1, 'month').toDate();
            return dayjs().isAfter(d);
        }
        case 'annually': {
            const d = dayjs(date).add(1, 'year').toDate();
            return dayjs().isAfter(d);
        }
        default: {
            return false;
        }
    }
};

export default isPeriodRefreshable;
