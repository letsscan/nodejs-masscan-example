
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import EventEmitter from 'events';

const MASSCAN_PATH = 'masscan';

export interface MasscanOption {
    excludes?: string[],
    ranges: string[],
    ports: string,
    maxRate?: number,
    rate?: number
}

export interface Masscan extends EventEmitter {
    on(event: 'discover', callback: (ip: string, port: number) => void): this
    on(event: 'end', callback: () => void): this
}

export class Masscan extends EventEmitter {
    private masscanOption: MasscanOption;
    private child: ChildProcessWithoutNullStreams | undefined;
    public constructor(options: MasscanOption) {
        super();
        this.masscanOption = options;
    };
    public start() {
        const { ports, ranges, excludes, maxRate, rate } = this.masscanOption;

        this.child = spawn(MASSCAN_PATH, [
            '--interactive',
            ...(maxRate !== undefined ? [`--max-rate`, maxRate.toString()] : []),
            ...(rate !== undefined ? [`--rate`, rate.toString()] : []),
            `-p${ports}`,
            ...([] as string[]).concat(...(excludes ?? []).map(exclude => [`--exclude`, exclude])),
            ...ranges
        ]);

        let strBuffer = '';
        this.child.stdout.setEncoding('utf-8');
        this.child.stdout.on('data', data => {
            strBuffer += data;

            while(true) {
                const result = /Discovered open port (\d+)\/tcp on ([.0-9]+)/.exec(strBuffer);
                if(!result)
                    break;
        
                const [matchedStr, strPort, ip] = result;
                strBuffer = strBuffer.slice(result.index + matchedStr.length);
                const port = Number(strPort);
                this.emit('discover', ip, port);
            }
        });

        this.child.stdout!.on('close', () => {
            this.emit('end');
        });
    }
    stop() {
        this.child?.kill();
        this.child = undefined;
    }
}