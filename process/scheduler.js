const SCHEDULER = require('node-schedule')
const cron = require('../index')
const configs = require('../configs.json')
const API_HELPER = require('../helpers/api')

const scheduleOrdersLoyalty = () => {
    const schedule = configs.parcs_schedule
    console.log('Running scheduler');
    return SCHEDULER.scheduleJob(`${schedule.split(':')[1]} ${schedule.split(':')[0]} * * *`, async function () {
        console.log('checking');
        const results = await API_HELPER.performRequest(`${configs.url}/upload-files`, 'POST', {}, {})
        return results
    })
}

const scheduleContactsSCID = () => {
    const schedule = configs.scid_contacts_schedule
    console.log('Running scheduler');
    return SCHEDULER.scheduleJob(`${schedule.split(':')[1]} ${schedule.split(':')[0]} * * *`, async function () {
        console.log('checking');
        const results = await API_HELPER.performRequest(`${configs.url}/upload-files-scid-contacts`, 'POST', {}, {})
        return results
    })
}

const scheduleOrdersSCID = () => {
    const schedule = configs.scid_orders_schedule
    console.log('Running scheduler');
    return SCHEDULER.scheduleJob(`${schedule.split(':')[1]} ${schedule.split(':')[0]} * * *`, async function () {
        let results = []
        for (let i = 0; i < configs.oms_table.length; i++) {
            results.push(await API_HELPER.performRequest(`${configs.url}/upload-files-scid-orders?table_name=${configs.oms_table[i]}`, 'POST', {}, {}))
        }
        console.log(results, 'results');
        return results
    })
}


module.exports = {
    scheduleOrdersLoyalty,
    scheduleContactsSCID,
    scheduleOrdersSCID
}