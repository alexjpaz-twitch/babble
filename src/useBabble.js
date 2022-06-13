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
            if( word.trim() == '') return;

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

        if(triggerPrefix.startsWith("!")) {
            triggerPrefix = triggerPrefix.slice(1);
        }

        // Weird shit

        if(command !== triggerPrefix) {
            return;
        }


        if(!flags.broadcaster) {
            console.log(1,this.config.viponly && !flags.vip )
            if(this.config.viponly && flags.vip === false) {
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
        let triggerPrefix = this.config.triggerPrefix;

        if(triggerPrefix.startsWith("!")) {
          return;
        }

        if(!flags.broadcaster) {
            if(this.config.viponly && !flags.vip ) {
                return;
            }
        }

        try {
            let words = message
                .toLowerCase()
                .replace(/[\W_]+/g," ")
                .trim()
                .split(" ");

            if(words[0] !== this.config.triggerPrefix) {
                return;
            }

            words = words.slice(1);

            this.enqueue(words);

            this.play();
            
        } catch(e) {
            console.error(e);
        }
    }

    start() {
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

    }, []);

    return () => {
        babblePlayer.stop();
    };
}