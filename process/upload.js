const API_LOGS = require('../helpers/logs')
const configs = require('../configs.json')
const API_HELPER = require('../helpers/api')
const UPLOADER_HELPER = require('../helpers/uploader')
const LOYALTY_ENTITIES = require('../entities/loyalty')
class uploadProcess {
    static uploadFileOms = async (query) => {
        const {order_date} = query
        try { 
            const {oms_url,oms_public_key,oms_key,oms_user_token,esb_url, esb_parcs_secret, esb_parcs_token} = configs
            const headers = {
                "x-user": oms_user_token,
                "Authorization": oms_key
            }
            const currentDate = order_date ? new Date(order_date) : new Date()
            console.log(order_date, currentDate, 'date');
            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`

            const params = {
                page: 1,
                per_page: 10000,
                fulfillment_type: "delivery,deliver later,pickup",
                history_date_to: `${date} 23:59:59`,
                history_date_from: `${date} 00:00:00`,
            }
            const result = await API_HELPER.performRequest(`${oms_url}/app/${oms_public_key}/order-export`, 'GET', headers, {}, params)
            console.log(result.data, 'oms orders');
            if (result && result.data && result.data.rows.length) {
                const customer_membership_code = result.data.rows.map(function(item){return item.customer_membership_code;});
                const loyalty = await LOYALTY_ENTITIES.getCustomer({ member_ids: customer_membership_code})
                console.log(loyalty, 'loyalty');
                for (let i = 0; i < result.data.rows.length; i++) {
                    const customer_membership = loyalty.filter(l=> l.cs_code == result.data.rows[i].customer_membership_code) 
                    result.data.rows[i].cs_parent = customer_membership.length > 0 ? String(customer_membership[0].cs_parent) : null
                }
                const export_data = result.data.rows.map(({description, shipping_details, ...rest})=> rest);
                const uploaded = await UPLOADER_HELPER.uploadFile('orders', export_data, esb_url, esb_parcs_secret, esb_parcs_token)
    
                return {
                    status: true,
                    data: uploaded,
                    message: 'File successfully uploaded!'
                }
            }
            else {
                return {
                    status: false,
                    data: {},
                    message: 'No data to upload!'
                }
            }
        } catch (err) {
            console.log(err, 'oms_data_err');
            return true
        }
    }

    static uploadFileCustomers = async (query) => {
        const {order_date, table_name} = query
        try { 
            const {oms_url,oms_public_key,oms_key,oms_user_token,idms_url,app_key,tenant_id,esb_url,esb_contacts_secret,esb_contacts_token} = configs
            const headers = {
                "x-app-key": tenant_id,
                "Authorization": app_key
            }
            const currentDate = order_date ? new Date(order_date) : new Date()
            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`

            const params = {
                page: 1,
                per_page: 10000,
                date_from: `${date} 00:00:00`,
                date_to: `${date} 23:59:59`,
            }

            const result = await API_HELPER.performRequest(`${idms_url}/applications/users/export`, 'GET', headers, {}, params)
            console.log(result.data, 'idms data');

            let oms_customers = await API_HELPER.performRequest(`${oms_url}/app/${oms_public_key}/export-table/order_customers`, 'GET', {"x-user": oms_user_token,"Authorization": oms_key}, {}, params)
            console.log(oms_customers, 'oms_customers');
            if (oms_customers && oms_customers.data && oms_customers.data.rows.length > 0) {
                oms_customers = oms_customers.data.rows.filter(l=> l.type == "Guest") 
            }
            console.log(oms_customers, 'oms_customers');
            if (result && result.data.length > 0 ) {
                let member = [], nonmember = []
                for (let i = 0; i < result.data.length; i++) {
                    const memresult =  result.data[i].user_metas.find(u => u.key == 'MembershipId')

                    if (memresult && memresult.value != undefined) {
                        member.push({
                            userType: 'Member',
                            cs_code: memresult.value, 
                            ...result.data[i]})
                    }
                    else {
                        nonmember.push({
                            userType: 'NonMember',
                            ...result.data[i]})
                    }
                }

                if (member.length > 0) {
                    const customer_membership_code = member.map(function(item){return item.cs_code;});
                    const loyalty = await LOYALTY_ENTITIES.getCustomer({ member_ids: customer_membership_code})

                    for (let i = 0; i < member.length; i++) {
                        const membership_details = loyalty.filter(l => l.cs_code == member[i].cs_code)
                        member[i] = { 
                            cs_code: membership_details.length > 0 ? membership_details[0].cs_code : '',
                            cs_custype: membership_details.length > 0 ? membership_details[0].cs_custype : '',
                            cs_status: membership_details.length > 0 ? membership_details[0].cs_status : '',
                            cs_gender: membership_details.length > 0 ? membership_details[0].cs_gender : '',
                            cs_nationality: membership_details.length > 0 ? membership_details[0].cs_nationality : '',
                            cs_memdate: membership_details.length > 0 ? membership_details[0].cs_memdate : '',
                            cs_expdate: membership_details.length > 0 ? membership_details[0].cs_expdate : '',
                            cs_crdate: membership_details.length > 0 ? membership_details[0].cs_crdate : '',
                            cs_lastupd: membership_details.length > 0 ? membership_details[0].cs_lastupd : '',
                            ...member[i]}
                    }
                }

                let uploaded = []
                if (member.length > 0) {
                    console.log(member, nonmember.length, 'users');
                    uploaded.push(await UPLOADER_HELPER.uploadFile('member', member, esb_url, esb_contacts_secret, esb_contacts_token))
                }

                if (nonmember.length > 0) {
                    uploaded.push(await UPLOADER_HELPER.uploadFile('nonmember', nonmember, esb_url, esb_contacts_secret, esb_contacts_token))
                }

                if (oms_customers.length > 0) {
                    uploaded.push(await UPLOADER_HELPER.uploadFile('guest', oms_customers, esb_url, esb_contacts_secret, esb_contacts_token))
                }

                return {
                    status: true,
                    data: uploaded,
                    message: 'File successfully uploaded!'
                }
            }

            return {
                status: false,
                data: {},
                message: 'No data to upload!'
            }
        } catch (err) {
            console.log(err, 'oms_data_err');
            return true
        }
    }
    
