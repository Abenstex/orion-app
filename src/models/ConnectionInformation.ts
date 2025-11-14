class ConnectionInformation {
    port: string = '';
    ip: string = '';

    constructor(ip: string, port: string) {
        this.ip = ip;
        this.port = port;
    }

    toAddress(): string {
        return "http://" + this.ip + ":" + this.port
        //return 'http://localhost:8080';
    }
}

export default ConnectionInformation;