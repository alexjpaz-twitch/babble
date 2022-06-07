import { useEffect } from 'react';

const ComfyJS = require("comfy.js");

let isStarted = false;

class BabblePlayer {

    constructor() {
        this.queue = [];
        this.isPlaying = false;
    }

    async nextQueue() {
        const word = this.queue.shift();

        const audio = new Audio();
        audio.src = `./sounds/${word}.wav`;


        const playPromise = new Promise((res, rej) => {
            audio.onended = res;
            audio.onerror = rej;
            audio.play();
          });
  
        try {
            await playPromise;
        } catch(e) {
            console.error("could not play", e);
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

       

        const babblePlayer = new BabblePlayer();

        ComfyJS.onCommand = ( user, command, message, flags, self, extra ) => {
            try {
                const words = [command].concat(message.split(" "));

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