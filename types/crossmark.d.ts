// types/crossmark.d.ts

declare module '@crossmarkio/sdk' {
  export class Crossmark {
    static on(event: string, callback: (...args: any[]) => void): void;
    static off(event: string): void;
    static connect(): Promise<void>;
    static disconnect(): void;
    static isConnected(): Promise<boolean>;
    static account: { address: string };
  }
}
