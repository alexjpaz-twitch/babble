import { useEffect } from 'react';

const ComfyJS = require("comfy.js");

let isStarted = false;

export class BabblePlayer {

    constructor(config = window.BABBLE_CONFIG) {
        this.config = config;
        this.queue = [];
        this.isPlaying = false;
    }

    async playSound(word) {
        
        const audio = new Audio();

        const playPromise = new Promise((res, rej) => {
            audio.onended = res;
            audio.onerror = rej;
            audio.src = `./sounds/${word}.wav`;

            audio.play();
        });

        return playPromise;
    }

    async nextQueue() {
        const word = this.queue.shift();

        try {
            await this.playSound(word)
        } catch(e) {

            console.warn("failed to find word sound")

            try {
                await this.playSound("default");
            } catch(e) {
                console.warn("failed to find deafult sound")
            }
        }

        if(this.queue.length > 0) {
            return await this.nextQueue();
        } else {
            this.isPlaying = false;
        }
    }

    enqueue(words) {

        if(Array.isArray(words) === false) {
            words = [ words ];
        }

        words.forEach((word) => {
            if(!word) return;
            if( word.trim() === '') return;

            this.queue.push(word);   
        });

    };

    play() {
        if(!this.isPlaying) {
            this.isPlaying = true;
            this.nextQueue();
        }
    };

    onCommand(user, command, message, flags, self, extra) {

        let triggerPrefix = this.config.triggerPrefix;

        if(this.config.triggerPrefix.startsWith("!")) {
            triggerPrefix = this.config.triggerPrefix.slice(1);
        }

        if(command.toLowerCase() !== triggerPrefix.toLowerCase()) {
            return;
        }

        if(!flags.broadcaster) {
            if(this.config.viponly === true && flags.vip === false) {
                return;
            }
        }

        try {
            let words = message
                .toLowerCase()
                .replace(/[\W_]+/g," ")
                .trim()
                .split(" ");    

            this.enqueue(words);

            this.play();
            
        } catch(e) {
            console.error(e);
        }
    }

    onChat(user, message, flags, self, extra) {
        const words = message.split(" ");
        return this.onCommand(user, words[0], words.slice(1).join(" "), flags, self, extra);
    }

    start() {
        ComfyJS.onChat = this.onChat.bind(this);
        ComfyJS.onCommand = this.onCommand.bind(this);
        ComfyJS.Init( this.config.channel );
    }

    stop() {
        ComfyJS.Disconnect();
    }
}

export default function useBabble() { 

    const babblePlayer = new BabblePlayer();

    useEffect(() => {
        if(isStarted) {
            return;
        }
        
        if(!isStarted) {
            isStarted = true;
        }

        babblePlayer.start();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ ]);

    return () => {
        babblePlayer.stop();
    };
}