const fs = require('fs');
const path = require('path');
const http = require('http')

const root = path.dirname(__dirname)

interface Cam {
    CamaraID: string;
    Latitude: number;
    Logitude: number;
    ImageLink: string;
}

export class TrafficCam {
    datamall_host: string;
    trafficimg_path: string;
    private _lta_datamall_key: string;

    constructor() {
        this.datamall_host = 'datamall2.mytransport.sg';
        this.trafficimg_path = '/ltaodataservice/Traffic-Images';
        let lta_datamall_key_path = path.join(root, "secrets", "LTA_DATAMALL_KEY");
        this._lta_datamall_key = fs.readFileSync(lta_datamall_key_path, 'utf8').trim();
    }

    getAllCams(): Promise<Array<Cam>> {
        var cams = new Promise<Array<Cam>>((resolve, reject) => {
            let options = {
                hostname: this.datamall_host,
                path: this.trafficimg_path,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'AccountKey': this._lta_datamall_key
                }
            };
            console.log(options);
            var req = http.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`);
                res.setEncoding('utf8');
                var resStr = "";
                res.on('data', d => {
                    resStr += d;
                });
                res.on("end", function () {
                    let camsRaw = JSON.parse(resStr);
                    cams = camsRaw.value;
                    resolve(cams);
                });
            });

            req.on('error', error => {
                console.error(error);
                reject(error);
            });

            req.end();
        });
        return cams;
    }
}
