import { EventEmitter } from 'events';

declare global { var eventEmitter: any; }
global.eventEmitter = new EventEmitter()

eventEmitter.on('eventName', async (data: string) => {

})

// // notification event call
// eventEmitter.emit('eventName', { data: 'data' })