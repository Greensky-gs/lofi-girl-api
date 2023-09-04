import { writeFileSync } from "node:fs";
import { connection } from "../typings/connections";

export class Configs {
    private list: connection[] = []

    constructor() {
        this.start()
    }
    public get connections() {
        return this.list;
    }
    public findConnection(connection: connection) {
        return this.list.find(x => x.id === connection.id && x.port === connection.port)
    }
    public register(connection: connection) {
        if (!!this.findConnection(connection)) return 'already registered'
        this.list.push(connection)

        this.save()
        return 'ok'
    }
    public unregister(connection: connection) {
        if (!this.findConnection(connection)) return 'not registered'
        this.list = this.list.filter(x => !(x.port === connection.port && x.id === connection.id));

        this.save();
        return 'ok'
    }
    private save() {
        writeFileSync('./dist/data/urls.json', JSON.stringify(this.list));
    }
    private start() {
        const datas = require('../data/urls.json');
        this.list = datas;
    }
}