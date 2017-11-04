export default class Secrets {

    public SF_USER: string;
    public SF_PASSWORD: string;

    constructor(username: string, password: string) {
        this.SF_USER = username;
        this.SF_PASSWORD = password;
    }
}