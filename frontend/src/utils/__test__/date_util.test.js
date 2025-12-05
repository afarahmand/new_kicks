import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  convertMonthShortToLong,
  convertMonthShortToNumStr,
  daysRemainingUntilEnd,
  formatAsMonthDDYYYY,
  formatAsYYYYMMDD
} from '../date_util';

describe('date_utils', () => {
    describe('convertMonthShortToLong', () => {
        const testCases = [
            { short: 'Jan', expected: 'January' },
            { short: 'Feb', expected: 'February' },
            { short: 'Mar', expected: 'March' },
            { short: 'Apr', expected: 'April' },
            { short: 'May', expected: 'May' },
            { short: 'Jun', expected: 'June' },
            { short: 'Jul', expected: 'July' },
            { short: 'Aug', expected: 'August' },
            { short: 'Sep', expected: 'September' },
            { short: 'Oct', expected: 'October' },
            { short: 'Nov', expected: 'November' },
            { short: 'Dec', expected: 'December' }
        ];

        testCases.forEach(({ short, expected }) => {
            it(`converts ${short} to ${expected}`, () => {
                expect(convertMonthShortToLong(short)).toBe(expected);
            });
        });

        it('returns undefined for invalid month abbreviation', () => {
            expect(convertMonthShortToLong('Invalid')).toBeUndefined();
            expect(convertMonthShortToLong('')).toBeUndefined();
            expect(convertMonthShortToLong('jan')).toBeUndefined(); // lowercase
        });
    });

    describe('convertMonthShortToNumStr', () => {
        const testCases = [
            { short: 'Jan', expected: '01' },
            { short: 'Feb', expected: '02' },
            { short: 'Mar', expected: '03' },
            { short: 'Apr', expected: '04' },
            { short: 'May', expected: '05' },
            { short: 'Jun', expected: '06' },
            { short: 'Jul', expected: '07' },
            { short: 'Aug', expected: '08' },
            { short: 'Sep', expected: '09' },
            { short: 'Oct', expected: '10' },
            { short: 'Nov', expected: '11' },
            { short: 'Dec', expected: '12' }
        ];

        testCases.forEach(({ short, expected }) => {
            it(`converts ${short} to ${expected}`, () => {
                expect(convertMonthShortToNumStr(short)).toBe(expected);
            });
        });

        it('returns undefined for invalid month abbreviation', () => {
            expect(convertMonthShortToNumStr('Invalid')).toBeUndefined();
            expect(convertMonthShortToNumStr('')).toBeUndefined();
            expect(convertMonthShortToNumStr('jan')).toBeUndefined(); // lowercase
        });
    });

    describe('daysRemainingUntilEnd', () => {
        beforeEach(() => {
            // Mock the current date to 2024-01-15
            const mockDate = new Date('2024-01-15T12:00:00Z');
            vi.useFakeTimers();
            vi.setSystemTime(mockDate);
        });
        
        afterEach(() => {
            // Restore original Date
            vi.useRealTimers();
        });
        
        it('should calculate correct remaining days for future date', () => {
            const endDate = '2024-01-25T00:00:00Z';
            const result = daysRemainingUntilEnd(endDate);
            expect(result).toBe(9); // Jan 25 - Jan 15 = 9 days (partial days are round down)
        });
        
        it('should calculate correct remaining days for same day', () => {
            const endDate = '2024-01-15T23:59:59Z';
            const result = daysRemainingUntilEnd(endDate);
            expect(result).toBe(-1); // Same day
        });
        
        it('should calculate negative days for past date', () => {
            const endDate = '2024-01-10T00:00:00Z';
            const result = daysRemainingUntilEnd(endDate);
            expect(result).toBe(-6); // Jan 10 - Jan 15 = -6 days
        });
        
        it('should handle end of month correctly', () => {
            const endDate = '2024-02-01T00:00:00Z';
            const result = daysRemainingUntilEnd(endDate);
            expect(result).toBe(16); // Feb 1 - Jan 15 = 17 days
        });
        
        it('should handle leap year correctly', () => {
            // Temporarily change the mock date for this test
            vi.setSystemTime(new Date('2024-02-28T12:00:00Z'));
            
            const endDate = '2024-03-01T00:00:00Z';
            const result = daysRemainingUntilEnd(endDate);
            expect(result).toBe(1); // Feb 28 to Mar 1 (leap year has Feb 29)
        });
        
        it('should handle string without time component', () => {
            const endDate = '2024-01-20';
            const result = daysRemainingUntilEnd(endDate);
            expect(result).toBe(4); // Jan 20 - Jan 15 = 4 days
        });
        
        it('should use Math.floor to round down', () => {
            // Set time to middle of the day
            vi.setSystemTime(new Date('2024-01-15T14:30:00Z'));
            
            const endDate = '2024-01-16T10:00:00Z';
            const result = daysRemainingUntilEnd(endDate);
            
            // With Math.floor:
            // diff = ~0.81 days (less than 1 full day)
            // Math.floor(~0.81) = 0
            expect(result).toBe(0);
        });
    });

    describe('formatAsMonthDDYYYY', () => {
        it('formats date string correctly', () => {
            const dateString = 'Tue Feb 20 2018 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsMonthDDYYYY(dateString);
            
            expect(result).toBe('February 20, 2018');
        });

        it('handles single-digit days without leading zero', () => {
            const dateString = 'Sat Mar 03 2018 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsMonthDDYYYY(dateString);
            
            expect(result).toBe('March 3, 2018');
        });

        it('handles double-digit days correctly', () => {
            const dateString = 'Thu Dec 25 2024 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsMonthDDYYYY(dateString);
            
            expect(result).toBe('December 25, 2024');
        });

        it('handles different years correctly', () => {
            const dateString = 'Mon Jan 01 2024 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsMonthDDYYYY(dateString);
            
            expect(result).toBe('January 1, 2024');
        });

        it('handles all months correctly', () => {
            const testCases = [
                { input: 'Mon Jan 15 2024 12:00:00 GMT-0500', expected: 'January 15, 2024' },
                { input: 'Thu Feb 15 2024 12:00:00 GMT-0500', expected: 'February 15, 2024' },
                { input: 'Fri Mar 15 2024 12:00:00 GMT-0500', expected: 'March 15, 2024' },
                { input: 'Mon Apr 15 2024 12:00:00 GMT-0500', expected: 'April 15, 2024' },
                { input: 'Wed May 15 2024 12:00:00 GMT-0500', expected: 'May 15, 2024' },
                { input: 'Sat Jun 15 2024 12:00:00 GMT-0500', expected: 'June 15, 2024' },
                { input: 'Mon Jul 15 2024 12:00:00 GMT-0500', expected: 'July 15, 2024' },
                { input: 'Thu Aug 15 2024 12:00:00 GMT-0500', expected: 'August 15, 2024' },
                { input: 'Sun Sep 15 2024 12:00:00 GMT-0500', expected: 'September 15, 2024' },
                { input: 'Tue Oct 15 2024 12:00:00 GMT-0500', expected: 'October 15, 2024' },
                { input: 'Fri Nov 15 2024 12:00:00 GMT-0500', expected: 'November 15, 2024' },
                { input: 'Sun Dec 15 2024 12:00:00 GMT-0500', expected: 'December 15, 2024' }
            ];

            testCases.forEach(({ input, expected }) => {
                expect(formatAsMonthDDYYYY(input)).toBe(expected);
            });
        });

        it('handles malformed date string', () => {
            // This will likely throw or produce unexpected results
            // since it relies on specific string slicing
            expect(() => formatAsMonthDDYYYY('invalid date')).toThrow();
        });
    });

    describe('formatAsYYYYMMDD', () => {
        it('formats date string correctly with single-digit day', () => {
            const dateString = 'Tue Feb 05 2018 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsYYYYMMDD(dateString);
            
            expect(result).toBe('2018-02-05');
        });

        it('formats date string correctly with double-digit day', () => {
            const dateString = 'Tue Feb 20 2018 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsYYYYMMDD(dateString);
            
            expect(result).toBe('2018-02-20');
        });

        it('pads single-digit days with leading zero', () => {
            const dateString = 'Sat Mar 03 2018 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsYYYYMMDD(dateString);
            
            expect(result).toBe('2018-03-03');
        });

        it('handles all months correctly with correct two-digit format', () => {
            const testCases = [
                { input: 'Mon Jan 15 2024 12:00:00 GMT-0500', expected: '2024-01-15' },
                { input: 'Thu Feb 15 2024 12:00:00 GMT-0500', expected: '2024-02-15' },
                { input: 'Fri Mar 15 2024 12:00:00 GMT-0500', expected: '2024-03-15' },
                { input: 'Mon Apr 15 2024 12:00:00 GMT-0500', expected: '2024-04-15' },
                { input: 'Wed May 15 2024 12:00:00 GMT-0500', expected: '2024-05-15' },
                { input: 'Sat Jun 15 2024 12:00:00 GMT-0500', expected: '2024-06-15' },
                { input: 'Mon Jul 15 2024 12:00:00 GMT-0500', expected: '2024-07-15' },
                { input: 'Thu Aug 15 2024 12:00:00 GMT-0500', expected: '2024-08-15' },
                { input: 'Sun Sep 15 2024 12:00:00 GMT-0500', expected: '2024-09-15' },
                { input: 'Tue Oct 15 2024 12:00:00 GMT-0500', expected: '2024-10-15' },
                { input: 'Fri Nov 15 2024 12:00:00 GMT-0500', expected: '2024-11-15' },
                { input: 'Sun Dec 15 2024 12:00:00 GMT-0500', expected: '2024-12-15' }
            ];

            testCases.forEach(({ input, expected }) => {
                expect(formatAsYYYYMMDD(input)).toBe(expected);
            });
        });

        it('handles different years correctly', () => {
            const dateString = 'Mon Jan 01 2024 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsYYYYMMDD(dateString);
            
            expect(result).toBe('2024-01-01');
        });

        it('handles date at beginning of month', () => {
            const dateString = 'Wed May 01 2024 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsYYYYMMDD(dateString);
            
            expect(result).toBe('2024-05-01');
        });

        it('handles date at end of month', () => {
            const dateString = 'Fri May 31 2024 12:00:00 GMT-0500 (Eastern Standard Time)';
            const result = formatAsYYYYMMDD(dateString);
            
            expect(result).toBe('2024-05-31');
        });
    });
});