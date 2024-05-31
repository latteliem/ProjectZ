export default class Business{
    busId: string;
    busName: string;
    busEmail: string;
    busDesc: string;
    constructor(ID, Name, Email, Description){
        this.busId = ID;
        this.busName = Name;
        this.busEmail = Email;
        this.busDesc = Description;
    }
}

