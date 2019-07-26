import urlJoin from 'url-join';

class Api {
    constructor () {
        this.apiLocation = document.location.hostname + ':8080';

        let eventCallbacks = [];

        this.on = (name, callback) => {
            if(!eventCallbacks.filter(item => item.name === name).length) {
                eventCallbacks.push({
                    name,
                    callback
                });
            }
        }

        this.event = (name, data) => {
            eventCallbacks.forEach(item => {
                if(item.name === name && item.callback instanceof Function) {
                    item.callback(data);
                }
            });
        }
        // if(document.location.hostname == 'localhost') {
        //     this.apiLocation = 'localhost';
        // }
        // else {
        //     this.apiLocation = '188.225.76.150';
        // }
    }

    sendRequest = (method, action = '', data = null) => {
        let option = {
            method,
            credentials: 'include'
        };
        
        if(data instanceof FormData) {
            option.body = data;
        }
        else if(/*(method === 'POST' || method === 'PUT') &&*/ data) {
            option.body = JSON.stringify(data);
            option.headers = { 'Content-Type': 'application/json; charset=utf-8' };
        }

        return fetch(urlJoin('http://' + this.getAPIFullPath(), action), option)
        .then(out => out.json())
        .then(data => {
            let out = {}, isAuth = false;
            
            if(data){
                if(!data.error) {
                    if(data.value) {
                        out = data.value;
                    }
                    
                    isAuth = true;
                }
                else {
                    if(data.isASCIIError) {
                        this.event('error', data.error);
                    }

                    throw data.error;
                }
            }

            out.isAuth = () => {
                return isAuth;
            };

            return out;
        });
    }

    get = (action) => {
        return this.sendRequest('GET', action);
    }

    post = (action, data) => {
        return this.sendRequest('POST', action, data);
    }

    put = (action, data) => {
        return this.sendRequest('PUT', action, data);
    }

    delete = (action, data) => {
        return this.sendRequest('DELETE', action, data);
    }

    user = () => {
        return this.get('user');
    }

    authenticate = (data) => {
        return this.post('/', data);
    }

    getAPIUrl = () => {
        return this.apiLocation;
    }

    getAPIFullPath = () => {
        return this.apiLocation + '/api';
    }
}

export default new Api();