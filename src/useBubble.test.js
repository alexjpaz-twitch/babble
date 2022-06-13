import { findAllByTestId } from '@testing-library/react';
import { BabblePlayer } from './useBabble';

const TEST_USER_1 = "TEST_USER_1";

let ComfyJSMock;
let messages = [];

beforeEach(() => {
    jest.resetModules();

    ComfyJSMock = {
        Init: jest.fn(),
        Say: jest.fn((message) => {
          messages.push(message);
        })
      };
      jest.doMock('comfy.js', () => {
        return ComfyJSMock;
      });
})

describe("BabblePlayer", () => {
    it('should construct', () => {
        new BabblePlayer();
    })

    it('should listen to chat', () => {
        new BabblePlayer();
    })

    describe('should listen to command', () => {

        let channel = "test_channel";

        let player;

        beforeEach(() => {

            player = new BabblePlayer({
                channel,
                triggerPrefix: "say",
                viponly: true,
            });

            player.enqueue = jest.fn();
            player.play = jest.fn();
        });

        test("basic", () => {
           
            const flags = {
                "broadcaster": true,
            };

            player.onCommand(TEST_USER_1, "say", "hello", flags);

            expect(player.enqueue).toBeCalledWith(["hello"]);
            expect(player.play).toBeCalled();
        });

        test("ignore", () => {
           
            const flags = {
                "broadcaster": true,
            };

            player.onCommand(TEST_USER_1, "NOT", "hello", flags);

            expect(player.enqueue).not.toBeCalled();
            expect(player.play).not.toBeCalled();
        });

        test("phrase", () => {
           
            const flags = {
                "broadcaster": true,
            };

            player.onCommand(TEST_USER_1, "say", "hello i, am ALEX.", flags);

            expect(player.enqueue).toBeCalledWith(["hello", "i", "am", "alex"]);
            expect(player.play).toBeCalled();
            
        });

        test("viponly (true)", () => {
           
            const flags = {
                "broadcaster": false,
                "vip": true,
            };

            player.onCommand(TEST_USER_1, "say", "test", flags);

            expect(player.play).toBeCalledTimes(1);
            
        });

        test("viponly (false)", () => {
           
            const flags = {
                "broadcaster": false,
                "vip": false,
            };

            player.onCommand(TEST_USER_1, "say", "test", flags);

            expect(player.play).toBeCalledTimes(0);
            
        });

        test("viponly (broadcaster)", () => {
           
            const flags = {
                "broadcaster": false,
                "vip": false,
            };

            player.onCommand(TEST_USER_1, "say", "test", flags);

            expect(player.play).toBeCalledTimes(0);
            
        });

        test("viponly (broadcaster)", () => {
           
            const flags = {
                "broadcaster": false,
            };

            player.onCommand(TEST_USER_1, "SaY", "test", flags);

            expect(player.play).toBeCalledTimes(1);
            
        });
    });

    describe('should listen to chat', () => {

        let channel = "test_channel";

        let player;

        beforeEach(() => {

            player = new BabblePlayer({
                channel,
                triggerPrefix: "say",
                viponly: true,
            });

            player.enqueue = jest.fn();
            player.play = jest.fn();
        });

        test("basic", () => {
           
            const flags = {
                "broadcaster": true,
            };

            player.onChat(TEST_USER_1, "say hello", flags);

            expect(player.enqueue).toBeCalledWith(["hello"]);
            expect(player.play).toBeCalled();
        });

        test("basic", () => {
           
            const flags = {
                "broadcaster": true,
            };

            player.onChat(TEST_USER_1, "say hello", flags);

            expect(player.enqueue).toBeCalledWith(["hello"]);
            expect(player.play).toBeCalled();

        });

        test("phrase", () => {
           
            const flags = {
                "broadcaster": true,
            };

            player.onChat(TEST_USER_1, "say hello i, am ALEX.", flags);

            expect(player.enqueue).toBeCalledWith(["hello", "i", "am", "alex"]);
            expect(player.play).toBeCalled();
            
        });


    });
    
    xit('should listen', () => {

        const channel = "test_channel";

        const player = new BabblePlayer({
            channel
        });

        player.start();

        expect(ComfyJSMock.Init).toHaveBeenCalledWith(channel);
    }) 
})