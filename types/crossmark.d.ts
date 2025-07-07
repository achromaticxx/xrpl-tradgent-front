// types/crossmark.d.ts

declare module '@crossmarkio/sdk' {
  // 실제 SDK는 Sdk 인스턴스(Proxy)로 export됨
  interface Session {
    address?: string;
    isOpen: boolean;
    // ... 기타 속성 생략
  }
  interface Events {
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
  }
  interface Methods {
    signInAndWait(): Promise<any>;
    isConnected(): Promise<boolean>;
    signout?(): void;
    // ... 기타 메서드 생략
  }
  interface SdkInstance {
    session: Session;
    events: Events;
    methods: Methods;
  }
  const sdk: SdkInstance;
  export default sdk;
}
