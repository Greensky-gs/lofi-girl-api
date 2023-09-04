import App from 'express';
import { anyChange, changeType, commentDelete, commentUpdate, register, stationAdd, stationRemove, stationRename } from '../typings/params';
import { Configs } from './Config';
import axios from 'axios';

export class Server {
    private port: string;
    private app = App();
    private configs = new Configs()

    constructor(port: number | string) {
        this.port = port.toString()

        this.start()
    }

    private register() {
        this.app.post('/register', (req, res) => {
            const content = req.body as register;
            const rep = this.configs.register({
                id: content.id,
                port: content.port.toString()
            })

            res.send({
                ok: true,
                code: 200,
                message: rep
            })
        })
    }
    private unregister() {
        this.app.post('/unregister', (req, res) => {
            const content = req.body as register;
            const rep = this.configs.unregister({
                id: content.id,
                port: content.port.toString()
            })

            return res.send({
                ok: true,
                code: 200,
                message: rep
            })
        })
    }
    private onConfig() {
        this.app.post('/config-edit', (req, res) => {
            const change = req.body as anyChange;
            const list = this.configs.connections.filter(x => x.id !== change.emitterId);
            const type = this.determineChangeType(change)

            list.forEach((connection) => {
                axios.post(`http://localhost:${connection.port}/config-edit`, {
                    ...change,
                    type
                }, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).catch(() => {});
            })
        })
    }
    private determineChangeType(change: anyChange): changeType | 'unknown' {
        if ((change as stationAdd)?.type) {
            return 'stationAdd'
        }
        if ((change as commentUpdate)?.comment) {
            return 'commentUpdate'
        }
        if ((change as commentDelete)?.userId) {
            return 'commentDelete'
        }
        if ((change as stationRename)?.name) {
            return 'stationRename'
        }
        if ((change as stationRemove)?.url) {
            return 'stationRemove'
        }
        return 'unknown';
    }
    private configRoutes() {
        this.register();
        this.unregister();
        this.onConfig();
    }
    private async start() {
        this.app.all('/', (req, res) => {
            res.send({
                ok: true,
                code: 200,
                message: 'Root'
            })
        })
        this.configRoutes();
        this.app.listen(this.port, () => {
            console.log(`API running on port ${this.port}`)
        })
    }
}