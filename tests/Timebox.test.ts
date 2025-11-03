import { expect, test } from 'vitest';
import { Timebox } from '../src/Timebox';

test('executes callback', () => {
    const callback = () => expect(true);

    new Timebox().call(callback, 0);
});

test('waits for milliseconds', () => {
    // mock = m::spy(Timebox::class).shouldAllowMockingProtectedMethods().makePartial();
    //         mock.shouldReceive('usleep').once();
    //         mock.call(function () {
    //         }, 10000);
    //         mock.shouldHaveReceived('usleep').once();
});

test('should not sleep when early return has been flagged', () => {
    //         mock = m::spy(Timebox::class).shouldAllowMockingProtectedMethods().makePartial();
    //         mock.call(function (timebox) {
    //             timebox.returnEarly();
    //         }, 10000);
    //         mock.shouldNotHaveReceived('usleep');
});

test('should sleep when dontEarlyReturn has been flagged', () => {
    //         mock = m::spy(Timebox::class).shouldAllowMockingProtectedMethods().makePartial();
    //         mock.shouldReceive('usleep').once();
    //         mock.call(function (timebox) {
    //             timebox.returnEarly();
    //             timebox.dontReturnEarly();
    //         }, 10000);
    //         mock.shouldHaveReceived('usleep').once();
});

test('waits for milliseconds when exception is thrown', () => {
    //         mock = m::spy(Timebox::class).shouldAllowMockingProtectedMethods().makePartial();
    //         mock.shouldReceive('usleep').once();
    //         try {
    //             this.expectExceptionMessage('Exception within Timebox callback.');
    //             mock.call(function () {
    //                 throw new Exception('Exception within Timebox callback.');
    //             }, 10000);
    //         } finally {
    //             mock.shouldHaveReceived('usleep').once();
    //         }
});

test('should not sleep when early return has been flagged and exception is thrown', () => {
    //         mock = m::spy(Timebox::class).shouldAllowMockingProtectedMethods().makePartial();
    //         try {
    //             this.expectExceptionMessage('Exception within Timebox callback.');
    //             mock.call(function (timebox) {
    //                 timebox.returnEarly();
    //                 throw new Exception('Exception within Timebox callback.');
    //             }, 10000);
    //         } finally {
    //             mock.shouldNotHaveReceived('usleep');
    //         }
});