    static uploadFileSCIDOrders = async (query) => {
        const {order_date, table_name} = query
        try { 
            const {oms_url,oms_public_key,oms_key,oms_user_token,esb_url,esb_orders_secret,esb_orders_token} = configs
            const headers = {
                "x-user": oms_user_token,
                "Authorization": oms_key
            }
            const currentDate = order_date ? new Date(order_date) : new Date()
            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`

            const params = {
                page: 1,
                per_page: 10000,
                date_from: `${date} 00:00:00`,
                date_to: `${date} 23:59:59`,
            }
            let result = await API_HELPER.performRequest(`${oms_url}/app/${oms_public_key}/export-table/${table_name}`, 'GET', headers, {}, params)
                
            if (result && result.data.rows.length) {
                if (table_name == 'orders') {
                    for (let i = 0; i < result.data.rows.length; i++) {
                        result.data.rows[i] = {grand_total: result.data.rows[i].grand_total ? result.data.rows[i].grand_total : 0, ...result.data.rows[i]};
                    }
                }
                
                let export_data = result.data.rows.map((
                    {
                        description, 
                        platform_details,
                        ...rest
                    })=> rest);

                console.log(export_data, 'export_data');
                const uploaded = await UPLOADER_HELPER.uploadFile(table_name, export_data, esb_url, esb_orders_secret, esb_orders_token)
                
                return {
                    status: true,
                    data: uploaded,
                    message: 'File successfully uploaded!'
                }
            }
            
            return {
                status: false,
                data: {},
                message: 'No data to upload!'
            }
        } catch (err) {
            console.log(err, 'oms_data_err');
            return true
        }
    }
}

module.exports = uploadProcess
