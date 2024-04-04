import { Masscan } from "./Masscan.js";
import { EXCLUDE_IPS, KOREA_IPS } from "./consts.js";
import fetch from 'node-fetch';
import { pingJava } from '@minescope/mineping';

const RATE = 100;

// Find 80 Port server
function find80Port() {
    const masscan = new Masscan({
        ports: '80',
        ranges: KOREA_IPS,
        excludes: EXCLUDE_IPS,
        rate: RATE
    });
    
    masscan.on('discover', async (ip) => {
        console.log(ip);
    });
    
    masscan.start();
}

// Find available web server
function findWebServer() {
    const masscan = new Masscan({
        ports: '80',
        ranges: KOREA_IPS,
        excludes: EXCLUDE_IPS,
        rate: RATE
    });
    
    masscan.on('discover', async (ip) => {
        try {
            const response = await fetch('http://' + ip + ':80', { redirect: 'manual'});
            console.log(ip);
        } catch(e) {}
    });
    
    masscan.start();
}

// Find web server with video
function findWebServerWithVideo() {
    const masscan = new Masscan({
        ports: '80',
        ranges: KOREA_IPS,
        excludes: EXCLUDE_IPS,
        rate: RATE
    });
    
    masscan.on('discover', async (ip) => {
        try {
            const response = await fetch('http://' + ip + ':80', { redirect: 'manual'});
            const text = await response.text();
            if(!text.includes('<video')) return;
            console.log(ip);
        } catch(e) {}
    });
    
    masscan.start();
}

// Find minecraft server
function findMinecraftServer() {
    const masscan = new Masscan({
        ports: '25565',
        ranges: KOREA_IPS,
        excludes: EXCLUDE_IPS,
        rate: RATE
    });
    
    masscan.on('discover', async (ip) => {
        try {
            const r = await pingJava(ip);
            console.log(ip);
            console.log(r);
        } catch(e) {}
    });
    
    masscan.start();
}

// Find 

// Try to run one of:
// find80Port();
// findWebServer();
// findWebServerWithVideo();
// findMinecraftServer();