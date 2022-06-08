import { useEffect } from 'react';

const ComfyJS = require("comfy.js");

let isStarted = false;

class BabblePlayer {

    constructor() {
        this.queue = [];
        this.isPlaying = false;
    }

    async playSound(word) {
        console.log("playSound", word);
        
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
}

export default function useBabble() { 

    useEffect(() => {
        if(isStarted) {
            return;
        }
        
        if(!isStarted) {
            isStarted = true;
        }

        console.log(window.BABBLE_CONFIG)

        const babblePlayer = new BabblePlayer();

        ComfyJS.onChat = ( user, message, flags, self, extra ) => {

            console.log(message)

            try {
                let words = message.split(" ");

                console.log(words[0])

                if(words[0] !== window.BABBLE_CONFIG.triggerPrefix) {
                    return;
                }

                words = words.slice(1);

                console.log(words)

                babblePlayer.enqueue(words);

                babblePlayer.play();
                
            } catch(e) {
                console.error(e);
            }
        }

        ComfyJS.Init( window.BABBLE_CONFIG.channel );
    }, []);

    return () => {
        ComfyJS.Disconnect();
    };
}